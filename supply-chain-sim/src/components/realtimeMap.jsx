import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { mapaboxAcessToken } from "../constants";

mapboxgl.accessToken = mapaboxAcessToken;

function RealtimeMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [zoom, setZoom] = useState(5);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);

  useEffect(() => {
    /////////////INIT MAPPPPPPPPPPPPPP/////////////
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-97, 35],
      zoom: zoom,
      includeGeometry: true,
    });
    /* for (let i = 0; i < graph.getLength(); i++) {
      //console.log(graph);
      initMarker(graph.AdjList[i].data);
    } */
    map.current.on("click", (event) => {
      //console.log("click");
    });
    //CURRENT_MAP.current = map.current;
  });

  return (
    <div>
      <div ref={mapContainer} className="map-container"></div>
    </div>
  );
}

export default RealtimeMap;
