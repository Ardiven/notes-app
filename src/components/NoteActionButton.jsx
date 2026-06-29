import React from "react";
import useLang from "@hooks/useLang";

const ACTION_LABELS = {
  id: {
    archive: "Arsipkan",
    unarchive: "Pindahkan",
    delete: "Hapus",
    save: "Simpan",
    add: "Tambah",
  },
  en: {
    archive: "Archive",
    unarchive: "Unarchive",
    delete: "Delete",
    save: "Save",
    add: "Add",
  },
};

function NoteActionButton({ actionKey, onClick, icon }) {
  const { lang } = useLang();
  const labels = ACTION_LABELS[lang] || ACTION_LABELS.id;
  const label = labels[actionKey] || actionKey;

  const handleClick = (e) => {
    e?.preventDefault?.();
    onClick?.(e);
  };

  return (
    <button
      className="action"
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}

export default NoteActionButton;