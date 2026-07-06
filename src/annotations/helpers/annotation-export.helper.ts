import { buildCsv } from '../../common/utils';

export const convertAnnotationsToCsv = (data: any[]) => {
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

  return buildCsv(rows);
};
