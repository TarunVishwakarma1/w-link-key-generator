'use client'
import React, { useEffect, useState } from "react";
import { Switch } from "@nextui-org/react";
import { MoonIcon } from "./icons/MoonIcon";
import { SunIcon } from "./icons/SunIcon";
import { useTheme } from "next-themes";

export default function App() {
  const { setTheme, theme } = useTheme();
  const [getTheme, setGetTheme] = useState(Boolean);
  // When mounted on client, now we can show the UI
  React.useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
      setTheme('dark');
      setGetTheme(false)
    } else {
      document.body.classList.remove("dark");
      setTheme('light');
      setGetTheme(true)
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Ensure theme is set based on initial load

  return (
    <Switch
      isSelected={getTheme}
      size="md"
      color="success"
      startContent={<SunIcon />}
      endContent={<MoonIcon />}
      onChange={toggleTheme}
    >
    </Switch>
  );
}
