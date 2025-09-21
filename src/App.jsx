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
  const [learnedCardIds, setLearnedCardIds] = useState(new Set());
  const [learningFilter, setLearningFilter] = useState('all');

  // LocalStorage key for learned cards
  const LEARNED_CARDS_KEY = 'vocabulary_learned_cards';

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

  // Load learned cards on app start
  useEffect(() => {
    const urlLearned = loadLearnedFromURL();
    const localLearned = loadLearnedFromLocalStorage();

    // URL takes precedence over localStorage
    const initialLearned = urlLearned || localLearned;
    setLearnedCardIds(initialLearned);
  }, []);

  // Helper functions for learning system
  const getCardId = (card, originalIndex) => {
    return `${card.sheetIndex}-${originalIndex}`;
  };

  const loadLearnedFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(LEARNED_CARDS_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (error) {
      console.error('Error loading learned cards from localStorage:', error);
      return new Set();
    }
  };

  const saveLearnedToLocalStorage = (learnedSet) => {
    try {
      localStorage.setItem(LEARNED_CARDS_KEY, JSON.stringify([...learnedSet]));
    } catch (error) {
      console.error('Error saving learned cards to localStorage:', error);
    }
  };

  const loadLearnedFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const unlearned = urlParams.get('unlearned');
    if (unlearned) {
      const unlearnedIds = unlearned.split(',').filter(id => id.trim());
      // Convert to Set of all cards minus unlearned ones
      return new Set();
    }
    return null;
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const displayedCards = useMemo(() => {
    let filteredCardsWithOriginalIndex = allCards.map((card, originalIndex) => ({
      ...card,
      originalIndex
    })).filter((cardWithIndex) => {
      // Filter by sheet
      if (activeSheet !== 'all' && cardWithIndex.sheetIndex !== activeSheet) {
        return false;
      }

      // Filter by learning status
      const cardId = getCardId(cardWithIndex, cardWithIndex.originalIndex);
      if (learningFilter === 'learned') {
        return learnedCardIds.has(cardId);
      } else if (learningFilter === 'unlearned') {
        return !learnedCardIds.has(cardId);
      }
      // 'all' shows everything
      return true;
    });

    return isShuffled ? shuffleArray(filteredCardsWithOriginalIndex) : filteredCardsWithOriginalIndex;
  }, [allCards, activeSheet, isShuffled, shuffleKey, learningFilter, learnedCardIds]);

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

  const toggleCardLearned = (cardId) => {
    setLearnedCardIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      saveLearnedToLocalStorage(newSet);
      return newSet;
    });
  };

  const createBookmark = () => {
    const allCardIds = allCards.map((card, index) => getCardId(card, index));
    const unlearnedIds = allCardIds.filter(id => !learnedCardIds.has(id));
    const learnedCount = learnedCardIds.size;
    const totalCount = allCards.length;

    const url = new URL(window.location.href);
    url.searchParams.set('unlearned', unlearnedIds.join(','));
    url.searchParams.set('mode', learningMode);
    url.searchParams.set('sheet', activeSheet);

    // Create a descriptive bookmark title
    const sheetName = activeSheet === 'all' ? 'Alle Tabs' : `Tab ${activeSheet + 1}`;
    const modeText = learningMode === 'en-de' ? 'EN→DE' : 'DE→EN';
    const progressText = `${learnedCount}/${totalCount} gelernt`;
    const bookmarkTitle = `Vokabeln: ${sheetName} (${modeText}) - ${progressText}`;

    // Try to create a downloadable bookmark file for Windows
    try {
      const bookmarkContent = `[InternetShortcut]\r\nURL=${url.toString()}\r\nIconFile=${window.location.origin}/favicon.ico`;
      const blob = new Blob([bookmarkContent], { type: 'text/plain' });
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${bookmarkTitle.replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, '')}.url`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
      return;
    } catch (error) {
      console.log('Bookmark file download failed:', error);
    }
    
    // Fallback: Show instructions to user
    const message = `Um diesen Lernstand als Lesezeichen zu speichern:\n\n` +
                   `1. Drücken Sie Strg+D (oder Cmd+D auf Mac)\n` +
                   `2. Ändern Sie den Namen zu: "${bookmarkTitle}"\n` +
                   `3. Klicken Sie auf "Speichern"\n\n` +
                   `Alternativ: Rechtsklick auf diese Seite → "Lesezeichen hinzufügen"`;
    
    alert(message);
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

      <div className="learning-filter-selector">
        <button className={learningFilter === 'all' ? 'active' : ''} onClick={() => setLearningFilter('all')}>Alle Vokabeln</button>
        <button className={learningFilter === 'unlearned' ? 'active' : ''} onClick={() => setLearningFilter('unlearned')}>Noch zu lernen</button>
        <button className={learningFilter === 'learned' ? 'active' : ''} onClick={() => setLearningFilter('learned')}>Gelernte</button>
      </div>

      <div className="mix-new-container">
        <button className="mix-new-button" onClick={mixNew}>Mix new</button>
        <button className="bookmark-progress-button" onClick={createBookmark}>Als Lesezeichen speichern</button>
      </div>

      {viewMode === 'grid' ? (
        <div className="card-grid">
          {displayedCards.map((card, index) => {
            const cardId = getCardId(card, card.originalIndex);
            return (
              <Flashcard
                key={`${cardResetKey}-${index}`}
                front={learningMode === 'en-de' ? card.Front : card.Back}
                back={learningMode === 'en-de' ? card.Back : card.Front}
                sentence={card.Sentence}
                learningMode={learningMode}
                cardId={cardId}
                isLearned={learnedCardIds.has(cardId)}
                onToggleLearned={toggleCardLearned}
              />
            );
          })}
        </div>
      ) : (
        // --- MODIFICATION: Layout optimized with a container ---
        <div className="carousel-container">
          <div className="carousel-view">
            {displayedCards.length > 0 && (() => {
              const currentCard = displayedCards[currentCardIndex];
              const cardId = getCardId(currentCard, currentCard.originalIndex);
              return (
                <Flashcard
                  key={`${cardResetKey}-${currentCardIndex}`}
                  front={learningMode === 'en-de' ? currentCard.Front : currentCard.Back}
                  back={learningMode === 'en-de' ? currentCard.Back : currentCard.Front}
                  sentence={currentCard.Sentence}
                  learningMode={learningMode}
                  cardId={cardId}
                  isLearned={learnedCardIds.has(cardId)}
                  onToggleLearned={toggleCardLearned}
                />
              );
            })()}
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