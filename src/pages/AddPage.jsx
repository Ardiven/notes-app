import React from "react";
import NoteInput from "@components/NoteInput";
import useNote from "@hooks/useNote";

function AddPage() {
    const { addNote, notesError } = useNote();

    const handlerAddNote = async (note) => {
        await addNote(note);
    };

    return (
        <main>
            <section className="add-new-page">
                <NoteInput addNote={handlerAddNote} />
                {notesError && <p className="form-error">{notesError}</p>}
            </section>
        </main>
    );
}

export default AddPage;