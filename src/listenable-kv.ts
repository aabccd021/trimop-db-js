import { Unsubscribe, isDefined } from 'trimop';

import { KVDB } from './kv';

export type Listen<T> = (value: T | undefined) => void;

export type Listenable<T> = {
  readonly state: T;
  readonly listens: readonly Listen<T>[];
};

export type ListenableDBController<T> = {
  readonly reset: () => void;
  readonly set: (key: string, newState: T) => void;
  readonly get: (key: string) => T | undefined;
  readonly del: (key: string) => void;
  /**
   * Subscribe to a state
   * @param key of the state
   * @param newListen which will be called every time the state changes
   * @returns unsubscribe function if the state exists, otherwise returns undefined
   */
  readonly subscribe: (key: string, listen: Listen<T>) => Unsubscribe | undefined;
};

export function getListenableKVDB<T>(
  getKVDB: () => KVDB<Listenable<T>>
): ListenableDBController<T> {
  const db = getKVDB();
  return {
    del: db.del,
    get: (key) => db.get(key)?.state,
    reset: db.reset,
    set: (key, newState) => {
      const cachedObservable = db.get(key);
      cachedObservable?.listens.forEach((listener) => listener(newState));
      db.set(key, {
        listens: cachedObservable?.listens ?? [],
        state: newState,
      });
    },
    subscribe: (key, newListen) => {
      const cachedListenable = db.get(key);
      newListen(cachedListenable?.state);
      if (!isDefined(cachedListenable)) {
        return undefined;
      }
      db.set(key, {
        ...cachedListenable,
        listens: [...cachedListenable.listens, newListen],
      });
      return () => {
        const obs = db.get(key);
        if (isDefined(obs)) {
          // Remove unused listen
          const updatedObservable = {
            ...obs,
            listens: obs.listens.filter((el) => el !== newListen),
          };
          db.set(key, updatedObservable);
        }
      };
    },
  };
}
