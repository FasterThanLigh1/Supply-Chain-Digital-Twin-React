import React from "react";
import { useEffect, useRef, useState } from "react";
import { Button, Typography, Modal, DatePicker, Space } from "antd";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { AGENT_TYPE, MESSAGE_TYPE, mapaboxAcessToken } from "../constants";
import {
  CURRENT_PARTICIPANTS_DATA,
  CURRENT_SIMULATION_DATA,
} from "../globalVariable";
import * as turf from "@turf/turf";
import carImage from "../../public/Image/truck.png";
import { ACTIVE_MARKERS, ACTIVE_ROUTE } from "../constants";
import { useDispatch, useSelector } from "react-redux";
import { setState, selectState } from "../features/stateSlice";
import { UseInterval } from "../ultils/CustomHooks";
import dayjs from "dayjs";
import {
  RESET_SIMULATION,
  execute,
  openNotificationWithIcon,
} from "../constants/callback";
import { CURRENT_GRAPH, supplier, customer2 } from "../globalVariable";
import { CURRENT_MAP } from "../globalVariable";
import { setCurrentDate, selectCurrentDate } from "../features/dateSlice";
import Axios from "axios";
import QueryString from "qs";

mapboxgl.accessToken = mapaboxAcessToken;
const { RangePicker } = DatePicker;

const postInventory = (inventory) => {
  Axios.post("http://localhost:8080/post", {
    data: inventory,
  }).then(() => {
    ////console.log("success");
  });
};

