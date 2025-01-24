import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import CompareFiles from './CompareFiles';
import Login from './Login';
import SummarisePolicy from './SummarisePolicy';
import YourFiles from './YourFiles';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/compare-files" element={<CompareFiles />} />
        <Route path="/" element={<Login />} />
        <Route path="/your-files" element={<YourFiles />} />
        <Route path="/summarise-policy" element={<SummarisePolicy />} />
      </Routes>
    </Router>
  );
}

export default App;