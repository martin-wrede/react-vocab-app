// src/components/Flashcard.jsx
import React, { useState } from 'react';
import './Flashcard.css';
 
function Flashcard({ front, back, sentence, learningMode, cardId, isLearned, onToggleLearned }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleLearnedToggle = (e) => {
    e.stopPropagation(); // Prevent card flip when clicking learned button
    if (onToggleLearned && cardId) {
      onToggleLearned(cardId);
    }
  };

    return (
    <div
      className={`flashcard ${isFlipped ? 'is-flipped' : ''} ${isLearned ? 'learned' : ''}`}
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

      {/* Learned toggle button */}
      {cardId && (
        <button
          className={`learned-toggle ${isLearned ? 'learned' : 'unlearned'}`}
          onClick={handleLearnedToggle}
          title={isLearned ? 'Als ungelernt markieren' : 'Als gelernt markieren'}
        >
          {isLearned ? '✓' : '○'}
        </button>
      )}
    </div>
  );
}

export default Flashcard;
