import { getDB } from '../src';

describe('getDB', () => {
  describe('get()', () => {
    it('returns undefined when the key is never set', () => {
      const db = getDB();
      const value = db.get('newKey');
      expect(value).toBeUndefined();
    });

    it('returns the state after its set', () => {
      const db = getDB();
      db.set('fooKey', 'barValue');
      const value = db.get('fooKey');
      expect(value).toEqual('barValue');
    });

    it('returns undefined after set then deleted', () => {
      const db = getDB();
      db.set('fooKey', 'barValue');
      db.del('fooKey');
      const value = db.get('fooKey');
      expect(value).toBeUndefined();
    });

    it('returns undefined after set then reset', () => {
      const db = getDB();
      db.set('fooKey', 'barValue');
      db.reset();
      const value = db.get('fooKey');
      expect(value).toBeUndefined();
    });
  });

  describe('reset()', () => {
    it('does not reset another db', () => {
      const db = getDB();
      const db2 = getDB();
      db.set('fooKey', 'barValue');
      const value = db.get('fooKey');
      db2.reset();
      expect(value).toEqual('barValue');
    });
  });
});
