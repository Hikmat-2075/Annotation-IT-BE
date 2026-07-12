import { escapeRegExp, isSafeMongoPathSegment } from './string.util';

describe('string utilities', () => {
  it('escapes regular expression syntax in user input', () => {
    const regex = new RegExp(escapeRegExp('[coffee]+'), 'i');

    expect(regex.test('[coffee]+')).toBe(true);
    expect(regex.test('coffee')).toBe(false);
  });

  it('only accepts safe MongoDB path segments', () => {
    expect(isSafeMongoPathSegment('item_0001')).toBe(true);
    expect(isSafeMongoPathSegment('items.$where')).toBe(false);
  });
});
