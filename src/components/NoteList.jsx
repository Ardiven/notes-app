import React from 'react';
import NoteItem from './NoteItem';
import { J, validateProps } from '../utils/validation';
import useLang from '../hooks/useLang';

const notesListPropsSchema = J.object({
  notes: J.array().items(J.object({
    id: J.number().required(),
    title: J.string().min(1).required(),
    createdAt: J.string().required(),
    body: J.string().min(1).required(),
    archived: J.boolean().required(),
  })).required(),
});

function NotesList(props) {

  const { notes } = validateProps(notesListPropsSchema, props, 'NotesList');
  const { lang } = useLang();

  const hasNotes = notes && notes.length > 0; 

  if (!hasNotes) {
    return (
      <div
        className="notes-list-empty">
          <p className="notes-list__empty">{lang === "id" ? "Tidak ada catatan" : "No notes"}</p>
      </div>
    );
  }

  return (
    <div className="notes-list">
      {
        notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
          />
        ))
      }
      </div>
  );
}

export default NotesList;
