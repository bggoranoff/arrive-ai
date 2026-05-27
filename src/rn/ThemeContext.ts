import { createContext, useContext } from "react";
import { getColors, type ThemeMode } from "./theme";

const ThemeContext = createContext(getColors("light"));

export const ThemeProvider = ThemeContext.Provider;

export function useThemeColors() {
  return useContext(ThemeContext);
}
