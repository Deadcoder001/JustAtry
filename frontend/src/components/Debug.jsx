import { useState } from 'react';

const Debug = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const testSearch = async () => {
    try {
      const response = await fetch(`/api/places?search=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setApiResponse(data);
    } catch (error) {
      setApiResponse({ error: error.message });
    }
  };
  
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          background: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '18px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
      >
        🔍
      </button>
    );
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
      width: '400px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>API Debugger</h3>
        <button 
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <div style={{ marginBottom: '5px' }}>Test search:</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            placeholder="Enter search query"
          />
          <button
            onClick={testSearch}
            style={{
              padding: '8px 15px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test
          </button>
        </div>
      </div>
      
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>API Response:</div>
        <pre style={{
          background: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          overflowX: 'auto',
          maxHeight: '300px',
          fontSize: '12px'
        }}>
          {apiResponse ? JSON.stringify(apiResponse, null, 2) : 'No data yet'}
        </pre>
      </div>
    </div>
  );
};

export default Debug;