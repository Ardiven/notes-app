import React from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen } from 'react-icons/fi';
import NoteItem from '@components/NoteItem';
import useLang from '@hooks/useLang';

function NoteList({ notes, isArchive = false, onAddNew }) {
  const { lang } = useLang();

  const safeNotes = Array.isArray(notes) ? notes : [];
  const hasNotes = safeNotes.length > 0;

  if (!hasNotes) {
    const empty = isArchive
      ? {
          title: lang === 'id' ? 'Tidak ada catatan arsip' : 'No archived notes',
          subtitle: lang === 'id'
            ? 'Catatan yang diarsipkan akan muncul di sini.'
            : 'Notes you archive will appear here.',
        }
      : {
          title: lang === 'id' ? 'Belum ada catatan' : 'No notes yet',
          subtitle: lang === 'id'
            ? 'Tambah catatan pertamamu untuk mulai menulis.'
            : 'Add your first note to get started.',
        };

    return (
      <div className="notes-list-empty" data-testid="notes-list-empty">
        <FiBookOpen className="notes-list-empty__icon" aria-hidden="true" />
        <p className="notes-list-empty__title">{empty.title}</p>
        <p className="notes-list-empty__subtitle">{empty.subtitle}</p>
        {!isArchive && onAddNew && (
          <button
            type="button"
            className="notes-list-empty__action"
            onClick={onAddNew}
          >
            {lang === 'id' ? 'Tambah catatan' : 'Add a note'}
          </button>
        )}
        {isArchive && (
          <p className="notes-list-empty__hint">
            <Link to="/">
              {lang === 'id' ? 'Lihat catatan aktif →' : 'See active notes →'}
            </Link>
          </p>
        )}
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