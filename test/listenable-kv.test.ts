import { Listen, Listenable, getKVDB, getListenableKVDB } from '../src';

describe('getListenableKVDB', () => {
  describe('get()', () => {
    it('returns undefined when the key is never set', () => {
      const kvdb = getKVDB<Listenable<string>>();
      const db = getListenableKVDB(kvdb);
      const value = db.get('newKey');

      expect(value).toBeUndefined();
    });

    it('returns the state after its set', () => {
      const kvdb = getKVDB<Listenable<string>>();
      const db = getListenableKVDB(kvdb);
      db.set('fooKey', 'barValue');
      const value = db.get('fooKey');

      expect(value).toEqual('barValue');
    });

    it('returns undefined after set then deleted', () => {
      const kvdb = getKVDB<Listenable<string>>();
      const db = getListenableKVDB(kvdb);
      db.set('fooKey', 'barValue');
      db.del('fooKey');
      const value = db.get('fooKey');

      expect(value).toBeUndefined();
    });

    it('returns undefined after set then reset', () => {
      const kvdb = getKVDB<Listenable<string>>();
      const db = getListenableKVDB(kvdb);
      db.set('fooKey', 'barValue');
      db.reset();
      const value = db.get('fooKey');

      expect(value).toBeUndefined();
    });
  });

  describe('reset()', () => {
    it('does not reset another db', () => {
      const kvdb = getKVDB<Listenable<string>>();
      const db = getListenableKVDB(kvdb);
      const db2 = getListenableKVDB(kvdb);
      db.set('fooKey', 'barValue');
      const value = db.get('fooKey');
      db2.reset();

      expect(value).toEqual('barValue');
    });
  });

  describe('subscribe()', () => {
    it('invoke listen when start subscribing', () => {
      const kvdb = getKVDB<Listenable<string>>();
      const db = getListenableKVDB(kvdb);
      db.set('fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = db.subscribe('fooKey', mockedListen);

      expect(mockedListen).toHaveBeenCalledTimes(1);
      expect(mockedListen).toHaveBeenCalledWith('barValue');

      unsubscribe?.();
    });

    it('invoke listen when the state changes', () => {
      const kvdb = getKVDB<Listenable<string>>();
      const db = getListenableKVDB(kvdb);
      db.set('fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = db.subscribe('fooKey', mockedListen);
      db.set('fooKey', 'kira');

      expect(mockedListen).toHaveBeenCalledTimes(2);
      expect(mockedListen).toHaveBeenNthCalledWith(1, 'barValue');
      expect(mockedListen).toHaveBeenNthCalledWith(2, 'kira');

      unsubscribe?.();
    });

    it('does not invoke listen after unsubscribed', () => {
      const kvdb = getKVDB<Listenable<string>>();
      const db = getListenableKVDB(kvdb);
      db.set('fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = db.subscribe('fooKey', mockedListen);
      unsubscribe?.();
      db.set('fooKey', 'kira');

      expect(mockedListen).toHaveBeenCalledTimes(1);
      expect(mockedListen).toHaveBeenCalledWith('barValue');
    });

    it('returns unsubscribe if state exists before subscription', () => {
      const kvdb = getKVDB<Listenable<string>>();
      const db = getListenableKVDB(kvdb);
      db.set('fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = db.subscribe('fooKey', mockedListen);

      expect(unsubscribe).not.toBeUndefined();

      unsubscribe?.();
    });

    it('returns undefined if state does not exists before subscription', () => {
      const kvdb = getKVDB<Listenable<string>>();
      const db = getListenableKVDB(kvdb);
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = db.subscribe('fooKey', mockedListen);

      expect(unsubscribe).toBeUndefined();
    });
  });
});
