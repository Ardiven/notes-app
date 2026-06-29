import React from 'react';
import useLang from '@hooks/useLang';

function SearchBar({ keyword, keywordChange }) {
  const { lang } = useLang();

  return (
    <section className="search-bar">
      <input
        type="text"
        placeholder={lang === 'id' ? 'Cari berdasarkan judul ...' : 'Search by title...'}
        value={keyword ?? ''}
        onChange={(event) => keywordChange?.(event.target.value)}
      />
    </section>
  );
}

export default SearchBar;