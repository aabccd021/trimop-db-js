import { Listen, getKVDB, getListenableKVDB } from '../src';

describe('getListenableKVDB', () => {
  describe('get()', () => {
    it('returns undefined when the key is never set', () => {
      const db = getListenableKVDB<string>(getKVDB);

      const value = db.get('newKey');
      expect(value).toBeUndefined();
    });

    it('returns the state after its set', () => {
      const db = getListenableKVDB<string>(getKVDB);
      db.set('fooKey', 'barValue');

      const value = db.get('fooKey');
      expect(value).toEqual('barValue');
    });

    it('returns undefined after set then deleted', () => {
      const db = getListenableKVDB<string>(getKVDB);
      db.set('fooKey', 'barValue');
      db.del('fooKey');

      const value = db.get('fooKey');
      expect(value).toBeUndefined();
    });

    it('returns undefined after set then reset', () => {
      const db = getListenableKVDB<string>(getKVDB);
      db.set('fooKey', 'barValue');
      db.reset();

      const value = db.get('fooKey');
      expect(value).toBeUndefined();
    });
  });

  describe('reset()', () => {
    it('does not reset another db', () => {
      const db = getListenableKVDB<string>(getKVDB);
      const db2 = getListenableKVDB<string>(getKVDB);
      db.set('fooKey', 'barValue');
      db2.reset();

      const value = db.get('fooKey');
      expect(value).toEqual('barValue');
    });
  });

  describe('set()', () => {
    it('does not set state on another db', () => {
      const db = getListenableKVDB<string>(getKVDB);
      const db2 = getListenableKVDB<string>(getKVDB);
      db.set('fooKey', 'barValue');
      db2.set('fooKey', 'kira');

      const value = db.get('fooKey');
      expect(value).toEqual('barValue');
    });
  });

  describe('del()', () => {
    it('does not delete state on another db', () => {
      const db = getListenableKVDB<string>(getKVDB);
      const db2 = getListenableKVDB<string>(getKVDB);
      db.set('fooKey', 'barValue');
      db2.del('fooKey');

      const value = db.get('fooKey');
      expect(value).toEqual('barValue');
    });
  });

  describe('subscribe()', () => {
    it('invoke listen when start subscribing', () => {
      const db = getListenableKVDB<string>(getKVDB);
      db.set('fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = db.subscribe('fooKey', mockedListen);

      expect(mockedListen).toHaveBeenCalledTimes(1);
      expect(mockedListen).toHaveBeenCalledWith('barValue');

      unsubscribe?.();
    });

    it('invoke listen when the state changes', () => {
      const db = getListenableKVDB<string>(getKVDB);
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
      const db = getListenableKVDB<string>(getKVDB);
      db.set('fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = db.subscribe('fooKey', mockedListen);
      unsubscribe?.();
      db.set('fooKey', 'kira');

      expect(mockedListen).toHaveBeenCalledTimes(1);
      expect(mockedListen).toHaveBeenCalledWith('barValue');
    });

    it('returns unsubscribe if state exists before subscription', () => {
      const db = getListenableKVDB<string>(getKVDB);
      db.set('fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = db.subscribe('fooKey', mockedListen);

      expect(unsubscribe).not.toBeUndefined();

      unsubscribe?.();
    });

    it('returns undefined if state does not exists before subscription', () => {
      const db = getListenableKVDB<string>(getKVDB);
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = db.subscribe('fooKey', mockedListen);

      expect(unsubscribe).toBeUndefined();
    });

    it('does not listen to another db', () => {
      const db = getListenableKVDB<string>(getKVDB);
      const db2 = getListenableKVDB<string>(getKVDB);
      db.set('fooKey', 'barValue');
      const mockedListen = jest.fn() as Listen<string>;
      const unsubscribe = db.subscribe('fooKey', mockedListen);
      db2.set('fooKey', 'kira');

      expect(mockedListen).toHaveBeenCalledTimes(1);
      expect(mockedListen).toHaveBeenCalledWith('barValue');

      unsubscribe?.();
    });
  });
});
