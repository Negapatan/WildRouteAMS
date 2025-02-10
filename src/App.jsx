import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AnimatedRoutes from './components/AnimatedRoutes';
import { setFavicon } from './utils/favicon';

function App() {
  useEffect(() => {
    setFavicon();
  }, []);

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App; 