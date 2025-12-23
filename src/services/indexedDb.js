import { openDB } from "idb";

const DB_NAME = "kanban-board";
const STORE_NAME = "board";
const DB_VERSION = 1;

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function saveBoardToIDB(state) {
  const db = await getDB();
  await db.put(STORE_NAME, state, "state");
}

export async function loadBoardFromIDB() {
  const db = await getDB();
  return db.get(STORE_NAME, "state");
}
