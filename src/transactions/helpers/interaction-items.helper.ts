export const normalizeInteractionItems = (
  interactionItems?: Map<string, any> | Record<string, any> | null,
) => {
  if (!interactionItems) {
    return {};
  }

  if (interactionItems instanceof Map) {
    return Object.fromEntries(interactionItems);
  }

  return interactionItems;
};

export const buildItemMap = <T extends { _id: string }>(items: T[]) =>
  new Map(items.map((item) => [item._id, item]));

export const sortByInteractionOrder = <
  T extends { interaction?: { order_number?: number } },
>(
  items: T[],
) =>
  items.sort(
    (a, b) =>
      (a.interaction?.order_number ?? 0) - (b.interaction?.order_number ?? 0),
  );
