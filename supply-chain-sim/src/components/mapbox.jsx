import React from "react";
import { useEffect, useRef, useState } from "react";
import { Button, Typography, Modal, DatePicker, Space } from "antd";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { AgentType, mapaboxAcessToken } from "../constants";
import * as turf from "@turf/turf";
import carImage from "../../public/Image/truck.png";
import { activeMarkers, activeRoute } from "../constants";
import { useDispatch, useSelector } from "react-redux";
import { setState, selectState } from "../features/stateSlice";
import { selectAdjList } from "../features/graphSlice";
import { UseInterval } from "../ultils/CustomHooks";
import dayjs from "dayjs";
import { execute } from "../constants/test";
import { CurrentGraph, supplier, distributor } from "../globalVariable";
import { Map } from "../globalVariable";
import { setCurrentDate, selectCurrentDate } from "../features/dateSlice";

mapboxgl.accessToken = mapaboxAcessToken;
const { RangePicker } = DatePicker;

function Mapbox({ graph }) {
  const mapContainer = useRef(null);
  const [curDate, setCurDate] = useState(dayjs());
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const state = useSelector(selectState);
  const currentDate = useSelector(selectCurrentDate);

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
      center: [-97, 35],
      zoom: zoom,
      includeGeometry: true,
    });
    for (let i = 0; i < graph.getLength(); i++) {
      console.log(graph);
      initMarker(graph.AdjList[i].data);
    }
    map.current.on("click", (event) => {
      console.log("click");
    });
    Map.current = map.current;
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  const runShipment = (step, id, onFinishCallBack) => {
    if (state === true) {
      console.log("Still running");
      return;
    }
    if (map.current.getLayer(id)) return;

    dispatch(setState(true));
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
          onFinishCallBack();
          dispatch(setState(false));
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

  const [isRun, setIsRun] = useState(null);
  UseInterval(() => {
    //console.log(curDate.hour());
    console.log(
      curDate.date() +
        "/" +
        curDate.month() +
        "/" +
        curDate.year() +
        " - " +
        curDate.hour()
    );

    for (let i = 0; i < CurrentGraph.AdjList.length; i++) {
      console.log(CurrentGraph.AdjList);
      execute(CurrentGraph.AdjList[i].data, curDate.hour());
    }
    /*  execute(supplier, curDate.hour());
    execute(distributor, curDate.hour()); */

    setCurDate((prev) => prev.add(1, "hour"));
  }, isRun);

  const onClickSimulate = () => {
    if (state === true) {
      console.log("Still running");
      return;
    }
    for (let i = 0; i < graph.getLength(); i++) {
      for (let j = 0; j < activeMarkers.length; j++) {
        console.log(graph.AdjList[i].data.name);
        if (graph.AdjList[i].data.name == activeMarkers[j].id) {
          activeMarkers[j].marker.setLngLat([
            graph.AdjList[i].data.location.x,
            graph.AdjList[i].data.location.y,
          ]);
          break;
        }
      }
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

  const initMarker = (agent) => {
    const el = document.createElement("div");
    if (agent.type === AgentType.Supplier) {
      el.className = "marker-supplier";
    } else if (agent.type === AgentType.Distributor) {
      el.className = "marker-distributor";
    } else if (agent.type === AgentType.Manufacturer) {
      el.className = "marker-manufacturer";
    } else if (agent.type === AgentType.Customer) {
      el.className = "marker-customer";
    }

    var popup = new mapboxgl.Popup()
      .setHTML(
        `<strong>${agent.name}</strong><p>Latitude: ${agent.location.x} Longtitude: ${agent.location.y}</p>`
      )
      .addTo(map.current);

    const temp = new mapboxgl.Marker(el)
      .setLngLat([agent.location.x, agent.location.y])
      .addTo(map.current)
      .setPopup(popup);
    activeMarkers.push({
      id: agent.name,
      marker: temp,
    });
  };

  const run = () => {
    if (isRun != null) {
      setIsRun(null);
    } else {
      setIsRun(1000);
    }
    if (state === true) {
      console.log("Still running");
      return;
    }
    dispatch(setState(true));

    for (let i = 0; i < CurrentGraph.AdjList.length - 1; i++) {
      CurrentGraph.AdjList[i].data.route = activeRoute[i];
    }
    console.log("List: ", CurrentGraph.AdjList);
    /* const id = "peep" + 0;
    runShipment(supplier.route, id, () => {
      console.log("finished running callback");
    }); */
    /* for (let i = 0; i < activeRoute.length; i++) {
      const id = "peep" + i.toString();
      console.log(id);
      runShipment(activeRoute[i], id, () => {
        console.log("finished running callback");
      });
    } */
  };

  const handleDateOk = () => {
    console.log("OK");
    setIsModalOpen(false);
  };

  const onChangeDate = (value, dateString) => {
    console.log("Selected Time: ", value);
    SetDate(value[0]);
  };

  const SetDate = (date) => {
    setCurDate(date);
    dispatch(setCurrentDate(date.toString()));
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
      <Button
        style={{ background: "red", borderColor: "yellow" }}
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        Run Sim
      </Button>
      <Button
        style={{ background: "red", borderColor: "yellow" }}
        onClick={() => {
          console.log("test");
          supplier.load(supplier);
          distributor.printWhole(distributor);
        }}
      >
        Ship
      </Button>
      <Button
        style={{ background: "red", borderColor: "yellow" }}
        onClick={() => {
          console.log("test");
          supplier.unload(supplier);
        }}
      >
        Unload
      </Button>
      <Typography>
        Lat: {lat} | Lng: {lng} | Zoom: {zoom}
      </Typography>
      <Typography>{curDate.toString()}</Typography>
      <div ref={mapContainer} className="map-container" />
      <Modal
        title="Basic Modal"
        open={isModalOpen}
        onOk={handleDateOk}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        okText="Run"
      >
        <Space direction="vertical" size={10}>
          <Space direction="horizontal" size={5}>
            <Typography>Date: </Typography>
            <RangePicker
              showTime={{
                format: "HH:mm",
              }}
              onChange={onChangeDate}
              format="YYYY-MM-DD HH:mm"
            />
          </Space>
          <Space direction="horizontal" size={5}>
            <Typography>Current Date: </Typography>
            <DatePicker value={curDate} showTime disabled />
          </Space>
        </Space>
      </Modal>
    </div>
  );
}

export default Mapbox;
