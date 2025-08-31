// src/components/Flashcard.jsx
import React, { useState } from 'react';
import './Flashcard.css';
 
// --- ADD 'learningMode' TO THE PROPS ---
function Flashcard({ front, back, sentence, learningMode }) {
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
          <p className="vocab-word">{front}</p>
          {/* Only show sentence on the front if it's English -> German mode */}
          {learningMode === 'en-de' && sentence && (
            <p className="example-sentence">{sentence}</p>
          )}
        </div>
        
        {/* --- BACK OF THE CARD --- */}
        <div className="flashcard-back">
          <p className="vocab-word">{back}</p>
          {/* Only show sentence on the back if it's German -> English mode */}
          {learningMode === 'de-en' && sentence && (
            <p className="example-sentence">{sentence}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Flashcard;
