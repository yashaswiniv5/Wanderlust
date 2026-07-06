import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explorer from './pages/Explorer';
import Planner from './pages/Planner';
import SavedTrips from './pages/SavedTrips';
import Maps from './pages/Maps';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-light font-sans text-dark">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explorer" element={<Explorer />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/saved" element={<SavedTrips />} />
          <Route path="/maps" element={<Maps />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
