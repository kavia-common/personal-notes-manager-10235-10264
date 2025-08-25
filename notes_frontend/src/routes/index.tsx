import { $, component$, useComputed$, useSignal, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Modal } from "~/components/Modal";
import { NoteCard } from "~/components/NoteCard";
import type { Note } from "~/components/NoteCard";
import { createNote, deleteNote, loadNotes, saveNotes, updateNote } from "~/utils/storage";

// PUBLIC_INTERFACE
export default component$(() => {
  // state
  const notesSig = useSignal<Note[]>([]);
  const query = useSignal("");
  const modalOpen = useSignal(false);
  const editNoteSig = useSignal<Note | null>(null);
  const formTitle = useSignal("");
  const formContent = useSignal("");
  const sortBy = useSignal<"updated" | "created" | "title">("updated");

  // load from storage on mount
  useTask$(() => {
    notesSig.value = loadNotes();
  });

  const filteredNotes = useComputed$(() => {
    const q = query.value.trim().toLowerCase();
    let list = notesSig.value;
    if (q) {
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    if (sortBy.value === "updated") {
      sorted.sort((a, b) => b.updatedAt - a.updatedAt);
    } else if (sortBy.value === "created") {
      sorted.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    return sorted;
  });

  const openCreate$ = $(() => {
    editNoteSig.value = null;
    formTitle.value = "";
    formContent.value = "";
    modalOpen.value = true;
  });

  const openEdit$ = $((n: Note) => {
    editNoteSig.value = n;
    formTitle.value = n.title;
    formContent.value = n.content;
    modalOpen.value = true;
  });

  const closeModal$ = $(() => {
    modalOpen.value = false;
  });

  const submitForm$ = $(() => {
    const title = formTitle.value.trim();
    const content = formContent.value.trim();
    if (!title && !content) {
      // no empty note
      modalOpen.value = false;
      return;
    }
    if (editNoteSig.value) {
      const updated = updateNote(editNoteSig.value.id, { title, content });
      if (updated) {
        notesSig.value = notesSig.value.map((n) =>
          n.id === updated.id ? updated : n,
        );
      }
    } else {
      const created = createNote({ title, content });
      notesSig.value = [created, ...notesSig.value];
    }
    modalOpen.value = false;
  });

  const removeNote$ = $((id: string) => {
    const ok = deleteNote(id);
    if (ok) {
      notesSig.value = notesSig.value.filter((n) => n.id !== id);
    }
  });

  const clearAll$ = $(() => {
    if (confirm("Delete all notes? This cannot be undone.")) {
      notesSig.value = [];
      saveNotes([]);
    }
  });

  return (
    <>
      <div class="toolbar">
        <div class="search" role="search">
          <span aria-hidden="true">🔎</span>
          <input
            placeholder="Search notes..."
            value={query.value}
            onInput$={(e) => (query.value = (e.target as HTMLInputElement).value)}
          />
        </div>
        <button class="btn" onClick$={openCreate$}>＋ New Note</button>
        <button class="btn secondary" onClick$={clearAll$}>Clear All</button>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          <label html-for="sort-select" style={{ color: "var(--color-muted)", fontSize: "12px" }}>
            Sort by
          </label>
          <select
            id="sort-select"
            class="input"
            style={{ width: "160px", padding: "8px 10px" }}
            value={sortBy.value}
            onChange$={(e) => (sortBy.value = (e.target as HTMLSelectElement).value as any)}
          >
            <option value="updated">Last updated</option>
            <option value="created">Created</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      {filteredNotes.value.length === 0 ? (
        <div class="empty">
          <p>No notes yet. Create your first note!</p>
        </div>
      ) : (
        <section class="notes-grid" aria-label="Notes list">
          {filteredNotes.value.map((n) => (
            <NoteCard key={n.id} note={n} onEdit$={openEdit$} onDelete$={removeNote$} />
          ))}
        </section>
      )}

      <Modal
        open={modalOpen.value}
        title={editNoteSig.value ? "Edit note" : "New note"}
        onClose$={closeModal$}
      >
        <label>
          <div style={{ fontSize: "12px", color: "var(--color-muted)", marginBottom: "6px" }}>
            Title
          </div>
          <input
            class="input"
            placeholder="Note title"
            value={formTitle.value}
            onInput$={(e) => (formTitle.value = (e.target as HTMLInputElement).value)}
          />
        </label>
        <label>
          <div style={{ fontSize: "12px", color: "var(--color-muted)", marginBottom: "6px" }}>
            Content
          </div>
          <textarea
            class="textarea"
            placeholder="Write your note here..."
            value={formContent.value}
            onInput$={(e) => (formContent.value = (e.target as HTMLTextAreaElement).value)}
          />
        </label>
        <div class="modal-footer">
          <button class="btn secondary" onClick$={closeModal$}>Cancel</button>
          <button class="btn" onClick$={submitForm$}>
            {editNoteSig.value ? "Save changes" : "Create"}
          </button>
        </div>
      </Modal>
    </>
  );
});

export const head: DocumentHead = {
  title: "Notes",
  meta: [
    {
      name: "description",
      content: "Create, view, edit, and delete personal notes.",
    },
  ],
};
