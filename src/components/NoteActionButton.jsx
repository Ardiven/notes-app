import React from 'react';

function NoteActionButton({ variant, onClick, icon }) {
  const handleClick = (e) => {
    e?.preventDefault?.();
    onClick?.(e);
  };

  return (
    <button
      className="action"
      type="button"
      onClick={handleClick}
      title={variant}
    >
      {icon}
    </button>
  );
}

export default NoteActionButton;
