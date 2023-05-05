import React from "react";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { mapaboxAcessToken } from "../constants";

mapboxgl.accessToken = mapaboxAcessToken;

function Mapbox() {
  const [zoom, setZoom] = useState(8);
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    /////////////INIT MAPPPPPPPPPPPPPP/////////////
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [24, 24],
      zoom: zoom,
      includeGeometry: true,
    });
  });
  return (
    <div ref={mapContainer} className="relative flex flex-grow min-h-screen" />
  );
}

export default Mapbox;
