import {
  ClearKV,
  DB,
  DeleteRecordKV,
  GetRecordKV,
  Listen,
  Listenable,
  SetRecordKV,
  clearKV,
  clearLKV,
  deleteRecordKV,
  deleteRecordLKV,
  getRecordKV,
  getRecordLKV,
  setRecordKV,
  setRecordLKV,
  subscribeLKV,
} from '../src';
import { useState } from 'trimop';

describe('ListenableKV', () => {
  describe('get()', () => {
    it('returns undefined when the key is never set', () => {
      const db = useState<DB>({});

      const get: GetRecordKV<Listenable<string>> = (key) => getRecordKV(db, key);

      const value = getRecordLKV<string>(get, 'fooKey');
      expect(value).toBeUndefined();
    });

    it('returns the state after its set', () => {
      const db = useState<DB>({});

      const get: GetRecordKV<Listenable<string>> = (key) => getRecordKV(db, key);
      const set: SetRecordKV<Listenable<string>> = (key, value) => setRecordKV(db, key, value);

      setRecordLKV<string>(get, set, 'fooKey', 'barValue');

      const value = getRecordLKV<string>(get, 'fooKey');
      expect(value).toEqual('barValue');
    });

    it('returns undefined after set then deleted', () => {
      const db = useState<DB>({});

      const get: GetRecordKV<Listenable<string>> = (key) => getRecordKV(db, key);
      const set: SetRecordKV<Listenable<string>> = (key, value) => setRecordKV(db, key, value);
      const del: DeleteRecordKV = (key) => deleteRecordKV(db, key);

      setRecordLKV<string>(get, set, 'fooKey', 'barValue');
      deleteRecordLKV(del, 'fooKey');

      const value = getRecordLKV<string>(get, 'fooKey');
      expect(value).toBeUndefined();
    });

    it('returns undefined after set then reset', () => {
      const db = useState<DB>({});

      const get: GetRecordKV<Listenable<string>> = (key) => getRecordKV(db, key);
      const set: SetRecordKV<Listenable<string>> = (key, value) => setRecordKV(db, key, value);
      const clear: ClearKV = () => clearKV(db);

      setRecordLKV<string>(get, set, 'fooKey', 'barValue');
      clearLKV(clear);

      const value = getRecordLKV<string>(get, 'fooKey');
      expect(value).toBeUndefined();
    });
  });

  describe('reset()', () => {
    it('does not reset another db', () => {
      const db = useState<DB>({});
      const db2 = useState<DB>({});

      const get: GetRecordKV<Listenable<string>> = (key) => getRecordKV(db, key);
      const set: SetRecordKV<Listenable<string>> = (key, value) => setRecordKV(db, key, value);
      const clear2: ClearKV = () => clearKV(db2);

      setRecordLKV<string>(get, set, 'fooKey', 'barValue');
      clearLKV(clear2);

      const value = getRecordLKV<string>(get, 'fooKey');
      expect(value).toEqual('barValue');
    });
  });

  describe('set()', () => {
    it('does not set state on another db', () => {
      const db = useState<DB>({});
      const db2 = useState<DB>({});

      const get: GetRecordKV<Listenable<string>> = (key) => getRecordKV(db, key);
      const set: SetRecordKV<Listenable<string>> = (key, value) => setRecordKV(db, key, value);
      const get2: GetRecordKV<Listenable<string>> = (key) => getRecordKV(db2, key);
      const set2: SetRecordKV<Listenable<string>> = (key, value) => setRecordKV(db2, key, value);

      setRecordLKV<string>(get, set, 'fooKey', 'barValue');
      setRecordLKV<string>(get2, set2, 'fooKey', 'barValue');

      const value = getRecordLKV<string>(get, 'fooKey');
      expect(value).toEqual('barValue');
    });
  });

  describe('del()', () => {
    it('does not delete state on another db', () => {
      const db = useState<DB>({});
      const db2 = useState<DB>({});

      const get: GetRecordKV<Listenable<string>> = (key) => getRecordKV(db, key);
      const set: SetRecordKV<Listenable<string>> = (key, value) => setRecordKV(db, key, value);
      const del2: DeleteRecordKV = (key) => deleteRecordKV(db2, key);

      setRecordLKV<string>(get, set, 'fooKey', 'barValue');
      deleteRecordLKV(del2, 'fooKey');

      const value = getRecordLKV<string>(get, 'fooKey');
      expect(value).toEqual('barValue');
    });
  });

  describe('subscribe()', () => {
    it('invoke listen when start subscribing', () => {
      const db = useState<DB>({});

      const get: GetRecordKV<Listenable<string>> = (key) => getRecordKV(db, key);
      const set: SetRecordKV<Listenable<string>> = (key, value) => setRecordKV(db, key, value);

      setRecordLKV<string>(get, set, 'fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeLKV(get, set, 'fooKey', mockedListen);

      expect(mockedListen).toHaveBeenCalledTimes(1);
      expect(mockedListen).toHaveBeenCalledWith('barValue');

      unsubscribe?.();
    });

    it('invoke listen when the state changes', () => {
      const db = useState<DB>({});

      const get: GetRecordKV<Listenable<string>> = (key) => getRecordKV(db, key);
      const set: SetRecordKV<Listenable<string>> = (key, value) => setRecordKV(db, key, value);

      setRecordLKV<string>(get, set, 'fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeLKV(get, set, 'fooKey', mockedListen);
      setRecordLKV<string>(get, set, 'fooKey', 'kira');

      expect(mockedListen).toHaveBeenCalledTimes(2);
      expect(mockedListen).toHaveBeenNthCalledWith(1, 'barValue');
      expect(mockedListen).toHaveBeenNthCalledWith(2, 'kira');

      unsubscribe?.();
    });

    it('does not invoke listen after unsubscribed', () => {
      const db = useState<DB>({});

      const get: GetRecordKV<Listenable<string>> = (key) => getRecordKV(db, key);
      const set: SetRecordKV<Listenable<string>> = (key, value) => setRecordKV(db, key, value);

      setRecordLKV<string>(get, set, 'fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeLKV(get, set, 'fooKey', mockedListen);
      unsubscribe?.();
      setRecordLKV<string>(get, set, 'fooKey', 'kira');

      expect(mockedListen).toHaveBeenCalledTimes(1);
      expect(mockedListen).toHaveBeenCalledWith('barValue');
    });

    it('returns unsubscribe if state exists before subscription', () => {
      const db = useState<DB>({});

      const get: GetRecordKV<Listenable<string>> = (key) => getRecordKV(db, key);
      const set: SetRecordKV<Listenable<string>> = (key, value) => setRecordKV(db, key, value);

      setRecordLKV<string>(get, set, 'fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeLKV(get, set, 'fooKey', mockedListen);

      expect(unsubscribe).toBeDefined();

      unsubscribe?.();
    });

    it('returns undefined if state does not exists before subscription', () => {
      const db = useState<DB>({});

      const get: GetRecordKV<Listenable<string>> = (key) => getRecordKV(db, key);
      const set: SetRecordKV<Listenable<string>> = (key, value) => setRecordKV(db, key, value);

      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeLKV(get, set, 'fooKey', mockedListen);

      expect(unsubscribe).toBeUndefined();
    });

    it('does not listen to another db', () => {
      const db = useState<DB>({});
      const db2 = useState<DB>({});

      const get: GetRecordKV<Listenable<string>> = (key) => getRecordKV(db, key);
      const set: SetRecordKV<Listenable<string>> = (key, value) => setRecordKV(db, key, value);
      const get2: GetRecordKV<Listenable<string>> = (key) => getRecordKV(db2, key);
      const set2: SetRecordKV<Listenable<string>> = (key, value) => setRecordKV(db2, key, value);

      setRecordLKV<string>(get, set, 'fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeLKV(get, set, 'fooKey', mockedListen);
      setRecordLKV<string>(get2, set2, 'fooKey', 'kira');

      expect(mockedListen).toHaveBeenCalledTimes(1);
      expect(mockedListen).toHaveBeenCalledWith('barValue');

      unsubscribe?.();
    });
  });
});
