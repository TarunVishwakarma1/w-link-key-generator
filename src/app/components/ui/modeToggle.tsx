'use client'
import React, { useEffect, useState } from "react";
import { Switch } from "@nextui-org/react";
import { MoonIcon } from "./icons/MoonIcon";
import { SunIcon } from "./icons/SunIcon";
import { useTheme } from "next-themes";

export default function App() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Ensure theme is set based on initial load
  if (!mounted) {
    return null;
  }

  return (
    <Switch
      defaultSelected={theme === 'dark'?false:true}
      size="md"
      color="success"
      startContent={<SunIcon />}
      endContent={<MoonIcon />}
      onChange={toggleTheme}
    >
    </Switch>
  );
}
