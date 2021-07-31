import { StateController } from 'trimop';

export type DB = { readonly [key: string]: unknown };

export function clearKV(db: StateController<DB>): void {
  db.set({});
}

export function deleteRecordKV(db: StateController<DB>, key: string): void {
  db.set(Object.fromEntries(Object.entries(db.get()).filter(([elKey]) => elKey !== key)));
}

export function getRecordKV<T>(db: StateController<DB>, key: string): T | undefined {
  return db.get()[key] as T | undefined;
}

export function setRecordKV<T>(db: StateController<DB>, key: string, value: T): void {
  db.set({
    ...db.get(),
    [key]: value,
  });
}
