// src/App.js
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Flashcard from './components/Flashcard.jsx';
import './App.css';

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- IMPORTANT ---
  // Replace this URL with the one you got from "Publish to the web"
  /// const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?output=csv';

   const GOOGLE_SHEET_URLS = [
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pubhtml?gid=0&single=true",
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
        // allSheetsData is now an array of arrays, e.g., [[...sheet1_cards], [...sheet2_cards]]
        console.log("Data from all sheets:", allSheetsData);
        
        // Flatten the array of arrays into a single array of cards
        const combinedCards = allSheetsData.flat();
        
        console.log("Combined cards:", combinedCards);
        setCards(combinedCards);
      })
      .catch(err => {
        console.error("Error fetching one or more sheets:", err);
        setError("Failed to load vocabulary from one or more sheets. Check the console.");
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

   
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
      <div className="card-grid">
        {cards.map((card, index) => (
          <Flashcard key={index} front={card.Front} back={card.Back} 
           sentence={card.Sentence} // Pass the sentence data as a prop
          />
        ))}
      </div>
    </div>
  );
}

export default App;