import { useState } from 'trimop';

import { DB, Listen } from '../src';
import {
  clearLKV,
  deleteRecordLKV,
  getRecordLKV,
  setRecordLKV,
  subscribeRecordLKV,
} from '../src/listenable-kv';

describe('ListenableKV', () => {
  describe('getRecordLKV', () => {
    it('returns undefined when the key is never set', () => {
      const db = useState<DB>({});

      const value = getRecordLKV<string>(db, 'fooKey');
      expect(value).toBeUndefined();
    });

    it('returns the state after its set', () => {
      const db = useState<DB>({});

      const setResult = setRecordLKV<string>(db, 'fooKey', 'barValue');
      expect(setResult).toBeUndefined();

      const value = getRecordLKV<string>(db, 'fooKey');
      expect(value).toEqual('barValue');
    });

    it('returns undefined after set then deleted', () => {
      const db = useState<DB>({});

      const setResult = setRecordLKV<string>(db, 'fooKey', 'barValue');
      expect(setResult).toBeUndefined();

      const deleteResult = deleteRecordLKV(db, 'fooKey');
      expect(deleteResult).toBeUndefined();

      const value = getRecordLKV<string>(db, 'fooKey');
      expect(value).toBeUndefined();
    });

    it('returns undefined after set then reset', () => {
      const db = useState<DB>({});

      const setResult = setRecordLKV<string>(db, 'fooKey', 'barValue');
      expect(setResult).toBeUndefined();

      const clearResult = clearLKV(db);
      expect(clearResult).toBeUndefined();

      const value = getRecordLKV<string>(db, 'fooKey');
      expect(value).toBeUndefined();
    });
  });

  describe('clearLKV', () => {
    it('does not reset another db', () => {
      const db = useState<DB>({});
      const db2 = useState<DB>({});

      const setResult = setRecordLKV<string>(db, 'fooKey', 'barValue');
      expect(setResult).toBeUndefined();

      const clearResult2 = clearLKV(db2);
      expect(clearResult2).toBeUndefined();

      const value = getRecordLKV<string>(db, 'fooKey');
      expect(value).toEqual('barValue');
    });
  });

  describe('const setResult = setRecordLKV', () => {
    it('does not set state on another db', () => {
      const db = useState<DB>({});
      const db2 = useState<DB>({});

      const setResult = setRecordLKV<string>(db, 'fooKey', 'barValue');
      expect(setResult).toBeUndefined();

      const setResult2 = setRecordLKV<string>(db2, 'fooKey', 'barValue');
      expect(setResult2).toBeUndefined();

      const value = getRecordLKV<string>(db, 'fooKey');
      expect(value).toEqual('barValue');
    });
  });

  describe('const deleteResult = deleteRecordLKV', () => {
    it('does not delete state on another db', () => {
      const db = useState<DB>({});
      const db2 = useState<DB>({});

      const setResult = setRecordLKV<string>(db, 'fooKey', 'barValue');
      expect(setResult).toBeUndefined();

      const deleteResult = deleteRecordLKV(db2, 'fooKey');
      expect(deleteResult).toBeUndefined();

      const value = getRecordLKV<string>(db, 'fooKey');
      expect(value).toEqual('barValue');
    });
  });

  describe('subscribeRecordLKV', () => {
    it('invoke listen when start subscribing', () => {
      const db = useState<DB>({});

      const setResult = setRecordLKV<string>(db, 'fooKey', 'barValue');
      expect(setResult).toBeUndefined();

      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeRecordLKV(db, 'fooKey', mockedListen);

      expect(mockedListen).toHaveBeenCalledTimes(1);
      expect(mockedListen).toHaveBeenCalledWith('barValue');

      expect(unsubscribe).toBeDefined();
      expect(unsubscribe?.()).toBeUndefined();
    });

    it('invoke listen when the state changes', () => {
      const db = useState<DB>({});

      const setResult = setRecordLKV<string>(db, 'fooKey', 'barValue');
      expect(setResult).toBeUndefined();

      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeRecordLKV(db, 'fooKey', mockedListen);

      const setResult_2 = setRecordLKV<string>(db, 'fooKey', 'kira');
      expect(setResult_2).toBeUndefined();

      expect(mockedListen).toHaveBeenCalledTimes(2);
      expect(mockedListen).toHaveBeenNthCalledWith(1, 'barValue');
      expect(mockedListen).toHaveBeenNthCalledWith(2, 'kira');

      expect(unsubscribe).toBeDefined();
      expect(unsubscribe?.()).toBeUndefined();
    });

    it('does not invoke listen after unsubscribed', () => {
      const db = useState<DB>({});

      const setResult = setRecordLKV<string>(db, 'fooKey', 'barValue');
      expect(setResult).toBeUndefined();

      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeRecordLKV(db, 'fooKey', mockedListen);
      expect(unsubscribe).toBeDefined();
      expect(unsubscribe?.()).toBeUndefined();

      const setResult_2 = setRecordLKV<string>(db, 'fooKey', 'kira');
      expect(setResult_2).toBeUndefined();

      expect(mockedListen).toHaveBeenCalledTimes(1);
      expect(mockedListen).toHaveBeenCalledWith('barValue');
    });

    it('does not throw error when unsubscribed after deleting the state', () => {
      const db = useState<DB>({});

      const setResult = setRecordLKV<string>(db, 'fooKey', 'barValue');
      expect(setResult).toBeUndefined();

      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeRecordLKV(db, 'fooKey', mockedListen);

      const deleteResult = deleteRecordLKV(db, 'fooKey');
      expect(deleteResult).toBeUndefined();

      expect(unsubscribe).toBeDefined();
      expect(unsubscribe?.()).toBeUndefined();
    });

    it('returns unsubscribe if state exists before subscription', () => {
      const db = useState<DB>({});

      const setResult = setRecordLKV<string>(db, 'fooKey', 'barValue');
      expect(setResult).toBeUndefined();

      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeRecordLKV(db, 'fooKey', mockedListen);

      expect(unsubscribe).toBeDefined();

      expect(unsubscribe).toBeDefined();
      expect(unsubscribe?.()).toBeUndefined();
    });

    it('returns undefined if state does not exists before subscription', () => {
      const db = useState<DB>({});

      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeRecordLKV(db, 'fooKey', mockedListen);

      expect(unsubscribe).toBeUndefined();
    });

    it('does not listen to another db', () => {
      const db = useState<DB>({});
      const db2 = useState<DB>({});

      const setResult = setRecordLKV<string>(db, 'fooKey', 'barValue');
      expect(setResult).toBeUndefined();

      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeRecordLKV(db, 'fooKey', mockedListen);

      const setResult_2 = setRecordLKV<string>(db2, 'fooKey', 'kira');
      expect(setResult_2).toBeUndefined();

      expect(mockedListen).toHaveBeenCalledTimes(1);
      expect(mockedListen).toHaveBeenCalledWith('barValue');

      expect(unsubscribe).toBeDefined();
      expect(unsubscribe?.()).toBeUndefined();
    });
  });
});
