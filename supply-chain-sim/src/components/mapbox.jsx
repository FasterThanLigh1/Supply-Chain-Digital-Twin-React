import React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { AgentType, mapaboxAcessToken } from "../constants";
import * as turf from "@turf/turf";
import carImage from "../../public/Image/truck.png";
import { activeMarkers, activeRoute } from "../constants";
import { useDispatch, useSelector } from "react-redux";
import { set, selectState } from "../features/stateSlice";

mapboxgl.accessToken = mapaboxAcessToken;

function Mapbox({ graph }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(8);

  const state = useSelector(selectState);
  const dispatch = useDispatch();

  async function getRoute(start, end, routeId) {
    // make a directions request using cycling profile
    // an arbitrary start will always be the same
    // only the end or destination will change
    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
      { method: "GET" }
    );
    const json = await query.json();
    const data = json.routes[0];
    if (data === undefined) return;
    console.log(data);
    const route = data.geometry.coordinates;
    const geojson = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: route,
      },
    };
    activeRoute.push(geojson.geometry);
    const length = turf.length(geojson.geometry, { units: "kilometers" });

    // if the route already exists on the map, we'll reset it using setData
    if (map.current.getSource(routeId)) {
      map.current.getSource(routeId).setData(geojson);
    }
    // otherwise, we'll make a new request
    else {
      map.current.addLayer({
        id: routeId,
        type: "line",
        source: {
          type: "geojson",
          data: geojson,
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#000000",
          "line-width": 5,
          "line-opacity": 0.75,
        },
      });
      //runShipment(geojson.geometry, "peep" + routeId);
    }
    // add turn instructions here at the end
  }

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
    for (let i = 0; i < graph.noOfVertices; i++) {
      console.log(graph);
      const el = document.createElement("div");
      if (graph.AdjList[i].data.type === AgentType.Supplier) {
        el.className = "marker-supplier";
      } else if (graph.AdjList[i].data.type === AgentType.Distributor) {
        el.className = "marker-distributor";
      } else if (graph.AdjList[i].data.type === AgentType.Manufacturer) {
        el.className = "marker-manufacturer";
      } else if (graph.AdjList[i].data.type === AgentType.Customer) {
        el.className = "marker-customer";
      }

      var popup = new mapboxgl.Popup()
        .setHTML(
          `<strong>${graph.AdjList[i].data.name}</strong><p>Latitude: ${graph.AdjList[i].data.location.x} Longtitude: ${graph.AdjList[i].data.location.y}</p>`
        )
        .addTo(map.current);

      const temp = new mapboxgl.Marker(el)
        .setLngLat([
          graph.AdjList[i].data.location.x,
          graph.AdjList[i].data.location.y,
        ])
        .addTo(map.current)
        .setPopup(popup);
      activeMarkers.push(temp);
    }
    map.current.on("click", (event) => {
      console.log("click");
    });
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  const runShipment = (step, id) => {
    if (state === true) {
      console.log("Still running");
      return;
    }
    if (map.current.getLayer(id)) return;

    dispatch(set(true));
    var iPathLength = turf.lineDistance(step, "kilometers");
    var iPoint = turf.along(step, 0, "kilometers");
    var rep = 0;
    console.log("is running ", rep);
    var numSteps = 500; //Change this to set animation resolution
    var timePerStep = 20; //Change this to alter animation speed
    map.current.addSource(id, {
      type: "geojson",
      data: iPoint,
      maxzoom: 20,
    });
    map.current.loadImage(carImage, (error, image) => {
      if (error) throw error;
      var popup = new mapboxgl.Popup()
        .setHTML(`<strong>Test<strong></p>`)
        .addTo(map.current);

      // Add the image to the map style.
      map.current.addImage("cat" + id, image);
      map.current.addLayer({
        id: id,
        type: "symbol",
        source: id,
        layout: {
          "icon-image": "cat" + id, // reference the image
          "icon-size": 0.75,
        } /* 
          paint: {
            "circle-radius": 4,
          }, */,
      });
    });
    var pSource = map.current.getSource(id);
    var interval = setInterval(function () {
      rep += 1;
      if (rep > numSteps) {
        if (map.current.hasImage("cat" + id)) {
          map.current.removeImage("cat" + id);
          map.current.removeLayer(id);
          map.current.removeSource(id);
          console.log("finished running");
          dispatch(set(false));
          clearInterval(interval);
        }
      } else {
        var curDistance = (rep / numSteps) * iPathLength;
        var iPoint = turf.along(step, curDistance, "kilometers");
        pSource.setData(iPoint);
        //console.log(curDistance);
      }
    }, timePerStep);
  };

  const onClickSimulate = () => {
    for (let i = 0; i < graph.noOfVertices; i++) {
      if (graph.AdjList[i].adjacent.length > 0) {
        for (let j = 0; j < graph.AdjList[i].adjacent.length; j++) {
          const id = "route_" + j.toString() + "_" + i.toString();
          getRoute(
            [
              graph.AdjList[i].data.location.x,
              graph.AdjList[i].data.location.y,
            ],
            [
              graph.AdjList[i].adjacent[j].data.location.x,
              graph.AdjList[i].adjacent[j].data.location.y,
            ],
            id
          );
        }
      }
    }
  };

  const run = () => {
    for (let i = 0; i < activeRoute.length; i++) {
      const id = "peep" + i.toString();
      console.log(id);
      runShipment(activeRoute[i], id);
    }
  };

  return (
    <div>
      <Button
        style={{ background: "red", borderColor: "yellow" }}
        onClick={onClickSimulate}
      >
        Add route
      </Button>
      <Button
        style={{ background: "red", borderColor: "yellow" }}
        onClick={run}
      >
        Run
      </Button>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default Mapbox;
