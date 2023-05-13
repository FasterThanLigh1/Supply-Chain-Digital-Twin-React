import * as turf from "@turf/turf";
import carImage from "../../public/Image/truck.png";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { Map } from "../globalVariable";
import { RunState } from ".";

export const PrintHello = () => {
  console.log("Hello world");
};

export const Print = () => {
  console.log("Hello");
};

export const runShipment = (step, id, obj, onFinishCallBack) => {
  if (Map.current.getLayer(id)) return;

  /* dispatch(setState(true)); */
  var iPathLength = turf.lineDistance(step, "kilometers");
  var iPoint = turf.along(step, 0, "kilometers");
  var rep = 0;
  console.log("is running ", rep);
  var numSteps = 500; //Change this to set animation resolution
  var timePerStep = 20; //Change this to alter animation speed
  Map.current.addSource(id, {
    type: "geojson",
    data: iPoint,
    maxzoom: 20,
  });
  Map.current.loadImage(carImage, (error, image) => {
    if (error) throw error;
    var popup = new mapboxgl.Popup()
      .setHTML(`<strong>Test<strong></p>`)
      .addTo(Map.current);

    // Add the image to the Map.current style.
    Map.current.addImage("cat" + id, image);
    Map.current.addLayer({
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
  var pSource = Map.current.getSource(id);
  var interval = setInterval(function () {
    rep += 1;
    if (rep > numSteps) {
      if (Map.current.hasImage("cat" + id)) {
        console.log(obj);
        Map.current.removeImage("cat" + id);
        Map.current.removeLayer(id);
        Map.current.removeSource(id);
        for (let i = 0; i < onFinishCallBack.length; i++) {
          onFinishCallBack[i]();
        }
        obj.runState = RunState.CanRun;
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
