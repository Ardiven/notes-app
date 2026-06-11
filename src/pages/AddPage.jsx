import React from "react";
import NoteInput from "../components/NoteInput";
import { useNavigate } from "react-router-dom";
import useNote from "../hooks/useNote";



function AddPage () {
    const {addNote} = useNote();

    const handlerAddNote = (Note) => {
        addNote(Note)
    }

    return(
        <main>
            <section className="add-new-page">
                <NoteInput addNote={handlerAddNote}/>
            </section>
        </main>
    )
}

export default AddPage;