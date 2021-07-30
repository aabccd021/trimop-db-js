import { isDefined, useState } from 'trimop';

type DB = { readonly [key: string]: unknown };

const latestDbId = useState<number>(0);
const dbs = useState<{ readonly [key: string]: DB }>({});

export type KVDB<T> = {
  readonly reset: () => void;
  readonly set: (key: string, value: T) => void;
  readonly get: (key: string) => T | undefined;
  readonly del: (key: string) => void;
};

export function getDB<T>(): KVDB<T> {
  const dbId = `${latestDbId.get()}`;
  latestDbId.set(latestDbId.get() + 1);
  return {
    reset: () => {
      dbs.set(Object.fromEntries(Object.entries(dbs.get()).filter(([elDbId]) => elDbId !== dbId)));
    },
    set: (key, value) => {
      const cachedDbs = dbs.get();
      dbs.set({
        ...cachedDbs,
        [dbId]: {
          ...cachedDbs[dbId],
          [key]: value,
        },
      });
    },
    get: (key) => dbs.get()[dbId]?.[key] as T | undefined,
    del: (key) => {
      const cachedDbs = dbs.get();
      const cachedDb = cachedDbs[dbId];
      if (isDefined(cachedDb)) {
        dbs.set({
          ...cachedDbs,
          [dbId]: Object.fromEntries(Object.entries(cachedDb).filter(([elKey]) => elKey !== key)),
        });
      }
    },
  };
}
