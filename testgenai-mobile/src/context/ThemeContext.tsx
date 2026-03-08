import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { storage } from "../services/storage";
import { colors, ThemeColors } from "../theme/colors";

interface ThemeContextType {
  isDark: boolean;
  toggle: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === "dark");

  useEffect(() => {
    // Load saved theme preference
    storage.get("theme_mode").then((saved) => {
      if (saved === "dark") setIsDark(true);
      else if (saved === "light") setIsDark(false);
      // else use system default
    });
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      storage.set("theme_mode", next ? "dark" : "light");
      return next;
    });
  };

  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{ isDark, toggle, colors: themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
