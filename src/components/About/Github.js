import React from "react";
import GitHubCalendar from "react-github-calendar";
import { useTheme } from "../../theme/ThemeContext";

const ACCENTS = {
  dark: "#c770f0",
  light: "#8b36d9"
};

function Github() {
  const { theme } = useTheme();

  return (
    <div className="github-cal" style={{ marginTop: "clamp(40px, 6vh, 64px)" }}>
      <p className="eyebrow">Days I code</p>
      <GitHubCalendar
        key={theme}
        username="hustlincode"
        blockSize={13}
        blockMargin={4}
        fontSize={13}
        color={ACCENTS[theme]}
      />
    </div>
  );
}

export default Github;
