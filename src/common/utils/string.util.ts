export const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const isSafeMongoPathSegment = (value: string) =>
  /^[a-zA-Z0-9_-]+$/.test(value);
