import React from "react";

const ThemeContext = React.createContext({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("theme") || "dark";
  });

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const value = React.useMemo(
    () => ({ theme, toggleTheme }),
    [theme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export default ThemeContext;
