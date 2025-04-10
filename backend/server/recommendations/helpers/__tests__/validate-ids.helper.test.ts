import { validateIDs } from '../validate-ids.helper';

describe('validateIds() helper', () => {
  it('default return value should be a Promise that should resolve to false', () => {
    const ret = validateIDs({});
    expect(ret).toBeInstanceOf(Promise);
    expect(ret).resolves.toBe(false);
  });
});
