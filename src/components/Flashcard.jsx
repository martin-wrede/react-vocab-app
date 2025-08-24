// src/components/Flashcard.jsx
import React, { useState } from 'react';
import './Flashcard.css';

// Update the props to accept "sentence"
function Flashcard({ front, back, sentence }) {
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
        {/* --- FRONT OF THE CARD --- */}
        <div className="flashcard-front">
          {/* Main word. A <p> tag with a class is more flexible than <h3> */}
          <p className="vocab-word">{front}</p>
          
          {/* Example sentence */}
          {sentence && <p className="example-sentence">{sentence}</p>}
        </div>
        
        {/* --- BACK OF THE CARD --- */}
        <div className="flashcard-back">
          <p className="vocab-word">{back}</p>
        </div>
      </div>
    </div>
  
  );
}

export default Flashcard;