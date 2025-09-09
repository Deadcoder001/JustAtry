import { useState, useEffect } from 'react';

export default function SeasonFilter({ onSeasonChange }) {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch available seasons
    fetch('/api/places/seasons')
      .then(res => res.json())
      .then(data => {
        setSeasons(['all', ...data]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching seasons:", err);
        setLoading(false);
      });
  }, []);

  const handleSeasonChange = (e) => {
    const season = e.target.value;
    setSelectedSeason(season);
    onSeasonChange(season);
  };

  if (loading) return <div>Loading seasons...</div>;

  return (
    <div className="season-filter">
      <label htmlFor="season-select">
        <b>Filter by Season:</b>
        <select
          id="season-select"
          value={selectedSeason}
          onChange={handleSeasonChange}
          style={{ 
            marginLeft: "0.5rem", 
            padding: "2px 8px", 
            borderRadius: "4px" 
          }}
        >
          {seasons.map(season => (
            <option key={season} value={season}>
              {season.charAt(0).toUpperCase() + season.slice(1)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}