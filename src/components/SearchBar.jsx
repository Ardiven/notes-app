import React from "react";
import { J, validateProps } from "../utils/validation";
import useLang from "../hooks/useLang";

const searchBarPropsSchema = J.object({
    keyword: J.string().min(0).required(),
    keywordChange: J.func().required(),
});

function SearchBar (props) {
    
    const { keyword, keywordChange } = validateProps(searchBarPropsSchema, props, 'SearchBar');
    const {lang} = useLang();
    
    return(
        <section className="search-bar">
            <input 
                type="text" 
                placeholder={lang === "id" ? "Cari berdasarkan judul ..." : "Search by title..." }
                value={keyword} 
                onChange={(event) => keywordChange(event.target.value)}
            />
         </section>
    )
}

export default SearchBar;