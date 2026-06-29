import React from 'react';
import { formatDate } from '@utils/formatDate';

function NoteDetail({ note }) {
  if (!note) return null;

  return (
    <section className="detail-page">
      <h3 className="detail-page__title">{note.title}</h3>
      <p className="detail-page__createdAt">{formatDate(note.createdAt)}</p>
      <div className="detail-page__body">{note.body}</div>
    </section>
  );
}

export default NoteDetail;
