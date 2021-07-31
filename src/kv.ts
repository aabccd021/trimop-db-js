import { StateController } from 'trimop';

export type DB = { readonly [key: string]: unknown };

export function clearKV(db: StateController<DB>): undefined {
  return db.set({});
}

export function deleteRecordKV(db: StateController<DB>, key: string): undefined {
  return db.set(Object.fromEntries(Object.entries(db.get()).filter(([elKey]) => elKey !== key)));
}

export function getRecordKV<T>(db: StateController<DB>, key: string): T | undefined {
  return db.get()[key] as T | undefined;
}

export function setRecordKV<T>(db: StateController<DB>, key: string, value: T): undefined {
  return db.set({
    ...db.get(),
    [key]: value,
  });
}
