import { StateController, Unsubscribe } from 'trimop';

import {
  applyClearListenable,
  applyDeleteRecordListenable,
  applyGetRecordListenable,
  applySetRecordListenable,
  applySubscribeRecordListenable,
  Listen,
} from './apply-listenable-kv';
import { clearKV, DB, deleteRecordKV, getRecordKV, setRecordKV } from './kv';

export function clearLKV(db: StateController<DB>): void {
  applyClearListenable(() => clearKV(db));
}

export function getRecordLKV<T>(db: StateController<DB>, key: string): T | undefined {
  return applyGetRecordListenable((key) => getRecordKV(db, key), key);
}

export function setRecordLKV<T>(db: StateController<DB>, key: string, newState: T): void {
  return applySetRecordListenable(
    (key) => getRecordKV(db, key),
    (key, value) => setRecordKV(db, key, value),
    key,
    newState
  );
}

export function deleteRecordLKV(db: StateController<DB>, key: string): void {
  applyDeleteRecordListenable((key) => deleteRecordKV(db, key), key);
}

export function subscribeRecordLKV<T>(
  db: StateController<DB>,
  key: string,
  newListen: Listen<T>
): Unsubscribe | undefined {
  return applySubscribeRecordListenable(
    (key) => getRecordKV(db, key),
    (key, value) => setRecordKV(db, key, value),
    key,
    newListen
  );
}
