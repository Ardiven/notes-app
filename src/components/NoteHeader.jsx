import React from "react";
import NoteNav from "@components/NoteNav";
import { Link, useNavigate } from "react-router-dom";
import LangContext from "@contexts/LangContext";
import ThemeContext from "@contexts/ThemeContext";
import { MdGTranslate  } from "react-icons/md";
import { FiSun, FiMoon, FiLogOut  } from "react-icons/fi";
import useAuth from "@hooks/useAuth";

function NoteHeader() {
    const {lang, toggleLang} = React.useContext(LangContext);
    const {theme, toggleTheme} = React.useContext(ThemeContext);
    const {onlogout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = (e) => {
        e.preventDefault();
        onlogout();
        navigate('/');
    };

    return (
        <>
            <h1><Link to="/">{lang === 'id' ? 'Aplikasi Catatan' : 'Note App'}</Link></h1>
            <NoteNav />
            <button className="toggle-lang" onClick={toggleLang}><MdGTranslate  /></button>
            <button className="toggle-theme" onClick={toggleTheme}> {theme === 'light' ? <FiMoon /> : <FiSun /> }</button>
            <button className="button-logout" onClick={handleLogout}><FiLogOut /></button>
        </>
    );
}

export default NoteHeader;