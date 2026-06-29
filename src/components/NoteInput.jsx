import React from "react";
import useInput from "@hooks/useInput";
import NoteActionButton from "./NoteActionButton";
import {useNavigate} from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import useLang from "@hooks/useLang";

function NoteInput ({addNote}){
  const navigate = useNavigate();
  const { lang } = useLang();
  const [title, onTitleChangeEventHandler, setTitle] = useInput('');
  const [body, onBodyChangeEventHandler, setBody] = useInput('');

  const onSubmitEventHandler = async (event) => {
    event.preventDefault();

    await addNote({
      title,
      body,
    });

    setTitle('');
    setBody('');
    navigate('/');
  };

  return (
      <div className="add-new-page__input" data-testid="note-input">

          <input
            className="add-new-page__input__title"
            type="text"
            placeholder={lang === 'id' ? "Ini adalah judul ..." : "This is the title..."}
            value={title}
            onChange={onTitleChangeEventHandler}
            required
            data-testid="note-input-title-field"
          />
          <div className="add-new-page__perforation" />
          <textarea
            className="add-new-page__input__body"
            placeholder={lang === 'id' ? "Tuliskan catatanmu di sini ..." : "Write your note here..."}
            value={body}
            onChange={onBodyChangeEventHandler}
            required
            data-testid="note-input-body-field"
          />
          <div className="add-new-page__action">
            <NoteActionButton
              actionKey="save"
              icon={<FiCheckCircle/>}
              onClick={onSubmitEventHandler}
            />
          </div>
      </div>
    );
}

export default NoteInput;