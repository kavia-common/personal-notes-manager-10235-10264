import { component$ } from "@builder.io/qwik";
import type { PropFunction } from "@builder.io/qwik";

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

type Props = {
  note: Note;
  onEdit$: PropFunction<(note: Note) => void>;
  onDelete$: PropFunction<(id: string) => void>;
};

/**
 * Renders a note card with title, dates, and actions.
 */
// PUBLIC_INTERFACE
export const NoteCard = component$<Props>(({ note, onEdit$, onDelete$ }) => {
  const dateFmt = (ts: number) =>
    new Date(ts).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <article class="note-card" aria-label={`Note ${note.title}`}>
      <h3 class="note-title">{note.title || "Untitled"}</h3>
      <div class="note-meta">
        <span>Created: {dateFmt(note.createdAt)}</span>
        <span> • Updated: {dateFmt(note.updatedAt)}</span>
      </div>
      <div class="note-content">{note.content}</div>
      <div class="note-actions">
        <button class="icon-btn" onClick$={() => onEdit$(note)} aria-label="Edit note">
          ✏️ Edit
        </button>
        <button class="icon-btn danger" onClick$={() => onDelete$(note.id)} aria-label="Delete note">
          🗑 Delete
        </button>
      </div>
    </article>
  );
});

export default NoteCard;
