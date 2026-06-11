import React from "react";
import NoteList from "../components/NoteList";
import SearchBar from "../components/SearchBar";
import NoteActionButton from "../components/NoteActionButton";
import { FiPlus } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import useNote from "../hooks/useNote";
import useLang from "../hooks/useLang";

function ArchivePage() {
  const { notes, fetchArchiveNotes } = useNote();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const keyword = searchParams.get('keyword') || '';
  const { lang } = useLang();

  React.useEffect(() =>{
    fetchArchiveNotes();
  }, [])

  console.log("page", notes);

  function onKeywordChangeHandler(keyword) {
    setSearchParams({ keyword });
  }

    const filteredNotes = (notes || [])
    .filter(note => note && note.title && note.title.toLowerCase().includes(keyword.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (

        <main>
          <section className="homepage">
              <h2>{lang === "id" ? "Catatan arsip" : "Archive Notes" }</h2>

              <SearchBar
              keyword={keyword}
              keywordChange={onKeywordChangeHandler}
              />

              <NoteList notes={filteredNotes} />

              <div className="homepage__action">
              <NoteActionButton
                  variant="Tambah"
                  onClick={() => navigate('/notes/new')}
                  icon={<FiPlus />}
              />
              </div>
          </section>
        </main>
  );
}

export default ArchivePage;