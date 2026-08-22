import React from "react";
import Typewriter from "typewriter-effect";

function Type() {
  return (
    <span className="type-line">
      <Typewriter
        options={{
          strings: [
            "Front-end Developer",
            "Back-end Developer",
            "Web App Developer",
            "React Developer"
          ],
          autoStart: true,
          loop: true,
          deleteSpeed: 50
        }}
      />
    </span>
  );
}

export default Type;
