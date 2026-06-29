import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '@utils/formatDate';

function NoteItem({ note }) {
  if (!note || note.id == null) return null;

  return (
    <div
      className="note-item"
      data-testid="note-item"
      data-note-id={note.id}
    >
      <div className="note-item__content" data-testid="note-item-content">
        <Link to={`/notes/${note.id}`}>{note.title}</Link>
        <p className="note-item__date" data-testid="note-item-date">
          {formatDate(note.createdAt)}
        </p>
        <p className="note-item__body" data-testid="note-item-body">
          {note.body}
        </p>
      </div>
    </div>
  );
}

export default NoteItem;