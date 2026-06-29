import { useContext } from "react";
import LangContext from "@contexts/LangContext";

export default function useLang() {
  return useContext(LangContext);
}