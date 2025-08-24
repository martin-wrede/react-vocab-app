// src/components/Flashcard.js
import React, { useState } from 'react';
import './Flashcard.css';

function Flashcard({ front, back }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}
      onClick={handleClick}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <p>{front}</p>
        </div>
        <div className="flashcard-back">
          <p>{back}</p>
        </div>
      </div>
    </div>
  );
}

export default Flashcard;