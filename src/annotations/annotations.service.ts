import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import type { Response } from 'express';
import { AnnotationHistoryQueryDto } from './dto/annotation-history-query-dto';

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

    for (const [index, bundle] of dto.bundles.entries()) {
      const uniqueItems = new Set(bundle.items);

      if (uniqueItems.size !== bundle.items.length) {
        throw new BadRequestException(
          `Bundle ${`B${String(index + 1).padStart(3, '0')}`} contains duplicate items`,
        );
      }

      for (const itemId of bundle.items) {
        if (!transactionItemIds.includes(itemId)) {
          throw new BadRequestException(
            `Item ${itemId} does not exist in transaction ${dto.transaction_id}`,
          );
        }
      }

      if (!bundle.reasoning || bundle.reasoning.trim().length < 5) {
        throw new BadRequestException(
          `Reasoning is required for bundle ${`B${String(index + 1).padStart(3, '0')}`}`,
        );
      }
    }

    const session = await this.connection.startSession();

    try {
      session.startTransaction();

      const formattedBundles = dto.bundles.map((bundle, index) => ({
        bundle_id: `B${String(index + 1).padStart(3, '0')}`,
        items: bundle.items,
        correlation_status: bundle.correlation_status,
        relation_type: bundle.relation_type,
        context: bundle.context ?? null,
        reasoning: bundle.reasoning.trim(),
      }));

      const annotation = new this.annotationsModel({
        transaction_id: dto.transaction_id,
        annotator_id: annotatorId,
        bundles: formattedBundles,
      });

      await annotation.save({ session });

      await this.annotatorModel.updateOne(
        { _id: annotatorId },
        {
          $addToSet: {
            completed_tasks: dto.transaction_id,
          },
          $pull: {
            current_batch: dto.transaction_id,
          },
          $inc: {
            total_annotated: 1,
          },
        },
        { session },
      );

      await this.transactionModel.updateOne(
        { _id: dto.transaction_id },
        {
          $set: {
            status: TransactionStatus.ANNOTATED,
            annotated_at: new Date(),
          },
        },
        { session },
      );

      await session.commitTransaction();

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
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  private buildAnnotationFilter(query: AnnotationHistoryQueryDto) {
    const filter: any = {};

    if (query.transaction_id) {
      filter.transaction_id = query.transaction_id;
    }

    if (query.annotator_id) {
      filter.annotator_id = query.annotator_id;
    }

    if (query.relation_type) {
      filter['bundles.relation_type'] = query.relation_type;
    }

    if (query.correlation_status) {
      filter['bundles.correlation_status'] = query.correlation_status;
    }

    if (query.search) {
      const regex = new RegExp(query.search, 'i');

      filter.$or = [
        { transaction_id: regex },
        { 'bundles.reasoning': regex },
        { 'bundles.context': regex },
      ];
    }

    if (query.from || query.to) {
      filter.createdAt = {};

      if (query.from) {
        filter.createdAt.$gte = new Date(query.from);
      }

      if (query.to) {
        filter.createdAt.$lte = new Date(query.to);
      }
    }

    return filter;
  }

  async getHistory(query: AnnotationHistoryQueryDto) {
    const filter = this.buildAnnotationFilter(query);

    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const annotations = await this.annotationsModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const filteredAnnotations = this.filterBundlesByQuery(annotations, query);

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

  private convertToCsv(data: any[]) {
    const rows = data.flatMap((annotation) =>
      annotation.bundles.map((bundle) => ({
        _id: annotation._id,
        transaction_id: annotation.transaction_id,
        annotator_id: annotation.annotator_id,
        bundle_id: bundle.bundle_id,
        items: bundle.items.join('|'),
        correlation_status: bundle.correlation_status,
        relation_type: bundle.relation_type,
        context: bundle.context ?? '',
        reasoning: bundle.reasoning,
        createdAt: annotation.createdAt
          ? new Date(annotation.createdAt).toISOString()
          : '',
        updatedAt: annotation.updatedAt
          ? new Date(annotation.updatedAt).toISOString()
          : '',
      })),
    );

    if (!rows.length) {
      return '';
    }

    const headers = Object.keys(rows[0]);

    const escapeCsv = (value: any) => {
      const stringValue = String(value ?? '');
      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    return [
      headers.join(','),
      ...rows.map((row) =>
        headers.map((header) => escapeCsv(row[header])).join(','),
      ),
    ].join('\n');
  }

  async exportAnnotations(
    query: AnnotationHistoryQueryDto & { format?: 'json' | 'csv' },
    res: Response,
  ) {
    const format = query.format ?? 'json';
    const filter = this.buildAnnotationFilter(query);

    const data = await this.annotationsModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const filename = `annotations-export-${Date.now()}`;

    if (format === 'csv') {
      const csv = this.convertToCsv(data);

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

  private calculatePercentage(value: number, total: number) {
    if (total === 0) return 0;
    return Number(((value / total) * 100).toFixed(2));
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
          percentage: this.calculatePercentage(correlated, totalBundles),
        },
        not_correlated: {
          total: notCorrelated,
          percentage: this.calculatePercentage(notCorrelated, totalBundles),
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

  private filterBundlesByQuery(
    annotations: any[],
    query: AnnotationHistoryQueryDto,
  ) {
    const searchRegex = query.search ? new RegExp(query.search, 'i') : null;

    return annotations
      .map((annotation) => {
        const bundles = (annotation.bundles ?? []).filter((bundle) => {
          if (
            query.relation_type &&
            bundle.relation_type !== query.relation_type
          ) {
            return false;
          }

          if (
            query.correlation_status &&
            bundle.correlation_status !== query.correlation_status
          ) {
            return false;
          }

          if (searchRegex) {
            const matchTransactionId = searchRegex.test(
              annotation.transaction_id,
            );
            const matchReasoning = searchRegex.test(bundle.reasoning ?? '');
            const matchContext = searchRegex.test(bundle.context ?? '');

            if (!matchTransactionId && !matchReasoning && !matchContext) {
              return false;
            }
          }

          return true;
        });

        return {
          ...annotation,
          bundles,
        };
      })
      .filter((annotation) => annotation.bundles.length > 0);
  }
}
