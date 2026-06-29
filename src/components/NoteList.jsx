import React from 'react';
import NoteItem from './NoteItem';
import useLang from '@hooks/useLang';

function NoteList({ notes }) {
  const { lang } = useLang();

  const safeNotes = Array.isArray(notes) ? notes : [];
  const hasNotes = safeNotes.length > 0;

  if (!hasNotes) {
    return (
      <div className="notes-list-empty">
        <p className="notes-list__empty">
          {lang === 'id' ? 'Tidak ada catatan' : 'No notes'}
        </p>
      </div>
    );
  }

  return (
    <div className="notes-list">
      {safeNotes.map((note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </div>
  );
}

export default NoteList;