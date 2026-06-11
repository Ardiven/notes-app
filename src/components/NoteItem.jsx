import React from 'react';
import { Link } from "react-router-dom";
import { J, validateProps } from "../utils/validation";

const noteItemPropsSchema = J.object({
  note: J.object({
    id: J.number().required(),
    title: J.string().min(1).required(),
    createdAt: J.string().required(),
    body: J.string().min(1).required(),
    archived: J.boolean().required(),
  }).required(),
});
const showFormattedDate = (date) => {
  const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
  };
  return new Date(date).toLocaleDateString('id-ID', options);
};

function NoteItem({ note }) {
  validateProps(noteItemPropsSchema, { note }, 'NoteItem');
  return (
    <div
      className="note-item"
      data-testid="note-item"
      data-note-id={note?.id}
    >
      <div className="note-item__content" data-testid="note-item-content">
        <Link to={`/notes/${note.id}`}>{note.title}</Link>
        <p className="note-item__date" data-testid="note-item-date">
          {showFormattedDate(note.createdAt)}
        </p>
        <p className="note-item__body" data-testid="note-item-body">
          {note.body}
        </p>
      </div>
      
    </div>
  );
}

export default NoteItem;
