import { getKVDB } from '../src';

describe('getKVDB', () => {
  describe('get()', () => {
    it('returns undefined when the key is never set', () => {
      const db = getKVDB();
      const value = db.get('newKey');

      expect(value).toBeUndefined();
    });

    it('returns the state after its set', () => {
      const db = getKVDB();
      db.set('fooKey', 'barValue');
      const value = db.get('fooKey');

      expect(value).toEqual('barValue');
    });

    it('returns undefined after set then deleted', () => {
      const db = getKVDB();
      db.set('fooKey', 'barValue');
      db.del('fooKey');
      const value = db.get('fooKey');

      expect(value).toBeUndefined();
    });

    it('returns undefined after set then reset', () => {
      const db = getKVDB();
      db.set('fooKey', 'barValue');
      db.reset();
      const value = db.get('fooKey');

      expect(value).toBeUndefined();
    });
  });

  describe('reset()', () => {
    it('does not reset another db', () => {
      const db = getKVDB();
      const db2 = getKVDB();
      db.set('fooKey', 'barValue');
      const value = db.get('fooKey');
      db2.reset();

      expect(value).toEqual('barValue');
    });
  });
});
