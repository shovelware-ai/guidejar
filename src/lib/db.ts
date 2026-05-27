import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Guide } from "./types";

/**
 * Local-first persistence. Everything lives in the browser via IndexedDB:
 *  - `guides`  holds guide metadata + step list (small, JSON-ish)
 *  - `images`  holds screenshot Blobs keyed by a generated id
 * Keeping image bytes in a separate store keeps guide objects light and
 * avoids the ~5MB localStorage ceiling.
 */
interface GuideDB extends DBSchema {
  guides: {
    key: string;
    value: Guide;
    indexes: { "by-updated": number };
  };
  images: {
    key: string;
    value: Blob;
  };
}

let dbPromise: Promise<IDBPDatabase<GuideDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<GuideDB>("guidejar", 1, {
      upgrade(db) {
        const guides = db.createObjectStore("guides", { keyPath: "id" });
        guides.createIndex("by-updated", "updatedAt");
        db.createObjectStore("images");
      },
    });
  }
  return dbPromise;
}

export function uid(): string {
  return crypto.randomUUID();
}

// ---- Guides --------------------------------------------------------------

export async function listGuides(): Promise<Guide[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("guides", "by-updated");
  return all.reverse(); // most recently updated first
}

export async function getGuide(id: string): Promise<Guide | undefined> {
  const db = await getDB();
  return db.get("guides", id);
}

export async function saveGuide(guide: Guide): Promise<void> {
  const db = await getDB();
  await db.put("guides", guide);
}

export async function createGuide(): Promise<Guide> {
  const now = Date.now();
  const guide: Guide = {
    id: uid(),
    title: "Untitled guide",
    description: "",
    steps: [],
    createdAt: now,
    updatedAt: now,
  };
  await saveGuide(guide);
  return guide;
}

export async function deleteGuide(id: string): Promise<void> {
  const db = await getDB();
  const guide = await db.get("guides", id);
  if (guide) {
    // Clean up the orphaned screenshots so storage doesn't leak.
    await Promise.all(guide.steps.map((s) => db.delete("images", s.imageId)));
  }
  await db.delete("guides", id);
}

// ---- Images --------------------------------------------------------------

export async function putImage(blob: Blob): Promise<string> {
  const db = await getDB();
  const id = uid();
  await db.put("images", blob, id);
  return id;
}

export async function getImage(id: string): Promise<Blob | undefined> {
  const db = await getDB();
  return db.get("images", id);
}

export async function deleteImage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("images", id);
}
