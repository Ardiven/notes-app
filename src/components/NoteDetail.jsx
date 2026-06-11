import React from "react";
import {J, validateProps } from "../utils/validation";

const noteDetailPropsSchema = J.object({
    note: J.object().required(),
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

function NoteDetail(props) {
    const { note } = validateProps(noteDetailPropsSchema, props, 'NoteDetail');

 
    return (
        <section className="detail-page">
            <h3 className="detail-page__title">{note.title}</h3>
            <p className="detail-page__createdAt">{showFormattedDate(note.createdAt)}</p>
            <div className="detail-page__body">
                {note.body}
            </div>
        </section>
    );
}

export default NoteDetail;