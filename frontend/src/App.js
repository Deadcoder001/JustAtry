import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import MapView from './components/MapView';
import About from './components/About';
import Debug from './components/Debug'; // Add this import
import './App.css';

// Add modern font import to index.html or add this style
const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  body {
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #333;
    background-color: #fafafa;
  }
  
  * {
    box-sizing: border-box;
  }
  
  button, input, select {
    font-family: 'Inter', system-ui, sans-serif;
  }
`;

function App() {
  return (
    <Router>
      <style>{globalStyle}</style>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/about" element={<About />} />
        </Routes>
        {process.env.NODE_ENV === 'development' && <Debug />} {/* Add debug component */}
      </div>
    </Router>
  );
}

export default App;