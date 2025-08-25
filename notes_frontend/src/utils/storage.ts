export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "qwik-notes-v1";

/**
 * Load all notes from localStorage.
 */
// PUBLIC_INTERFACE
export function loadNotes(): Note[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: Note[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persist notes to localStorage.
 */
// PUBLIC_INTERFACE
export function saveNotes(notes: Note[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

/**
 * Create a new note and persist.
 */
// PUBLIC_INTERFACE
export function createNote(partial: Pick<Note, "title" | "content">): Note {
  const now = Date.now();
  const note: Note = {
    id: cryptoRandomId(),
    title: partial.title.trim(),
    content: partial.content.trim(),
    createdAt: now,
    updatedAt: now,
  };
  const notes = loadNotes();
  notes.unshift(note);
  saveNotes(notes);
  return note;
}

/**
 * Update an existing note by id. Returns updated note or undefined if missing.
 */
// PUBLIC_INTERFACE
export function updateNote(id: string, patch: Partial<Pick<Note, "title" | "content">>): Note | undefined {
  const notes = loadNotes();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return undefined;
  const updated: Note = {
    ...notes[idx],
    ...patch,
    title: (patch.title ?? notes[idx].title).trim(),
    content: (patch.content ?? notes[idx].content).trim(),
    updatedAt: Date.now(),
  };
  notes[idx] = updated;
  saveNotes(notes);
  return updated;
}

/**
 * Delete a note by id. Returns true if removed.
 */
// PUBLIC_INTERFACE
export function deleteNote(id: string): boolean {
  const notes = loadNotes();
  const next = notes.filter((n) => n.id !== id);
  const changed = next.length !== notes.length;
  if (changed) saveNotes(next);
  return changed;
}

/**
 * Simple id generator using crypto if available, fallback to Math.random.
 */
function cryptoRandomId(): string {
  try {
    // @ts-ignore
    if (crypto && "randomUUID" in crypto) {
      // @ts-ignore
      return crypto.randomUUID();
    }
  } catch (_err) {
    // Fallback below if crypto is unavailable or throws
  }
  return "id-" + Math.random().toString(36).slice(2, 10);
}
