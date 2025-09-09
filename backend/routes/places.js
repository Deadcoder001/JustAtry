const express = require('express');
const router = express.Router();

// Sample places (expandable structure)
const places = [
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
    name: "Nohkalikai Falls",
    description: "Tallest plunge waterfall in India.",
    latitude: 25.2986,
    longitude: 91.6761,
    season: "monsoon",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 5,
    name: "Umiam Lake",
    description: "Picturesque reservoir north of Shillong.",
    latitude: 25.6500,
    longitude: 91.8933,
    season: "summer",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
    state: "Meghalaya",
    district: "Ri Bhoi"
  },
  {
    id: 6,
    name: "Living Root Bridges",
    description: "Natural bridges grown from rubber fig tree roots.",
    latitude: 25.2487,
    longitude: 91.7167,
    season: "all",
    image: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 7,
    name: "Mawsynram",
    description: "Wettest place on Earth with incredible views.",
    latitude: 25.3061,
    longitude: 91.5714,
    season: "monsoon",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 8,
    name: "Mawlynnong Village",
    description: "Asia's cleanest village with living root bridges.",
    latitude: 25.1983,
    longitude: 91.9244,
    season: "all",
    image: "https://images.unsplash.com/photo-1498855926480-d98e83099315",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 9,
    name: "Laitlum Canyons",
    description: "Stunning canyon with sweeping valley views.",
    latitude: 25.5159,
    longitude: 91.9382,
    season: "winter",
    image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 10,
    name: "Shillong Peak",
    description: "Highest point in Shillong with panoramic views.",
    latitude: 25.5651,
    longitude: 91.8727,
    season: "all",
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 11,
    name: "Mawsmai Cave",
    description: "Limestone cave with stunning formations.",
    latitude: 25.2493,
    longitude: 91.7292,
    season: "all",
    image: "https://images.unsplash.com/photo-1520531158340-44015069e78e",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 12,
    name: "Nokrek National Park",
    description: "UNESCO Biosphere Reserve with rare red pandas.",
    latitude: 25.4712,
    longitude: 90.3198,
    season: "winter",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b",
    state: "Meghalaya",
    district: "West Garo Hills"
  },
  {
    id: 13,
    name: "Don Bosco Museum",
    description: "Largest museum of indigenous cultures in Asia.",
    latitude: 25.5699,
    longitude: 91.8932,
    season: "all",
    image: "https://images.unsplash.com/photo-1566127992631-137a642a90f4",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 14,
    name: "Sweet Falls",
    description: "One of the most beautiful waterfalls in Shillong.",
    latitude: 25.5218,
    longitude: 91.8281,
    season: "monsoon",
    image: "https://images.unsplash.com/photo-1513477967668-2aaf11838bd6",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 15,
    name: "Balpakram National Park",
    description: "Canyon-like landscape known as the 'land of perpetual winds'.",
    latitude: 25.1167,
    longitude: 90.8500,
    season: "winter",
    image: "https://images.unsplash.com/photo-1439853949127-fa647821eba0",
    state: "Meghalaya",
    district: "South Garo Hills"
  },
  {
    id: 16,
    name: "Ward's Lake",
    description: "Artificial lake with boating facilities in Shillong.",
    latitude: 25.5705,
    longitude: 91.8793,
    season: "all",
    image: "https://images.unsplash.com/photo-1495954484750-af469f2f9be5",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 17,
    name: "Siju Cave",
    description: "One of the longest caves in India with impressive stalactites.",
    latitude: 25.3622,
    longitude: 90.6935,
    season: "winter",
    image: "https://images.unsplash.com/photo-1564324738339-bae0c5d7a5e6",
    state: "Meghalaya",
    district: "South Garo Hills"
  },
  {
    id: 18,
    name: "Kyllang Rock",
    description: "Massive dome-shaped granite rock with panoramic views.",
    latitude: 25.5731,
    longitude: 91.5800,
    season: "all",
    image: "https://images.unsplash.com/photo-1555085458-50779dd9c59a",
    state: "Meghalaya",
    district: "West Khasi Hills"
  },
  {
    id: 19,
    name: "Jakrem Hot Springs",
    description: "Natural sulfur springs with healing properties.",
    latitude: 25.4167,
    longitude: 91.6333,
    season: "winter",
    image: "https://images.unsplash.com/photo-1558981359-219d6364c9c8",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 20,
    name: "Krangsuri Falls",
    description: "Stunning waterfall with turquoise blue plunge pool.",
    latitude: 25.3239,
    longitude: 92.2789,
    season: "monsoon",
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9",
    state: "Meghalaya",
    district: "West Jaintia Hills"
  },
  {
    id: 21,
    name: "Mawphlang Sacred Grove",
    description: "Ancient sacred forest with rich biodiversity.",
    latitude: 25.4433,
    longitude: 91.7619,
    season: "all",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 22,
    name: "Nartiang Monoliths",
    description: "Largest collection of monoliths in one place in the world.",
    latitude: 25.5724,
    longitude: 92.2557,
    season: "all",
    image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99",
    state: "Meghalaya",
    district: "West Jaintia Hills"
  },
  {
    id: 23,
    name: "Jowai",
    description: "Picturesque town with Thadlaskein Lake and rolling hills.",
    latitude: 25.4513,
    longitude: 92.2029,
    season: "all",
    image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0",
    state: "Meghalaya",
    district: "West Jaintia Hills"
  },
  {
    id: 24,
    name: "Mawryngkhang Trek",
    description: "Famous bamboo bridge trek also known as 'King of Treks'.",
    latitude: 25.2655,
    longitude: 91.9521,
    season: "winter",
    image: "https://images.unsplash.com/photo-1531338410663-88d33379ba03",
    state: "Meghalaya",
    district: "East Khasi Hills"
  },
  {
    id: 25,
    name: "Wei Sawdong Falls",
    description: "Three-tier waterfall with emerald green pools.",
    latitude: 25.3204,
    longitude: 91.7361,
    season: "monsoon",
    image: "https://images.unsplash.com/photo-1553959517-bb7bfabbd91b",
    state: "Meghalaya",
    district: "East Khasi Hills"
  }
];

// GET /api/places
router.get('/', (req, res) => {
  const { season } = req.query;
  
  if (!season || season === 'all') {
    res.json(places);
  } else {
    const filteredPlaces = places.filter(place => 
      place.season === season || place.season === 'all'
    );
    res.json(filteredPlaces);
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

module.exports = router;