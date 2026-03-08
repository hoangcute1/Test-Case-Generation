import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

const SettingsPage = () => {
  const { isDark, toggle } = useTheme();

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences</p>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            <div>
              <h3 className="font-medium text-foreground">Appearance</h3>
              <p className="text-sm text-muted-foreground">Toggle dark/light mode</p>
            </div>
          </div>
          <button
            onClick={toggle}
            className={`relative w-12 h-7 rounded-full transition-colors ${isDark ? "bg-primary" : "bg-muted"}`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-primary-foreground shadow-sm transition-transform ${
                isDark ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
