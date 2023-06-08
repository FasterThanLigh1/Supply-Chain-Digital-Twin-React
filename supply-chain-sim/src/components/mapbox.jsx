import React from "react";
import { useEffect, useRef, useState } from "react";
import { Button, Typography, Modal, DatePicker, Space, Upload } from "antd";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { AGENT_TYPE, MESSAGE_TYPE, mapaboxAcessToken } from "../constants";
import {
  CURRENT_PARTICIPANTS_DATA,
  CURRENT_SIMULATION_DATA,
  EXPORT_DATA,
  VERTICES,
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
  abstractMove,
  execute,
  load,
  move,
  openNotificationWithIcon,
} from "../constants/callback";
import { CURRENT_GRAPH } from "../globalVariable";
import { CURRENT_MAP } from "../globalVariable";
import { setCurrentDate, selectCurrentDate } from "../features/dateSlice";
import Axios from "axios";
import QueryString from "qs";
import { ExportObject } from "../constants/class";

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

  async function getRoute(start, end, routeId, origin) {
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
    origin.route = geojson.geometry;
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
    ACTIVE_ROUTE.length = 0;
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
            id,
            graph.AdjList[i].data
          );
        }
      }
    }

    /* for (let i = 0; i < CURRENT_GRAPH.AdjList.length - 1; i++) {
      CURRENT_GRAPH.AdjList[i].data.route = ACTIVE_ROUTE[i];
    } */
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
        date: curDate,
        endDate: endDate,
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

  const exportData = (data) => {
    console.log("Export data");
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(data)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "data.json";

    link.click();
  };

  const exportParticipantData = () => {
    EXPORT_DATA.participants.length = 0;
    /* for (let i = 0; i < VERTICES.length; i++) {
      console.log(VERTICES[i]);
      const temp = new ExportObject(VERTICES[i]);
      EXPORT_DATA.participants.push(temp);
    } */
    for (let i = 0; i < CURRENT_GRAPH.AdjList.length; i++) {
      const temp = new ExportObject(CURRENT_GRAPH.AdjList[i]);
      EXPORT_DATA.participants.push(temp);
    }
    exportData(EXPORT_DATA);
  };

  const uploadProps = {
    name: "file",
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    headers: {
      authorization: "authorization-text",
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const onImportData = (data) => {
    console.log(data);
    /* for (let i = 0; i < data.participants.length; i++) {
      VERTICES[i].onImport(data.participants[i]);
    } */
    for (let i = 0; i < CURRENT_GRAPH.AdjList.length; i++) {
      CURRENT_GRAPH.AdjList[i].data.onImport(data.participants[i]);
    }
  };

  return (
    <div>
      <Button onClick={onClickSimulate}>Add route</Button>
      <Button onClick={run}>Run</Button>
      <Button
        onClick={() => {
          abstractMove(CURRENT_GRAPH.AdjList[0].data);
        }}
      >
        Test{" "}
      </Button>
      <Button onClick={simulation}>Next</Button>
      <Button
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        Run Sim
      </Button>
      <Upload
        {...uploadProps}
        beforeUpload={(file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            console.log("[Upload]", e.target.result);
            onImportData(JSON.parse(e.target.result));
          };
          reader.readAsText(file);
          // Prevent upload
          return false;
        }}
      >
        <Button>Import</Button>
      </Upload>
      <Button
        onClick={() => {
          exportParticipantData();
        }}
      >
        Export
      </Button>
      <div ref={mapContainer} className="map-container">
        <Space direction="vertical" className="absolute z-40 w-69 left-0">
          <Typography className="bg-sky-950 pt-2 pb-2 pl-2 pr-2 rounded-lg text-white">
            Lat: {lat} | Lng: {lng} | Zoom: {zoom}
          </Typography>
          <Typography className="bg-sky-950 pt-2 pb-2 pl-2 pr-2 rounded-lg text-white">
            {curDate.toString()}
          </Typography>
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
