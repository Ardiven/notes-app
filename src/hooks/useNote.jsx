import { useContext } from "react";
import NotesContext from "@contexts/NotesContext";

export default function useNote() {
  return useContext(NotesContext);
}