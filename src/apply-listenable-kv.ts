import { Dispose, isDefined, Unsubscribe } from 'trimop';

export type ClearKV = Dispose;
export type DeleteRecordKV = (key: string) => undefined;
export type GetRecordKV<T = unknown> = (key: string) => T | undefined;
export type SetRecordKV<T = unknown> = (key: string, value: T) => undefined;

export type Listen<T> = (value: T | undefined) => undefined;

export type Listenable<T> = {
  readonly listens: readonly Listen<T>[];
  readonly state: T;
};

export function applyClearListenable(clearKV: ClearKV): undefined {
  return clearKV();
}

export function applyGetRecordListenable<T>(
  getRecordKV: GetRecordKV<Listenable<T>>,
  key: string
): T | undefined {
  return getRecordKV(key)?.state;
}

export function applySetRecordListenable<T>(
  getRecordKV: GetRecordKV<Listenable<T>>,
  setRecordKV: SetRecordKV<Listenable<T>>,
  key: string,
  newState: T
): undefined {
  const cachedListenable = getRecordKV(key);
  cachedListenable?.listens.forEach((listener) => listener(newState));
  return setRecordKV(key, {
    listens: cachedListenable?.listens ?? [],
    state: newState,
  });
}

export function applyDeleteRecordListenable(deleteKV: DeleteRecordKV, key: string): undefined {
  return deleteKV(key);
}

/**
 * Subscribe to a state
 * @param getRecordKV
 * @param setRecordKV
 * @param key of the state
 * @param newListen which will be called every time the state changes
 * @returns unsubscribe function if the state exists, otherwise returns undefined
 */
export function applySubscribeRecordListenable<T>(
  getRecordKV: GetRecordKV<Listenable<T>>,
  setRecordKV: SetRecordKV<Listenable<T>>,
  key: string,
  newListen: Listen<T>
): Unsubscribe | undefined {
  const cachedListenable = getRecordKV(key);
  newListen(cachedListenable?.state);
  if (!isDefined(cachedListenable)) {
    return undefined;
  }
  setRecordKV(key, {
    ...cachedListenable,
    listens: [...cachedListenable.listens, newListen],
  });
  return () => {
    const cachedListenable = getRecordKV(key);
    if (isDefined(cachedListenable)) {
      // Remove unused listen
      setRecordKV(key, {
        ...cachedListenable,
        listens: cachedListenable.listens.filter((el) => el !== newListen),
      });
    }
    return undefined;
  };
}
