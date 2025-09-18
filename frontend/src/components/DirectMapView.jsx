import React, { useEffect, useRef } from 'react';

const DirectMapView = () => {
  const mapContainerRef = useRef(null);
  
  useEffect(() => {
    // Check if MapmyIndia global object is available
    if (window.MapmyIndia && window.MapmyIndia.Map) {
      // Initialize map
      const map = new window.MapmyIndia.Map(mapContainerRef.current, {
        center: [28.61, 77.23],
        zoom: 12,
        search: false
      });
      
      // Add a marker
      const marker = new window.MapmyIndia.Marker({
        map: map,
        position: [28.61, 77.23],
        draggable: false,
        title: "Test Marker"
      });
      
      console.log("Map initialized successfully:", map);
    } else {
      console.error("MapmyIndia SDK not available. Check if the script is loaded correctly.");
    }
  }, []);
  
  return (
    <div>
      <h2>MapMyIndia Direct JavaScript Implementation</h2>
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}
      ></div>
    </div>
  );
};

export default DirectMapView;