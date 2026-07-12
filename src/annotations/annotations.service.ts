import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';
import type { Response } from 'express';
import {
  AnnotationExportAllUsersQueryDto,
  AnnotationExportQueryDto,
  AnnotationHistoryQueryDto,
} from './dto/annotation-history-query-dto';

import { RelationType } from './enums/relation-type.enum';
import { SubmitAnnotationDto } from './dto/submit-annotation.dto';
import { Annotations, AnnotationsDocument } from './schema/annotation.schema';
import {
  Annotator,
  AnnotatorDocument,
} from '../annotators/schema/annotators.schema';
import {
  Transactions,
  TransactionsDocument,
} from '../transactions/schemas/transaction.schema';
import { TransactionStatus } from '../transactions/enums/transaction-status.enum';
import { Items, ItemsDocument } from '../items/schemas/item.schema';
import { CorrelationStatus } from './enums/correlation-status.enum';
import { calculatePercentage, getPagination } from '../common/utils';
import { buildAnnotationFilter } from './config';
import {
  convertAnnotationsToCsv,
  filterBundlesByQuery,
  formatSubmittedBundles,
  validateSubmittedBundles,
} from './helpers';

@Injectable()
export class AnnotationsService {
  constructor(
    @InjectModel(Annotations.name)
    private readonly annotationsModel: Model<AnnotationsDocument>,

    @InjectModel(Annotator.name)
    private readonly annotatorModel: Model<AnnotatorDocument>,

    @InjectModel(Transactions.name)
    private readonly transactionModel: Model<TransactionsDocument>,

    @InjectModel(Items.name)
    private readonly itemsModel: Model<ItemsDocument>,

    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  getRelationTypes() {
    return [
      {
        key: RelationType.SIMILARITY,
        label: 'Similarity',
        description: 'Barang yang mirip atau dapat saling menggantikan.',
      },
      {
        key: RelationType.COMPLEMENTARY,
        label: 'Complementary',
        description: 'Barang yang saling melengkapi.',
      },
      {
        key: RelationType.CONTEXTUAL,
        label: 'Contextual',
        description: 'Barang yang berkaitan berdasarkan situasi tertentu.',
      },
      {
        key: RelationType.EVENT,
        label: 'Event',
        description: 'Barang yang berkaitan berdasarkan momen tertentu.',
      },
    ];
  }

  async submitAnnotation(annotatorId: string, dto: SubmitAnnotationDto) {
    const annotator = await this.annotatorModel.findById(annotatorId);

    if (!annotator) {
      throw new NotFoundException('Annotator not found');
    }

    if (annotator.completed_tasks.includes(dto.transaction_id)) {
      throw new ConflictException('Transaction already annotated');
    }

    const transaction = await this.transactionModel
      .findById(dto.transaction_id)
      .lean();

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    if (
      transaction.status !== TransactionStatus.ASSIGNED ||
      transaction.assigned_by !== annotatorId
    ) {
      throw new BadRequestException(
        'Transaction is not assigned to this annotator',
      );
    }

    const transactionItemIds = Object.keys(
      transaction.list_of_interaction_items ?? {},
    );

    validateSubmittedBundles(dto, transactionItemIds);

    const session = await this.connection.startSession();
    let annotation: AnnotationsDocument;

    try {
      session.startTransaction();
      annotation = await this.persistAnnotation(annotatorId, dto, session);
      await session.commitTransaction();
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }

      if (!this.isTransactionUnsupported(error)) {
        throw error;
      }

      annotation = await this.persistAnnotation(annotatorId, dto);
    } finally {
      await session.endSession();
    }

    return {
      message: 'Annotation submitted successfully',
      data: {
        _id: annotation._id,
        transaction_id: annotation.transaction_id,
        annotator_id: annotation.annotator_id,
        bundles: annotation.bundles,
        createdAt: annotation.createdAt,
        updatedAt: annotation.updatedAt,
      },
    };
  }

