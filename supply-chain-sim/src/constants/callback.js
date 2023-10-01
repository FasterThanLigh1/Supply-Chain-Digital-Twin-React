import * as turf from "@turf/turf";
import { notification } from "antd";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import _ from "lodash";

export const openNotificationWithIcon = (
  message,
  description,
  type,
  duration = 3
) => {
  notification[type]({
    message: message,
    description: description,
    duration: duration,
  });
};

export async function getRoute(start, end, routeId, map) {
  console.log("Start cordinate: ", start);
  console.log("End cordinate: ", end);
  // make a directions request using cycling profile
  // an arbitrary start will always be the same
  // only the end or destination will change
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
    { method: "GET" }
  );
  const json = await query.json();
  console.log("Route: ", json);
  const data = json.routes[0];
  if (data === undefined) return;
  //console.log(data);
  const route = data.geometry.coordinates;
  const geojson = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: route,
    },
  };
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
        "line-color": "#FD4D00",
        "line-width": 5,
        "line-opacity": 0.75,
      },
    });
  }
  // add turn instructions here at the end
}
