// src/App.jsx
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Flashcard from './components/Flashcard.jsx';
import './App.css';

function App() {
  // --- MODIFIED: Rename 'cards' to 'allCards' to store the complete dataset ---
  const [allCards, setAllCards] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [learningMode, setLearningMode] = useState('en-de');

  // --- NEW: State to manage the currently selected sheet filter ---
  // We'll use the index of the sheet (0, 1, 2...) or 'all'
  const [activeSheet, setActiveSheet] = useState('all');
  // --- IMPORTANT ---
  // Replace this URL with the one you got from "Publish to the web"
  /// const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?output=csv';

   const GOOGLE_SHEET_URLS = [
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?gid=0&single=true&output=csv",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?gid=342867880&single=true&output=csv",
"https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?gid=567469483&single=true&output=csv",
"https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?gid=1791893837&single=true&output=csv",
"https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?gid=1208186779&single=true&output=csv",
"https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?gid=1231527999&single=true&output=csv",
"https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?gid=544651453&single=true&output=csv",
]


  useEffect(() => {
    // A function to fetch and parse a single sheet URL
    const fetchSheet = (url) => {
      return new Promise((resolve, reject) => {
        Papa.parse(url, {
          download: true,
          header: true,
          skipEmptyLines: true,
          transformHeader: header => header.trim(),
          complete: (results) => {
            resolve(results.data);
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    };
 // Use Promise.all to fetch all sheets at the same time
    Promise.all(GOOGLE_SHEET_URLS.map(url => fetchSheet(url)))
      .then(allSheetsData => {
        // --- MODIFIED: Tag each card with its source sheet index ---
        const cardsWithSource = allSheetsData.flatMap((sheetData, index) => 
          sheetData.map(card => ({
            ...card,        // Keep the original card data (Front, Back, etc.)
            sheetIndex: index // Add the source index (0, 1, 2...)
          }))
        );

        console.log("All cards with source index:", cardsWithSource);
        setAllCards(cardsWithSource); // Store the complete, tagged dataset
      })
      .catch(err => {
        console.error("Error fetching one or more sheets:", err);
        setError("Failed to load vocabulary from one or more sheets. Check the console.");
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

    // --- NEW: Derive the cards to display based on the active filter ---
  const displayedCards = allCards.filter(card => {
    if (activeSheet === 'all') {
      return true; // Show all cards
    }
    return card.sheetIndex === activeSheet; // Show only cards from the selected sheet
  });

  
  if (loading) {
    return <div className="loading-message">Loading Vocabulary...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
   
  if (loading) {
    return <div className="loading-message">Loading Vocabulary...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="App">
      <h1>My Vocabulary Flashcards</h1>
      <p>Click on any card to flip it!</p>
       <div className="sheet-selector">
        <button
          className={activeSheet === 'all' ? 'active' : ''}
          onClick={() => setActiveSheet('all')}
        >
          Show All
        </button>
        {/* Create a button for each sheet URL */}
        {GOOGLE_SHEET_URLS.map((url, index) => (
          <button
            key={index}
            className={activeSheet === index ? 'active' : ''}
            onClick={() => setActiveSheet(index)}
          >
            Tab {index + 1}
          </button>
        ))}
      </div>
        <div className="mode-selector">
        <button
          className={learningMode === 'en-de' ? 'active' : ''}
          onClick={() => setLearningMode('en-de')}
        >
          English → German
        </button>
        <button
          className={learningMode === 'de-en' ? 'active' : ''}
          onClick={() => setLearningMode('de-en')}
        >
          German → English
        </button>
      </div>
   <div className="card-grid">
        {/* --- MODIFIED: Map over 'displayedCards' instead of 'cards' --- */}
        {displayedCards.map((card, index) => (
          <Flashcard 
            key={index} 
            front={learningMode === 'en-de' ? card.Front : card.Back} 
            back={learningMode === 'en-de' ? card.Back : card.Front}
            sentence={learningMode === 'en-de' ? card.Sentence : null}
          />
        ))}
      </div>
    </div>
  );
}


export default App;