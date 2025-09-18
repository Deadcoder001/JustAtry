const express = require('express');
const router = express.Router();

// Sample places (expandable structure)
const places = [
  // Meghalaya Tourist Places
  {
    id: 1,
    name: "Elephant Falls",
    description: "A beautiful three-step waterfall near Shillong.",
    latitude: 25.5562,
    longitude: 91.8221,
    season: "monsoon",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 2,
    name: "Dawki",
    description: "Crystal-clear Umngot river with scenic boat rides.",
    latitude: 25.1876,
    longitude: 92.0176,
    season: "winter",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    state: "Meghalaya",
    district: "West Jaintia Hills"
  },
  {
    id: 3,
    name: "Sohra (Cherrapunji)",
    description: "Known for highest rainfall and stunning landscapes.",
    latitude: 25.2986,
    longitude: 91.5822,
    season: "monsoon",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 4,
    name: "Mawlynnong",
    description: "Known as Asia's cleanest village with living root bridges.",
    latitude: 25.1983,
    longitude: 91.9167,
    season: "all",
    image: "https://images.unsplash.com/photo-1516815231560-8f41ec531527",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 5,
    name: "Nohkalikai Falls",
    description: "India's tallest plunge waterfall with a dramatic cliff.",
    latitude: 25.2840,
    longitude: 91.7328,
    season: "monsoon",
    image: "https://images.unsplash.com/photo-1554474639-3bd8438d15e2",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 6,
    name: "Mawphlang Sacred Forest",
    description: "Ancient sacred grove with unique biodiversity and cultural significance.",
    latitude: 25.4468,
    longitude: 91.7547,
    season: "all",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 7,
    name: "Double Decker Living Root Bridge",
    description: "Famous two-tier living root bridge in Nongriat village.",
    latitude: 25.2429,
    longitude: 91.7086,
    season: "winter",
    image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 8,
    name: "Umiam Lake",
    description: "Large reservoir with water sports and scenic views.",
    latitude: 25.6267,
    longitude: 91.9002,
    season: "all",
    image: "https://images.unsplash.com/photo-1605546122412-77604b5b7d48",
    state: "Meghalaya",
    district: "Ri-Bhoi"
  },
  {
    id: 9,
    name: "Shillong Peak",
    description: "Highest point in Shillong offering panoramic city views.",
    latitude: 25.5545,
    longitude: 91.8542,
    season: "all",
    image: "https://images.unsplash.com/photo-1490682143684-14e9f37cd3f8",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 10,
    name: "Laitlum Canyons",
    description: "Scenic canyon with breathtaking views and trekking opportunities.",
    latitude: 25.5167,
    longitude: 91.8833,
    season: "winter",
    image: "https://images.unsplash.com/photo-1439853949127-fa647821eba0",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 11,
    name: "Ward's Lake",
    description: "Beautiful artificial lake with boat rides and gardens in Shillong.",
    latitude: 25.5674,
    longitude: 91.8833,
    season: "all",
    image: "https://images.unsplash.com/photo-1520962880247-cfaf541c8724",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 12,
    name: "Mawsynram",
    description: "One of the wettest places on earth with natural attractions.",
    latitude: 25.3000,
    longitude: 91.5833,
    season: "winter",
    image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  
  // Guwahati Tourist Places
  {
    id: 26,
    name: "Kamakhya Temple",
    description: "Ancient Hindu temple dedicated to the goddess Kamakhya, one of the most revered Shakti temples.",
    latitude: 26.1640,
    longitude: 91.7035,
    season: "all",
    image: "https://images.unsplash.com/photo-1588096344356-9b339d443e1a",
    state: "Assam",
    district: "Kamrup Metropolitan"
  },
  {
    id: 27,
    name: "Umananda Temple",
    description: "Temple situated on Peacock Island in the middle of Brahmaputra River, smallest inhabited riverine island.",
    latitude: 26.1942,
    longitude: 91.7342,
    season: "winter",
    image: "https://images.unsplash.com/photo-1545126178-82d472076498",
    state: "Assam",
    district: "Kamrup Metropolitan"
  },
  {
    id: 28,
    name: "Assam State Museum",
    description: "Houses collection of artifacts reflecting the cultural heritage of Assam and Northeast India.",
    latitude: 26.1854,
    longitude: 91.7556,
    season: "all",
    image: "https://images.unsplash.com/photo-1565060169861-4a3410e88c22",
    state: "Assam",
    district: "Kamrup Metropolitan"
  },
  {
    id: 29,
    name: "Nehru Park",
    description: "Popular recreational park in the heart of Guwahati with musical fountain shows.",
    latitude: 26.1831,
    longitude: 91.7539,
    season: "all",
    image: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f",
    state: "Assam",
    district: "Kamrup Metropolitan"
  },
  {
    id: 30,
    name: "Assam State Zoo",
    description: "One of the largest zoos in Northeast India with various endangered species including one-horned rhinoceros.",
    latitude: 26.16390229260916,
    longitude: 91.78140655463093,

    season: "winter",
    image: "https://images.unsplash.com/photo-1552084117-56a987666449",
    state: "Assam",
    district: "Kamrup Metropolitan"
  }
];

// GET /api/places
router.get('/', (req, res) => {
  try {
    const { season, state, search } = req.query;
    
    let filteredPlaces = places;
    
    // Filter by season if specified
    if (season && season !== 'all') {
      filteredPlaces = filteredPlaces.filter(place => 
        place.season === season || place.season === 'all'
      );
    }
    
    // Filter by state if specified
    if (state) {
      filteredPlaces = filteredPlaces.filter(place => 
        place.state.toLowerCase() === state.toLowerCase()
      );
    }
    
    // Filter by search term if specified
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPlaces = filteredPlaces.filter(place => 
        (place.name && place.name.toLowerCase().includes(searchLower)) || 
        (place.description && place.description.toLowerCase().includes(searchLower)) || 
        (place.state && place.state.toLowerCase().includes(searchLower)) ||
        (place.district && place.district.toLowerCase().includes(searchLower))
      );
      
      // If searching for a state or region name like "Meghalaya" or "Guwahati"
      // Return all places in that region even if the name doesn't directly match
      if (filteredPlaces.length === 0) {
        filteredPlaces = places.filter(place => 
          (place.state && place.state.toLowerCase().includes(searchLower)) ||
          (place.district && place.district.toLowerCase().includes(searchLower))
        );
      }
      
      console.log(`Search for "${search}" returned ${filteredPlaces.length} results`);
    }
    
    res.json(filteredPlaces);
  } catch (error) {
    console.error("Error processing places request:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/places/seasons - Get available seasons
router.get('/seasons', (req, res) => {
  // Extract unique seasons
  const uniqueSeasons = new Set();
  places.forEach(place => uniqueSeasons.add(place.season));
  
  // Convert to array and sort
  const seasons = Array.from(uniqueSeasons).sort();
  
  res.json(seasons);
});

// GET /api/places/states - Get available states
router.get('/states', (req, res) => {
  // Extract unique states
  const uniqueStates = new Set();
  places.forEach(place => uniqueStates.add(place.state));
  
  // Convert to array and sort
  const states = Array.from(uniqueStates).sort();
  
  res.json(states);
});

module.exports = router;