function Mapbox({ graph }) {
  const mapContainer = useRef(null);
  const [curDate, setCurDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
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
    ACTIVE_ROUTE.push(geojson.geometry);
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
      //console.log(graph);
      initMarker(graph.AdjList[i].data);
    }
    map.current.on("click", (event) => {
      //console.log("click");
    });
    CURRENT_MAP.current = map.current;
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
      //console.log("Still running");
      return;
    }
    if (map.current.getLayer(id)) return;

    dispatch(setState(true));
    var iPathLength = turf.lineDistance(step, "kilometers");
    var iPoint = turf.along(step, 0, "kilometers");
    var rep = 0;
    //console.log("is running ", rep);
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
        ////console.log(curDistance);
      }
    }, timePerStep);
  };

  const endSim = () => {
    //END SIMULATION
    openNotificationWithIcon(
      "End Simulation",
      "The simulation has ended successfully",
      MESSAGE_TYPE.SUCCESS
    );
  };

  const [isRun, setIsRun] = useState(null);
  UseInterval(() => {
    simulation();
  }, isRun);

  const simulation = () => {
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

    if (curDate.diff(endDate, "day") == 0) {
      endSim();
      setIsRun(null);
    }

    for (let i = 0; i < CURRENT_GRAPH.AdjList.length; i++) {
      //console.log(CurrentGraph.AdjList);
      execute(CURRENT_GRAPH.AdjList[i].data, curDate.hour());
    }
    /*  execute(supplier, curDate.hour());
    execute(distributor, curDate.hour()); */

    setCurDate((prev) => prev.add(1, "hour"));
    if (curDate.hour() == 0) {
      endDateUpdate();
    }
  };

  const endDateUpdate = () => {
    for (let i = 0; i < CURRENT_GRAPH.AdjList.length; i++) {
      //console.log(CurrentGraph.AdjList);
      CURRENT_GRAPH.AdjList[i].data.calcEverything(
        CURRENT_GRAPH.AdjList[i].data
      );
      updateStatistic(CURRENT_GRAPH.AdjList[i].data);
    }
  };

  const updateStatistic = (obj) => {
    console.log("A new day");
    Axios.post("http://localhost:8080/insert_statistic", {
      participantKey: obj.id,
      simulationKey: CURRENT_SIMULATION_DATA.currentSimulationId,
      data: obj.data,
      date: curDate,
    }).then(() => {
      ////console.log("success");
    });
  };

  const onClickSimulate = () => {
    if (state === true) {
      //console.log("Still running");
      return;
    }
    for (let i = 0; i < graph.getLength(); i++) {
      for (let j = 0; j < ACTIVE_MARKERS.length; j++) {
        //console.log(graph.AdjList[i].data.name);
        if (graph.AdjList[i].data.name == ACTIVE_MARKERS[j].id) {
          ACTIVE_MARKERS[j].marker.setLngLat([
            graph.AdjList[i].data.location.longitude,
            graph.AdjList[i].data.location.latitude,
          ]);
          break;
        }
      }
      if (graph.AdjList[i].adjacent.length > 0) {
        for (let j = 0; j < graph.AdjList[i].adjacent.length; j++) {
          const id = "route_" + j.toString() + "_" + i.toString();
          getRoute(
            [
              graph.AdjList[i].data.location.longitude,
              graph.AdjList[i].data.location.latitude,
            ],
            [
              graph.AdjList[i].adjacent[j].data.location.longitude,
              graph.AdjList[i].adjacent[j].data.location.latitude,
            ],
            id
          );
        }
      }
    }

    for (let i = 0; i < CURRENT_GRAPH.AdjList.length - 1; i++) {
      CURRENT_GRAPH.AdjList[i].data.route = ACTIVE_ROUTE[i];
    }
    console.log(CURRENT_GRAPH.AdjList);
  };

  const initMarker = (agent) => {
    const el = document.createElement("div");
    if (agent.type === AGENT_TYPE.SUPPLIER) {
      el.className = "marker-supplier";
    } else if (agent.type === AGENT_TYPE.DISTRIBUTOR) {
      el.className = "marker-distributor";
    } else if (agent.type === AGENT_TYPE.MANUFACTURER) {
      el.className = "marker-manufacturer";
    } else if (agent.type === AGENT_TYPE.CUSTOMER) {
      el.className = "marker-customer";
    }

    var popup = new mapboxgl.Popup()
      .setHTML(
        `<strong>${agent.name}</strong><p>Longitude: ${agent.location.longitude} Latitude: ${agent.location.latitude}</p>`
      )
      .addTo(map.current);

    const temp = new mapboxgl.Marker(el)
      .setLngLat([agent.location.longitude, agent.location.latitude])
      .addTo(map.current)
      .setPopup(popup);
    ACTIVE_MARKERS.push({
      id: agent.name,
      marker: temp,
    });
  };

  const run = () => {
    if (isRun != null) {
      openNotificationWithIcon(
        "Pause Simulation",
        "The simulation is paused",
        MESSAGE_TYPE.WARNING
      );
      setIsRun(null);
    } else {
      //NEW SIMULATION AND RESET
      RESET_SIMULATION();

      //NEW SIM ID
      const curDate = dayjs();
      const resHour = curDate.hour() + 1;
      const simId =
        "simulation_" +
        curDate.date().toString() +
        "_" +
        curDate.month().toString() +
        "_" +
        curDate.year().toString() +
        "_" +
        resHour.toString() +
        "-" +
        curDate.minute().toString() +
        "-" +
        curDate.second().toString();
      //SET SIMULATION ID
      CURRENT_SIMULATION_DATA.currentSimulationId = simId;
      // TODO: INSERT SIMULATION
      Axios.post("http://localhost:8080/new_simulation", {
        id: simId,
      }).then(() => {
        ////console.log("success");
      });

      //TODO: INSERT PARTICIPANTS
      for (let i = 0; i < CURRENT_GRAPH.AdjList.length; i++) {
        CURRENT_PARTICIPANTS_DATA.participants.push({
          name: CURRENT_GRAPH.AdjList[i].data.name,
          id: CURRENT_GRAPH.AdjList[i].data.id,
        });
      }
      Axios.post("http://localhost:8080/new_participants", {
        participants: CURRENT_PARTICIPANTS_DATA.participants,
        simId: simId,
      }).then(() => {
        ////console.log("success");
      });

      openNotificationWithIcon(
        "Start Simulation",
        "The simulation is starting",
        MESSAGE_TYPE.SUCCESS
      );
      setIsRun(1000);
    }
    if (state === true) {
      //console.log("Still running");
      return;
    }
    dispatch(setState(true));
    //console.log("List: ", CurrentGraph.AdjList);
    /* const id = "peep" + 0;
    runShipment(supplier.route, id, () => {
      //console.log("finished running callback");
    }); */
    /* for (let i = 0; i < activeRoute.length; i++) {
      const id = "peep" + i.toString();
      //console.log(id);
      runShipment(activeRoute[i], id, () => {
        //console.log("finished running callback");
      });
    } */
  };

  const handleDateOk = () => {
    //console.log("OK");
    setIsModalOpen(false);
  };

  const onChangeDate = (value, dateString) => {
    //console.log("Selected Time: ", value);
    SetDate(value[0]);
    setEndDate(value[1]);
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
          //console.log("test");
          supplier.load(supplier);
          customer2.printWhole(customer2);
          postInventory(supplier.inventory);
        }}
      >
        Ship
      </Button>
      <Button
        style={{ background: "red", borderColor: "yellow" }}
        onClick={() => {
          //console.log("test");
          supplier.unload(supplier);
        }}
      >
        Unload
      </Button>
      <Button
        style={{ background: "red", borderColor: "yellow" }}
        onClick={simulation}
      >
        Next
      </Button>
      <div ref={mapContainer} className="map-container">
        <Space direction="vertical" className="absolute z-50 w-69 left-0">
          <Typography className="bg-sky-950 pt-2 pb-2 pl-2 pr-2 rounded-lg text-white">
            Lat: {lat} | Lng: {lng} | Zoom: {zoom}
          </Typography>
          <Typography>{curDate.toString()}</Typography>
        </Space>
      </div>

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
