import { useState } from 'trimop';

import { clearKV, DB, deleteRecordKV, getRecordKV, setRecordKV } from '../src';

describe('KV', () => {
  describe('getRecordKV', () => {
    it('returns undefined when the key is never set', () => {
      const db = useState<DB>({});
      const value = getRecordKV(db, 'newKey');

      expect(value).toBeUndefined();
    });

    it('returns the state after its set', () => {
      const db = useState<DB>({});
      setRecordKV(db, 'fooKey', 'barValue');
      const value = getRecordKV(db, 'fooKey');

      expect(value).toEqual('barValue');
    });

    it('returns undefined after set then deleted', () => {
      const db = useState<DB>({});
      setRecordKV(db, 'fooKey', 'barValue');
      deleteRecordKV(db, 'fooKey');
      const value = getRecordKV(db, 'fooKey');

      expect(value).toBeUndefined();
    });

    it('returns undefined after set then reset', () => {
      const db = useState<DB>({});
      setRecordKV(db, 'fooKey', 'barValue');
      clearKV(db);
      const value = getRecordKV(db, 'fooKey');

      expect(value).toBeUndefined();
    });
  });

  describe('clearKV', () => {
    it('does not reset another db', () => {
      const db = useState<DB>({});
      const db2 = useState<DB>({});
      setRecordKV(db, 'fooKey', 'barValue');
      clearKV(db2);

      const value = getRecordKV(db, 'fooKey');
      expect(value).toEqual('barValue');
    });
  });

  describe('setRecordKV', () => {
    it('does not set state on another db', () => {
      const db = useState<DB>({});
      const db2 = useState<DB>({});
      setRecordKV(db, 'fooKey', 'barValue');
      setRecordKV(db2, 'fooKey', 'kira');

      const value = getRecordKV(db, 'fooKey');
      expect(value).toEqual('barValue');
    });
  });

  describe('delRecordKV', () => {
    it('does not delete state on another db', () => {
      const db = useState<DB>({});
      const db2 = useState<DB>({});
      setRecordKV(db, 'fooKey', 'barValue');
      deleteRecordKV(db2, 'fooKey');

      const value = getRecordKV(db, 'fooKey');
      expect(value).toEqual('barValue');
    });
  });
});
