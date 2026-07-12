import { BadRequestException } from '@nestjs/common';
import { AnnotationHistoryQueryDto } from '../dto/annotation-history-query-dto';
import { SubmitAnnotationDto } from '../dto/submit-annotation.dto';

export const getBundleId = (index: number) =>
  `B${String(index + 1).padStart(3, '0')}`;

export const validateSubmittedBundles = (
  dto: SubmitAnnotationDto,
  transactionItemIds: string[],
) => {
  for (const [index, bundle] of dto.bundles.entries()) {
    const bundleId = getBundleId(index);
    const uniqueItems = new Set(bundle.items);

    if (uniqueItems.size !== bundle.items.length) {
      throw new BadRequestException(
        `Bundle ${bundleId} contains duplicate items`,
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
        `Reasoning is required for bundle ${bundleId}`,
      );
    }
  }
};

export const formatSubmittedBundles = (
  bundles: SubmitAnnotationDto['bundles'],
) =>
  bundles.map((bundle, index) => ({
    bundle_id: getBundleId(index),
    items: bundle.items,
    correlation_status: bundle.correlation_status,
    relation_type: bundle.relation_type,
    context: bundle.context ?? null,
    reasoning: bundle.reasoning.trim(),
  }));

export const filterBundlesByQuery = (
  annotations: any[],
  query: AnnotationHistoryQueryDto,
) => {
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
};
