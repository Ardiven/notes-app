import React from "react";
import useLang from "@hooks/useLang";

function Loading({ label }) {
  const { lang } = useLang();

  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="loading__spinner" aria-hidden="true" />
      <span className="loading__label">
        {label || (lang === "id" ? "Memuat..." : "Loading...")}
      </span>
    </div>
  );
}

export default Loading;