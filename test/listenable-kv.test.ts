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

      setRecordLKV<string>(db, 'fooKey', 'barValue');

      const value = getRecordLKV<string>(db, 'fooKey');
      expect(value).toEqual('barValue');
    });

    it('returns undefined after set then deleted', () => {
      const db = useState<DB>({});

      setRecordLKV<string>(db, 'fooKey', 'barValue');
      deleteRecordLKV(db, 'fooKey');

      const value = getRecordLKV<string>(db, 'fooKey');
      expect(value).toBeUndefined();
    });

    it('returns undefined after set then reset', () => {
      const db = useState<DB>({});

      setRecordLKV<string>(db, 'fooKey', 'barValue');
      clearLKV(db);

      const value = getRecordLKV<string>(db, 'fooKey');
      expect(value).toBeUndefined();
    });
  });

  describe('clearLKV', () => {
    it('does not reset another db', () => {
      const db = useState<DB>({});
      const db2 = useState<DB>({});

      setRecordLKV<string>(db, 'fooKey', 'barValue');
      clearLKV(db2);

      const value = getRecordLKV<string>(db, 'fooKey');
      expect(value).toEqual('barValue');
    });
  });

  describe('setRecordLKV', () => {
    it('does not set state on another db', () => {
      const db = useState<DB>({});
      const db2 = useState<DB>({});

      setRecordLKV<string>(db, 'fooKey', 'barValue');
      setRecordLKV<string>(db2, 'fooKey', 'barValue');

      const value = getRecordLKV<string>(db, 'fooKey');
      expect(value).toEqual('barValue');
    });
  });

  describe('deleteRecordLKV', () => {
    it('does not delete state on another db', () => {
      const db = useState<DB>({});
      const db2 = useState<DB>({});

      setRecordLKV<string>(db, 'fooKey', 'barValue');
      deleteRecordLKV(db2, 'fooKey');

      const value = getRecordLKV<string>(db, 'fooKey');
      expect(value).toEqual('barValue');
    });
  });

  describe('subscribeRecordLKV', () => {
    it('invoke listen when start subscribing', () => {
      const db = useState<DB>({});

      setRecordLKV<string>(db, 'fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeRecordLKV(db, 'fooKey', mockedListen);

      expect(mockedListen).toHaveBeenCalledTimes(1);
      expect(mockedListen).toHaveBeenCalledWith('barValue');

      unsubscribe?.();
    });

    it('invoke listen when the state changes', () => {
      const db = useState<DB>({});

      setRecordLKV<string>(db, 'fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeRecordLKV(db, 'fooKey', mockedListen);
      setRecordLKV<string>(db, 'fooKey', 'kira');

      expect(mockedListen).toHaveBeenCalledTimes(2);
      expect(mockedListen).toHaveBeenNthCalledWith(1, 'barValue');
      expect(mockedListen).toHaveBeenNthCalledWith(2, 'kira');

      unsubscribe?.();
    });

    it('does not invoke listen after unsubscribed', () => {
      const db = useState<DB>({});

      setRecordLKV<string>(db, 'fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeRecordLKV(db, 'fooKey', mockedListen);
      unsubscribe?.();
      setRecordLKV<string>(db, 'fooKey', 'kira');

      expect(mockedListen).toHaveBeenCalledTimes(1);
      expect(mockedListen).toHaveBeenCalledWith('barValue');
    });

    it('does not throw error when unsubscribed after deleting the state', () => {
      const db = useState<DB>({});

      setRecordLKV<string>(db, 'fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeRecordLKV(db, 'fooKey', mockedListen);

      deleteRecordLKV(db, 'fooKey');

      expect(unsubscribe).not.toThrow();
    });

    it('returns unsubscribe if state exists before subscription', () => {
      const db = useState<DB>({});

      setRecordLKV<string>(db, 'fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeRecordLKV(db, 'fooKey', mockedListen);

      expect(unsubscribe).toBeDefined();

      unsubscribe?.();
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

      setRecordLKV<string>(db, 'fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = subscribeRecordLKV(db, 'fooKey', mockedListen);
      setRecordLKV<string>(db2, 'fooKey', 'kira');

      expect(mockedListen).toHaveBeenCalledTimes(1);
      expect(mockedListen).toHaveBeenCalledWith('barValue');

      unsubscribe?.();
    });
  });
});
