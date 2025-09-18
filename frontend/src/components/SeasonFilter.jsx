import React, { useState, useEffect } from 'react';

const SeasonFilter = ({ onSeasonChange }) => {
  const [seasons, setSeasons] = useState(['all', 'summer', 'monsoon', 'winter']);
  const [selected, setSelected] = useState('all');
  
  useEffect(() => {
    // Fetch available seasons from API
    fetch('/api/places/seasons')
      .then(res => res.json())
      .then(data => {
        if (data && data.length) {
          if (!data.includes('all')) {
            data.unshift('all');
          }
          setSeasons(data);
        }
      })
      .catch(err => console.error('Error fetching seasons:', err));
  }, []);
  
  const handleChange = (e) => {
    const value = e.target.value;
    setSelected(value);
    onSeasonChange(value);
  };
  
  return (
    <div>
      <select
        value={selected}
        onChange={handleChange}
        style={{
          padding: "8px 12px",
          borderRadius: "6px",
          border: "1px solid #ddd",
          backgroundColor: "#f5f7fa",
          fontSize: "14px",
          cursor: "pointer",
          minWidth: "120px",
          appearance: "none",
          backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"6\"><path d=\"M0 0 L12 0 L6 6 Z\" fill=\"%23666\"/></svg>')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
          paddingRight: "30px"
        }}
      >
        {seasons.map((season) => (
          <option key={season} value={season}>
            {season === 'all' ? 'All Seasons' : season.charAt(0).toUpperCase() + season.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SeasonFilter;