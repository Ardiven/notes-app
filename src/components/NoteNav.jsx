import React from "react";
import { Link } from "react-router-dom";
import useLang from "../hooks/useLang";



function NoteNav() {
    const {lang} = useLang();

    return (
        <nav className="navigation">
            <ul>
                <li>
                    <Link to="/archives">{ lang === 'id' ? 'Arsip' : 'Archive'}</Link>
                </li>
            </ul>
        </nav>
    );
}

export default NoteNav;