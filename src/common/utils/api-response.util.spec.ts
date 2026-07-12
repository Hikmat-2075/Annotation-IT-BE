import { normalizeSuccessPayload } from './api-response.util';

describe('normalizeSuccessPayload', () => {
  it('keeps array payloads as response data', () => {
    const items = [{ _id: 'item_0001' }, { _id: 'item_0002' }];

    expect(normalizeSuccessPayload(items)).toEqual({
      message: 'Success',
      data: items,
      pagination: null,
    });
  });

  it('normalizes structured service responses', () => {
    expect(
      normalizeSuccessPayload({
        message: 'Items imported successfully',
        data: { inserted_count: 1 },
      }),
    ).toEqual({
      message: 'Items imported successfully',
      data: { inserted_count: 1 },
      pagination: null,
    });
  });

  it('keeps plain object payloads as response data', () => {
    const transaction = { _id: 'trx_0001', status: 'available' };

    expect(normalizeSuccessPayload(transaction)).toEqual({
      message: 'Success',
      data: transaction,
      pagination: null,
    });
  });
});