  private async persistAnnotation(
    annotatorId: string,
    dto: SubmitAnnotationDto,
    session?: ClientSession,
  ) {
    const options = session ? { session } : {};
    const annotation = new this.annotationsModel({
      transaction_id: dto.transaction_id,
      annotator_id: annotatorId,
      bundles: formatSubmittedBundles(dto.bundles),
    });

    await annotation.save(options);

    await this.annotatorModel.updateOne(
      { _id: annotatorId },
      {
        $addToSet: { completed_tasks: dto.transaction_id },
        $pull: { current_batch: dto.transaction_id },
        $inc: { total_annotated: 1 },
      },
      options,
    );

    await this.transactionModel.updateOne(
      { _id: dto.transaction_id },
      {
        $set: {
          status: TransactionStatus.ANNOTATED,
          annotated_at: new Date(),
        },
      },
      options,
    );

    return annotation;
  }

  private isTransactionUnsupported(error: unknown) {
    if (!error || typeof error !== 'object' || !('code' in error)) {
      return false;
    }

    const code = (error as { code?: unknown }).code;

    return code === 20 || code === 303;
  }

  async getHistory(query: AnnotationHistoryQueryDto) {
    const filter = buildAnnotationFilter(query);
    const { page, limit, skip } = getPagination(query);

    const annotations = await this.annotationsModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const filteredAnnotations = filterBundlesByQuery(annotations, query);

    const flattenedData = filteredAnnotations.flatMap((annotation) =>
      (annotation.bundles ?? []).map((bundle) => ({
        _id: annotation._id,
        transaction_id: annotation.transaction_id,
        annotator_id: annotation.annotator_id,
        bundle_id: bundle.bundle_id,
        items: bundle.items,
        correlation_status: bundle.correlation_status,
        relation_type: bundle.relation_type,
        context: bundle.context ?? null,
        reasoning: bundle.reasoning,
        createdAt: annotation.createdAt,
        updatedAt: annotation.updatedAt,
      })),
    );

    const paginatedData = flattenedData.slice(skip, skip + limit);

    const data = await this.attachItemMetadataToHistoryRows(paginatedData);

    return {
      message: 'Success',
      data,
      pagination: {
        total: flattenedData.length,
        page,
        limit,
        total_page: Math.ceil(flattenedData.length / limit),
      },
    };
  }

  async exportAnnotations(query: AnnotationExportQueryDto, res: Response) {
    return this.sendAnnotationsExport(query, res, 'annotations-export');
  }

  async exportAllUsersAnnotations(
    query: AnnotationExportAllUsersQueryDto,
    res: Response,
  ) {
    const { annotator_id: _annotatorId, ...exportQuery } =
      query as AnnotationExportQueryDto;

    return this.sendAnnotationsExport(
      exportQuery,
      res,
      'annotations-all-users-export',
    );
  }

  private async sendAnnotationsExport(
    query: AnnotationExportQueryDto,
    res: Response,
    filenamePrefix: string,
  ) {
    const format = query.format ?? 'json';
    const filter = buildAnnotationFilter(query);

    const annotations = await this.annotationsModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const data = filterBundlesByQuery(annotations, query);
    const filename = `${filenamePrefix}-${Date.now()}`;

    if (format === 'csv') {
      const csv = convertAnnotationsToCsv(data);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}.csv"`,
      );

