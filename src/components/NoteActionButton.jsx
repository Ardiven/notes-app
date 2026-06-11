import React from "react";
import {J, validateProps } from "../utils/validation";

const buttonSchema = J.object({
  variant: J.string().required(),
  onClick: J.func().required(),
  note: J.object().optional(),
  icon: J.any().required(),
});



function NoteActionButton(props){
  const { variant, onClick, note, icon } = validateProps(buttonSchema, props, 'NoteActionButton');
  return(
      <button
        className="action"
        type="button"
          onClick={(e) => note ? onClick(note.id, e) : onClick(e) }
        title={variant}
      >
        {icon}
      </button>
  );
}

export default NoteActionButton;