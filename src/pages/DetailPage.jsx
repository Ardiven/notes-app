import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import useNote from "@hooks/useNote";
import NoteDetail from "@components/NoteDetail";
import NoteActionButton from "@components/NoteActionButton";
import Loading from "@components/Loading";
import { FiArchive, FiTrash2, FiShare } from "react-icons/fi";

function DetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { notes, loading, archiveNote, unArchiveNote, getSingleNote, deleteNote } = useNote();

    React.useEffect(() => {
        getSingleNote(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleArchive = async (note) => {
        if (note.archived) {
            await unArchiveNote(note.id);
        } else {
            await archiveNote(note.id);
        }
        navigate('/');
    };

    const handleDelete = async (note) => {
        await deleteNote(note.id);
        navigate('/');
    };

    if (loading || !notes || notes.length === 0) {
        return <Loading />;
    }

    const note = notes[0];

    return (
        <>
            <NoteDetail note={note} />
            <div className="detail-page__action">
                <NoteActionButton
                    actionKey={note.archived ? "unarchive" : "archive"}
                    onClick={() => handleArchive(note)}
                    icon={note.archived ? <FiShare /> : <FiArchive />}
                />
                <NoteActionButton
                    actionKey="delete"
                    onClick={() => handleDelete(note)}
                    icon={<FiTrash2 />}
                />
            </div>
        </>
    );
}

export default DetailPage;