      return res.send(csv);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}.json"`,
    );

    return res.send(JSON.stringify(data, null, 2));
  }

  async getAnnotationDetail(id: string) {
    const annotation = await this.annotationsModel.findById(id).lean();

    if (!annotation) {
      throw new NotFoundException('Annotation not found');
    }

    const [annotationWithMetadata] = await this.attachItemMetadataToAnnotations(
      [annotation],
    );

    return annotationWithMetadata;
  }

  async getBundleDetail(annotationId: string, bundleId: string) {
    const annotation = await this.annotationsModel
      .findById(annotationId)
      .lean();

    if (!annotation) {
      throw new NotFoundException('Annotation not found');
    }

    const bundle = annotation.bundles.find((b) => b.bundle_id === bundleId);

    if (!bundle) {
      throw new NotFoundException('Bundle not found');
    }

    const items = await this.itemsModel
      .find({ _id: { $in: bundle.items } })
      .lean();

    const itemMap = new Map(items.map((item) => [item._id, item]));

    return {
      _id: annotation._id,
      transaction_id: annotation.transaction_id,
      annotator_id: annotation.annotator_id,
      bundle_id: bundle.bundle_id,
      items: bundle.items.map((itemId) => ({
        item_id: itemId,
        metadata: itemMap.get(itemId) ?? null,
      })),
      correlation_status: bundle.correlation_status,
      relation_type: bundle.relation_type,
      context: bundle.context ?? null,
      reasoning: bundle.reasoning,
      createdAt: annotation.createdAt,
      updatedAt: annotation.updatedAt,
    };
  }

  async getCorrelationDistribution() {
    const result = await this.annotationsModel.aggregate([
      { $unwind: '$bundles' },
      {
        $group: {
          _id: '$bundles.correlation_status',
          total: { $sum: 1 },
        },
      },
    ]);

    const totalBundles = result.reduce((sum, item) => sum + item.total, 0);

    const correlated =
      result.find((item) => item._id === CorrelationStatus.CORRELATED)?.total ??
      0;

    const notCorrelated =
      result.find((item) => item._id === CorrelationStatus.NOT_CORRELATED)
        ?.total ?? 0;

    return {
      message: 'Success',
      data: {
        total: totalBundles,
        correlated: {
          total: correlated,
          percentage: calculatePercentage(correlated, totalBundles),
        },
        not_correlated: {
          total: notCorrelated,
          percentage: calculatePercentage(notCorrelated, totalBundles),
        },
      },
    };
  }

  async getSummaryStatistics() {
    const annotations = await this.annotationsModel.find().lean();

    const annotatedItems = new Set<string>();

    annotations.forEach((annotation) => {
      annotation.bundles.forEach((bundle) => {
        bundle.items.forEach((itemId) => {
          annotatedItems.add(itemId);
        });
      });
    });

    const itemIds = [...annotatedItems];

    const items = await this.itemsModel
      .find({
        _id: { $in: itemIds },
      })
      .lean();

    const categories = new Set(
      items.map((item) => item.attributes?.category).filter(Boolean),
    );

    return {
      message: 'Success',
      data: {
        total_annotations: annotations.reduce(
          (sum, annotation) => sum + annotation.bundles.length,
          0,
        ),
        total_items: itemIds.length,
        total_categories: categories.size,
      },
    };
  }

  private async attachItemMetadataToAnnotations(annotations: any[]) {
    const itemIds = [
      ...new Set(
        annotations.flatMap((annotation) =>
          (annotation.bundles ?? []).flatMap((bundle) => bundle.items ?? []),
        ),
      ),
    ];

    const items = await this.itemsModel.find({ _id: { $in: itemIds } }).lean();

    const itemMap = new Map(items.map((item) => [item._id, item]));

    return annotations.map((annotation) => ({
      ...annotation,
      bundles: (annotation.bundles ?? []).map((bundle) => ({
        ...bundle,
        items: (bundle.items ?? []).map((itemId) => ({
          item_id: itemId,
          metadata: itemMap.get(itemId) ?? null,
        })),
      })),
    }));
  }

  private async attachItemMetadataToHistoryRows(rows: any[]) {
    const itemIds = [...new Set(rows.flatMap((row) => row.items ?? []))];

    const items = await this.itemsModel.find({ _id: { $in: itemIds } }).lean();

    const itemMap = new Map(items.map((item) => [item._id, item]));

    return rows.map((row) => ({
      ...row,
      items: (row.items ?? []).map((itemId) => ({
        item_id: itemId,
        metadata: itemMap.get(itemId) ?? null,
      })),
    }));
  }
}
