// src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import Flashcard from './components/Flashcard.jsx';
import './App.css';

function App() {
  const [allCards, setAllCards] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [learningMode, setLearningMode] = useState('en-de');
  const [viewMode, setViewMode] = useState('grid');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [activeSheet, setActiveSheet] = useState('all');
  const [cardResetKey, setCardResetKey] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  const GOOGLE_SHEET_URLS = [ 
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?gid=0&single=true&output=csv",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?gid=342867880&single=true&output=csv",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?gid=567469483&single=true&output=csv",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?gid=1791893837&single=true&output=csv",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?gid=1208186779&single=true&output=csv",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?gid=1231527999&single=true&output=csv",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?gid=544651453&single=true&output=csv",
  ];

  useEffect(() => {
    const fetchSheet = (url) => {
      return new Promise((resolve, reject) => {
        Papa.parse(url, {
          download: true,
          header: true,
          skipEmptyLines: true,
          transformHeader: header => header.trim(),
          complete: (results) => resolve(results.data),
          error: (error) => reject(error),
        });
      });
    };

    Promise.all(GOOGLE_SHEET_URLS.map(url => fetchSheet(url)))
      .then(allSheetsData => {
        const cardsWithSource = allSheetsData.flatMap((sheetData, index) => 
          sheetData.map(card => ({ ...card, sheetIndex: index }))
        );
        setAllCards(cardsWithSource);
      })
      .catch(err => {
        console.error("Error fetching one or more sheets:", err);
        setError("Failed to load vocabulary. Check console.");
      })
      .finally(() => setLoading(false));
  }, []);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const displayedCards = useMemo(() => {
    const filteredCards = allCards.filter(card => {
      if (activeSheet === 'all') return true;
      return card.sheetIndex === activeSheet;
    });
    return isShuffled ? shuffleArray(filteredCards) : filteredCards;
  }, [allCards, activeSheet, isShuffled, shuffleKey]);

  const showNextCard = () => {
    setCurrentCardIndex(prevIndex => (prevIndex + 1) % displayedCards.length);
  };

  const showPrevCard = () => {
    setCurrentCardIndex(prevIndex => (prevIndex - 1 + displayedCards.length) % displayedCards.length);
  };

  const mixNew = () => {
    setCardResetKey(prev => prev + 1);
    setIsShuffled(true);
    setShuffleKey(prev => prev + 1);
    setCurrentCardIndex(0);
  };

  useEffect(() => {
    setCurrentCardIndex(0);
  }, [displayedCards]);

  if (loading) return <div className="loading-message">Loading Vocabulary...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="App">
      <h1>My Vocabulary Flashcards</h1>
      <p>Click on any card to flip it!</p>

      <div className="view-mode-selector">
        <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>Overview</button>
        <button className={viewMode === 'carousel' ? 'active' : ''} onClick={() => setViewMode('carousel')}>Single Card</button>
      </div>

      <div className="sheet-selector">
        <button className={activeSheet === 'all' ? 'active' : ''} onClick={() => setActiveSheet('all')}>Show All</button>
        {GOOGLE_SHEET_URLS.map((_, index) => (
          <button key={index} className={activeSheet === index ? 'active' : ''} onClick={() => setActiveSheet(index)}>Tab {index + 1}</button>
        ))}
      </div>

      <div className="mode-selector">
        <button className={learningMode === 'en-de' ? 'active' : ''} onClick={() => setLearningMode('en-de')}>English → German</button>
        <button className={learningMode === 'de-en' ? 'active' : ''} onClick={() => setLearningMode('de-en')}>German → English</button>
      </div>

      <div className="mix-new-container">
        <button className="mix-new-button" onClick={mixNew}>Mix new</button>
      </div>

      {viewMode === 'grid' ? (
        <div className="card-grid">
          {displayedCards.map((card, index) => (
            <Flashcard
              key={`${cardResetKey}-${index}`}
              front={learningMode === 'en-de' ? card.Front : card.Back}
              back={learningMode === 'en-de' ? card.Back : card.Front}
              sentence={card.Sentence}
              learningMode={learningMode}
            />
          ))}
        </div>
      ) : (
        // --- MODIFICATION: Layout optimized with a container ---
        <div className="carousel-container">
          <div className="carousel-view">
            {displayedCards.length > 0 && (
              <Flashcard
                key={`${cardResetKey}-${currentCardIndex}`}
                front={learningMode === 'en-de' ? displayedCards[currentCardIndex].Front : displayedCards[currentCardIndex].Back}
                back={learningMode === 'en-de' ? displayedCards[currentCardIndex].Back : displayedCards[currentCardIndex].Front}
                // --- FIX: Correctly access the sentence from the displayedCards array ---
                sentence={displayedCards[currentCardIndex].Sentence}
                learningMode={learningMode}
              />
            )}
          </div>
          <br/>
          <br/>
          {/* --- MOVED: The controls are now here, below the card --- */}
          {displayedCards.length > 0 && (
            <div className="carousel-controls">
              <button onClick={showPrevCard}>&lt;</button>
              <span>{currentCardIndex + 1} / {displayedCards.length}</span>
              <button onClick={showNextCard}>&gt;</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;