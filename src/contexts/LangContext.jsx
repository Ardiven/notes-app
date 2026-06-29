import React from "react";

const LangContext = React.createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = React.useState('id');

  const toggleLang = React.useCallback(() => {
    setLang((prevLang) => (prevLang === 'id' ? 'en' : 'id'));
  }, []);

  const langContextValue = React.useMemo(() => ({
    lang,
    toggleLang,
  }), [lang, toggleLang]);

  return (
    <LangContext.Provider value={langContextValue}>
      {children}
    </LangContext.Provider>
  );
}

export default LangContext;