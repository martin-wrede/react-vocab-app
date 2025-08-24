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
  const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT-2mqr3uDfC-YjQSWmoYwMILDtPZsyodBgvSk2xP8z9z7Uo1KxCySM_RUSbM8uDcTgAusNRSmNUvaO/pub?output=csv';

   
  useEffect(() => {
    Papa.parse(GOOGLE_SHEET_URL, {
      download: true,
      header: true, // This assumes the first row of your CSV is the header
      complete: (results) => {
        // We expect headers 'Front' and 'Back'.
        // Filter out any empty rows that Google Sheets might add.
        const validData = results.data.filter(row => row.Front && row.Front.trim() !== '');
        setCards(validData);
        setLoading(false);
      },
      error: (error) => {
        console.error("Error fetching or parsing data:", error);
        setError("Failed to load vocabulary. Please check the Google Sheet URL and make sure it's published correctly as a CSV.");
        setLoading(false);
      }
    });
  }, []); // The empty array means this effect runs once on component mount

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