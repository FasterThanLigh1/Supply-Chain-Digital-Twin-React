/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, Children } from "react";
import mapboxgl from "mapbox-gl";
import {
  SUPABASE_DATA,
  DTDL_MARKER_TYPE,
  SUPABASE_TABLE,
  mapaboxAcessToken,
} from "../constants";
import {
  Button,
  Modal,
  Space,
  Typography,
  Col,
  Divider,
  Row,
  Table,
  Tag,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { selectChildTwinArray, setChildTwinArray } from "../features/dtdlSlice";
import _ from "lodash";
import Chart from "react-apexcharts";
import ReactApexChart from "react-apexcharts";
import supabase from "../config/supabaseClient";
import { selectTruckDataArray } from "../features/truckSlice";
import { getRoute } from "../constants/callback";
import Notification from "./notification";
import Modeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import axios from "axios";
import { current } from "@reduxjs/toolkit";

mapboxgl.accessToken = mapaboxAcessToken;

const columns1 = [
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    key: "quantity",
  },
];

const columns2 = [
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    key: "quantity",
  },
];

const columns3 = [
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Created Date",
    dataIndex: "created_at",
    key: "created_at",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Participant Id",
    dataIndex: "participant_id",
    key: "participant_id",
  },
  {
    title: "status",
    dataIndex: "is_resolved",
    key: "is_resolved",
    render: (status) => {
      let color = "volcano";
      let text = "UNRESOLVED";
      if (status == true) {
        color = "green";
        text = "RESOLVED";
      }
      return (
        <Tag color={color} key={status}>
          {text.toUpperCase()}
        </Tag>
      );
    },
  },
];

function RealtimeMap() {
  const thisChildTwinArray = useSelector(selectChildTwinArray);
  const thisTruckDataArray = useSelector(selectTruckDataArray);

  //MAP ATTRIBUTE
  const mapContainer = useRef(null);
  const dispatch = useDispatch();
  const map = useRef(null);
  const [api_participantList, api_setParticipantList] = useState([]);
  const [fetchError, setfetchError] = useState(null);
  const [zoom, setZoom] = useState(5);
  const [geojsonPlaces, setGeojsonPlaces] = useState(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);

  const [salesSeries, setSalesSeries] = useState([]);
  const [salesCategories, setSalesCategories] = useState([]);
  const [truckData, setTruckData] = useState([]);

  //SELECT PARTICIAPANT MODAL ATTRIBUTE
  const [modalName, setModalName] = useState(null);
  const [modalId, setModalId] = useState(null);
  const [selectAddress, setSelectAddress] = useState(null);
  const [selectSupplier, setSelectSupplier] = useState(null);
  const [selectCustomer, setSelectCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inventory, setInventory] = useState([]);

  //SELECT TRUCK MODAL ATTRIBUTE
  const [truckName, setTruckName] = useState(null);
  const [truckId, setTruckId] = useState(null);
  const [truckMaxVelocity, setTrucklMaxVelocity] = useState(null);
  const [truckWeight, setTruckWeight] = useState(null);
  const [truckMaxCargo, setTruckMaxCargo] = useState(null);
  const [truckType, setTruckType] = useState(null);
  const [truckLongitude, setTruckLongitude] = useState(null);
  const [truckLatitude, setTruckLatitude] = useState(null);
  const [truckDestination, setTruckDestination] = useState(null);
  const [isTruckActive, setIsTruckActive] = useState(false);

  //ORDER ATTRIBUTE
  const [orderData, setOrderData] = useState([]);
  const [productData, setProductData] = useState([]);

  //CARGO ATTRIBUTE
  const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
  const [cargoProductData, setCargoProductData] = useState([]);

  //WARNNG ATTRIBUTE
  const [warningList, setWarningList] = useState([]);
  const [trigger, setTrigger] = useState(false);

  //BPMN VIEW
  const [openBpmnModal, setOpenBpmnModal] = useState(false);
  const [diagram, diagramSet] = useState("");
  const [modeling, setModeling] = useState(null);
  const [currentModeler, modelerSet] = useState(null);
  const container = document.getElementById("container");

  useEffect(() => {
    console.log("DIAGRAM CALLED: ", diagram);
    if (diagram.length === 0) {
      axios
        .get(
          "https://cdn.staticaly.com/gh/bpmn-io/bpmn-js-examples/master/colors/resources/pizza-collaboration.bpmn"
        )
        .then((r) => {
          diagramSet(r.data);
        })
        .catch((e) => {
          console.log(e);
        });

      const modeler = new Modeler({
        container,
        keyboard: {
          bindTo: document,
        },
      });
      modeler
        .importXML(diagram)
        .then(({ warnings }) => {
          if (warnings.length) {
            console.log("Warnings", warnings);
          }
        })
        .catch((err) => {
          console.log("error", err);
        });

      modelerSet(modeler);
    }

    if (diagram.length > 0) {
      console.log("New diagram");

      axios
        .get(
          "https://cdn.staticaly.com/gh/bpmn-io/bpmn-js-examples/master/colors/resources/pizza-collaboration.bpmn"
        )
        .then((r) => {
          diagramSet(r.data);
        })
        .catch((e) => {
          console.log(e);
        });

      currentModeler
        .importXML(diagram)
        .then(({ warnings }) => {
          if (warnings.length) {
            console.log("Warnings", warnings);
          }
        })
        .catch((err) => {
          console.log("error", err);
        });
    }
  }, [diagram]);

  //On select cargo
  const showCargoModal = (id) => {
    console.log(id);
    setIsCargoModalOpen(true);
  };

  //On select participant marker
  const showModal = (id) => {
    setIsModalOpen(true);
    console.log("PARTICIPANT: ", SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS);
    for (let i = 0; i < SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS.length; i++) {
      console.log(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i]);
      if (SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].id == id) {
        setModalName(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].name);
        setModalId(id);
        setSelectAddress(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].address);
        setSelectCustomer(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].target);
        setSelectSupplier(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].supplier);
        diagramSet(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].bpmn);
      }
    }

    api_fecthInvetoryById(id);
    api_fecthParticipantDataById(id);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [truckModalOpen, setTruckModalOpen] = useState(false);
  const showTruckModal = (id) => {
    console.log(id);
    setTruckModalOpen(true);
    api_fecthVehicleDataById(id);
  };
  const handleTruckOk = () => {
    setTruckModalOpen(false);
  };
  const handleTruckCancel = () => {
    setTruckModalOpen(false);
  };

  //SUPABASE FETCH
  useEffect(() => {
    console.log("START FETCH");
    const channelData = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: SUPABASE_TABLE.LIVE_DATA,
        },
        (payload) => {
          console.log("Changes: ", payload);
        }
      )
      .subscribe();
    const channelVehicle = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: SUPABASE_TABLE.VEHICLE,
        },
        (payload) => {
          console.log("Changes: ", payload.new);
          adjustTruckMarker(payload.new);
        }
      )
      .subscribe();
    const channelTransport = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: SUPABASE_TABLE.TRANSPORT_DATA,
        },
        (payload) => {
          console.log("Changes: ", payload);
          onUpdateTransport(payload.new);
        }
      )
      .subscribe();
    const channelTrigger = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: SUPABASE_TABLE.WARNING_LIST,
        },
        (payload) => {
          console.log("Changes: ", payload);
          setTrigger(payload.new);
        }
      )
      .subscribe();

    api_fetchParticipantList();
    api_fecthProducData();
  }, []);

  //FECTH TRANSPORTATION DATA
  const api_fecthTransportData = async () => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.TRANSPORT_DATA)
      .select();
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("TRANSPORT: ", data);
      setOrderData(data);
      setfetchError(null);

      api_fecthVehicleData();
    }
  };

  //FECTH VEHICLE DATA
  const api_fecthVehicleData = async () => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.VEHICLE)
      .select();
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("VEHICLE: ", data);

      setTruckData(data);
      setTruckId(data[0].id);
      setTruckName(data[0].name);
      setTrucklMaxVelocity(data[0].velocity);
      setTruckWeight(data[0].weight);
      setTruckMaxCargo(data[0].max_cargo);
      setTruckType(data[0].type);
      setTruckLongitude(data[0].longitude);
      setTruckLatitude(data[0].latitude);
      setTruckDestination(data[0].current_destination);
      setIsTruckActive(data[0].is_active);

      setfetchError(null);
    }
  };

  //FECTH PRODUCT DATA
  const api_fecthProducData = async () => {
    console.log("fecth product");
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.PRODUCT)
      .select();
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("PRODUCT: ", data);
      setProductData(data);
      setfetchError(null);

      api_fecthWarningList();
    }
  };

  //FECTH CARGO DATA BY ID
  const api_fecthCargoData = async (id) => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.CARGO_DATA)
      .select()
      .eq("id", id);
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("CARGO DATA: ", data);
      api_fectchCargoProductData(data[0].cargo_product_id);
      setfetchError(null);
    }
  };

  const api_fectchCargoProductData = async (arrayId) => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.CARGO_PRODUCT_DATA)
      .select()
      .in("id", arrayId);
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("CARGO DATA: ", data);
      const newCargoProductData = [];
      for (let i = 0; i < data.length; i++) {
        const found = productData.find((e) => e.id == data[i].product_id);
        console.log(found);
        newCargoProductData.push({
          id: found.id,
          name: found.name,
          quantity: data[i].quantity,
        });
      }
      console.log("after: ", newCargoProductData);
      setCargoProductData(newCargoProductData);
      setfetchError(null);
    }
  };

  const api_fecthVehicleDataById = async (id) => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.VEHICLE)
      .select()
      .eq("id", id);
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log(" SELECTED VEHICLE: ", data);
      setfetchError(null);
    }
  };

  //FETCH INVENTORY DATA
  const api_fecthInvetoryById = async (id) => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.INVENTORY)
      .select()
      .eq("participant_id", id);
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("INVENTORY: ", data);
      const newInventoryData = [];
      for (let i = 0; i < data.length; i++) {
        console.log(productData);
        const found = productData.find((e) => e.id == data[i].product_id);
        console.log("FOUND", found);
        newInventoryData.push({
          id: found.id,
          name: found.name,
          quantity: data[i].quantity,
        });
      }
      console.log("after: ", newInventoryData);
      setInventory(newInventoryData);
      setfetchError(null);
    }
  };

  //FETCH WARNING LIST
  const api_fecthWarningList = async () => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.WARNING_LIST)
      .select();
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("WARNING LIST: ", data);
      setWarningList(data);
      setfetchError(null);
    }
  };

  useEffect(() => {
    console.log(
      "NEW TRUCK: ",
      truckData,
      SUPABASE_DATA.ACTIVE_LIVE_TRUCK_MARKERS
    );
    if (truckData.length < 1) return;
    for (let i = 0; i < truckData.length; i++) {
      initTruckMarker(truckData[i]);
    }
  }, [truckData]);

  //FETCH DATA BY ID
  const api_fecthParticipantDataById = async (id) => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.VIEW.GET_DATA_ORDER_BY_DATE)
      .select();
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log(data);
      updateSalesChart(data);
      setfetchError(null);
    }
  };

  const updateSalesChart = (data) => {
    const tempSeries = [];
    const tempCategories = [];
    data = data.reverse();
    for (let i = 0; i < data.length; i++) {
      tempSeries.push(data[i].sales);
      tempCategories.push(data[i].updated_date);
    }
    setSalesSeries(tempSeries);
    setSalesCategories(tempCategories);
  };

  //FECTH PARTICIPANT LIST
  const api_fetchParticipantList = async () => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.PARTICIPANT_LIST)
      .select();
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      api_setParticipantList(data);
      console.log("PARTICIPANTS", data);
      constructDtdlFromArray(data);

      setfetchError(null);

      //fecth
      api_fecthTransportData();
    }
  };
  //MAP INITAILIZATION
  useEffect(() => {
    /////////////INIT MAPPPPPPPPPPPPPP/////////////
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
      includeGeometry: true,
    });
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
    //setGeojsonPlaces(places);
  }, []);

  useEffect(() => {
    if (geojsonPlaces == null) return;
    if (geojsonPlaces.features.length == 0) return;
    map.current.on("load", () => {
      console.log("Log places", geojsonPlaces);
      if (map.current.getSource("places")) return;
      // Add a GeoJSON source containing place coordinates and information.
      map.current.addSource("places", {
        type: "geojson",
        data: geojsonPlaces,
      });

      map.current.addLayer({
        id: "poi-labels",
        type: "symbol",
        source: "places",
        layout: {
          "text-field": ["get", "description"],
          "text-variable-anchor": ["top", "bottom", "left", "right"],
          "text-radial-offset": 0.5,
          "text-justify": "auto",
          "text-offset": [0.8, 5],
          "text-size": 30,
        },
      });
    });
  }, [geojsonPlaces]);

  //On Login
  useEffect(() => {
    console.log("Get participant list: ", api_participantList);
    for (let i = 0; i < api_participantList.length; i++) {
      initMarker(
        api_participantList[i].id,
        api_participantList[i].longitude,
        api_participantList[i].latitude,
        api_participantList[i].type
      );
    }
    for (let i = 0; i < api_participantList.length; i++) {
      if (api_participantList[i].supplier) {
        //There is a supplier list
        console.log(api_participantList[i].supplier[0]);
        const targetSupplier = api_participantList.find(
          (e) => e.id == api_participantList[i].supplier[0]
        );
        addLine(
          [api_participantList[i].longitude, api_participantList[i].latitude],
          [targetSupplier.longitude, targetSupplier.latitude],
          "route" +
            api_participantList[i].id.toString() +
            "_" +
            targetSupplier.id.toString()
        );
      }
    }
    const geoJsonPlaces = createGeoJsonData(api_participantList);
    setGeojsonPlaces(geoJsonPlaces);
    SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS = api_participantList;
  }, [api_participantList]);

  //On New DTDL Added
  /* useEffect(() => {
    console.log("Update");
    if (thisChildTwinArray.length < 1) return;
    thisChildTwinArray.forEach((childTwin) => {
      console.log(childTwin.schema["@id"]);
      for (let i = 0; i < api_participantList.length; i++) {
        if (api_participantList[i].id == childTwin.schema["@id"]) {
          initMarker(
            api_participantList[i].id,
            api_participantList[i].longitude,
            api_participantList[i].latitude,
            api_participantList[i].type
          );
        }
      }
    });
  }, [thisChildTwinArray]); */

  const createGeoJsonData = (locationList) => {
    const features = [];
    for (let i = 0; i < locationList.length; i++) {
      features.push({
        type: "Feature",
        properties: {
          description: locationList[i].name,
          icon: "music",
        },
        geometry: {
          type: "Point",
          coordinates: [locationList[i].longitude, locationList[i].latitude],
        },
      });
    }
    return {
      type: "FeatureCollection",
      features: features,
    };
  };

  const initMarker = (id, lng, lat, type) => {
    const el = document.createElement("div");
    el.setAttribute("id", id);
    if (type === DTDL_MARKER_TYPE.SUPPLIER) {
      el.className = "marker-supplier";
    } else if (type === DTDL_MARKER_TYPE.DISTRIBUTOR) {
      el.className = "marker-distributor";
    } else if (type === DTDL_MARKER_TYPE.CUSTOMER) {
      el.className = "marker-customer";
    }
    el.addEventListener("click", (e) => {
      console.log(el.id);
      showModal(el.id);
    });

    /* var popup = new mapboxgl.Popup()
      .setHTML(`<strong>Test</strong>`)
      .addTo(map.current); */

    const temp = new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .addTo(map.current);
    /* .setPopup(popup); */
  };

  const initTruckMarker = (truckData) => {
    for (let i = 0; i < SUPABASE_DATA.ACTIVE_LIVE_TRUCK_MARKERS.length; i++) {
      if (SUPABASE_DATA.ACTIVE_LIVE_TRUCK_MARKERS[i].id == truckData.id) {
        console.log("There is already a truck marker");
        return;
      }
    }
    console.log("INIT TRUCK MARKER: ", truckData);
    const el = document.createElement("div");
    el.setAttribute("id", truckData.id);
    el.className = "marker-vehicle";
    el.addEventListener("click", (e) => {
      console.log(el.id);
      showTruckModal(el.id);
    });
    const temp = new mapboxgl.Marker(el)
      .setLngLat([truckData.longitude, truckData.latitude])
      .addTo(map.current);
    SUPABASE_DATA.ACTIVE_LIVE_TRUCK_MARKERS.push({
      id: truckData.id,
      marker: temp,
    });

    setTruckRoute(truckData, "route1", api_participantList);
  };

  const adjustTruckMarker = (newData) => {
    console.log(SUPABASE_DATA.ACTIVE_LIVE_TRUCK_MARKERS);
    for (let i = 0; i < SUPABASE_DATA.ACTIVE_LIVE_TRUCK_MARKERS.length; i++) {
      if (SUPABASE_DATA.ACTIVE_LIVE_TRUCK_MARKERS[i].id == newData.id) {
        console.log("Found it");
        SUPABASE_DATA.ACTIVE_LIVE_TRUCK_MARKERS[i].marker.setLngLat([
          newData.longitude,
          newData.latitude,
        ]);
        setTruckRoute(
          newData,
          "route1",
          SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS
        );
        return;
      }
    }
  };

  const setTruckRoute = (truckData, id, participantList) => {
    console.log("CURRENT PARTICIPANT LIST: ", participantList);
    for (let i = 0; i < participantList.length; i++) {
      console.log("Destination: ", truckData.current_destination);
      if (participantList[i].id == truckData.current_destination) {
        console.log("Found target: ", participantList[i], truckData);
        getRoute(
          [truckData.longitude, truckData.latitude],
          [participantList[i].longitude, participantList[i].latitude],
          id,
          map
        );
        break;
      }
    }
  };

  const updateChildTwinArray = (id, data) => {
    const tempChildTwinArray = _.cloneDeep(thisChildTwinArray);
    for (let i = 0; i < tempChildTwinArray.length; i++) {
      if (tempChildTwinArray[i].schema["@id"] == id) {
        console.log("Found: ", tempChildTwinArray[i]);
        tempChildTwinArray[i].data.Id = data.Id;
        tempChildTwinArray[i].data.location.longitude = data.location.longitude;
        tempChildTwinArray[i].data.location.latitude = data.location.latitude;
      }
    }
    dispatch(setChildTwinArray(tempChildTwinArray));
  };

  const constructDtdlFromArray = (array) => {
    const dtdlArray = [];
    console.log("Data for constructing dtdl: ", array);
    for (let i = 0; i < array.length; i++) {
      dtdlArray.push(array[i].dtdl_json_file);
    }
    dispatch(setChildTwinArray(dtdlArray));
  };

  const addLine = (origin, destination, id) => {
    if (map.current.getSource(id)) return;
    map.current.on("load", () => {
      if (map.current.getSource(id)) return;
      map.current.addSource(id, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [origin, destination],
          },
        },
      });
      map.current.addLayer({
        id: id,
        type: "line",
        source: id,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#888",
          "line-width": 8,
        },
      });
    });
  };
  const series = [
    {
      name: "Desktops",
      data: salesSeries,
    },
  ];
  const options = {
    chart: {
      height: 350,
      type: "line",
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
    },
    title: {
      text: "Sales by day",
      align: "left",
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },
    xaxis: {
      categories: salesCategories,
    },
  };

  const onUpdateTransport = (newData) => {
    let items = _.cloneDeep(orderData);
    for (let i = 0; i < items.length; i++) {
      if (items[i].id == newData.id) {
        items[i] = newData;
        setOrderData(items);
        return;
      }
    }
  };

  const handleClick = (e) => {
    console.log(e.target.innerText);
    showModal(e.target.innerText);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <a
          onClick={(e) => {
            console.log(e.target.innerText);
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "VEHICLE ID",
      dataIndex: "vehicle_id",
      key: "vehicle_id",
      render: (text) => (
        <a
          onClick={(e) => {
            console.log(e.target.innerText);
            showTruckModal(e.target.innerText);
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "CARGO ID",
      dataIndex: "cargo_id",
      key: "cargo_id",
      render: (text) => (
        <a
          onClick={(e) => {
            console.log(e.target.innerText);
            api_fecthCargoData(e.target.innerText);
            showCargoModal(e.target.innerText);
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "ORIGIN",
      dataIndex: "origin",
      key: "origin",
    },
    {
      title: "DESTINATION",
      dataIndex: "destination",
      key: "destination",
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        let color = "green";
        if (text === SUPABASE_TABLE.TRANSPORT_STATUS.COMPLETE) {
          color = "green";
        } else if (text === SUPABASE_TABLE.TRANSPORT_STATUS.ONGOING) {
          color = "orange";
        } else if (text === SUPABASE_TABLE.TRANSPORT_STATUS.FAIL) {
          color = "volcano";
        } else {
          color = "blue";
        }
        return (
          <Tag color={color} key={text}>
            {text.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "DEPARTURE TIME",
      dataIndex: "depart_time",
      key: "depart_time",
    },
    {
      title: "COMPLETE TIME",
      dataIndex: "complete_time",
      key: "complete_time",
    },
    {
      title: "ETA",
      dataIndex: "ETA",
      key: "ETA",
    },
  ];

  return (
    <div>
      <Row>
        <Col span={6}>
          <Row>
            <Col span={24}>
              <h1>
                <div style={{ fontWeight: "bold" }}>ORDERS</div>
              </h1>
              <Table
                columns={columns}
                dataSource={orderData}
                scroll={{
                  x: 1300,
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <h1>
                <div style={{ fontWeight: "bold", color: "red" }}>WARNINGS</div>
              </h1>
              <Table
                columns={columns3}
                dataSource={warningList}
                scroll={{
                  x: 1300,
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Button
                onClick={() => {
                  if (trigger) {
                    setTrigger(false);
                  } else {
                    setTrigger(true);
                  }
                }}
              >
                Test
              </Button>
              <Notification trigger={trigger} />
            </Col>
          </Row>
        </Col>
        <Col span={18}>
          <div ref={mapContainer} className="realtime-map-container">
            <Space direction="vertical" className="absolute z-40 w-69 left-0">
              <Typography className="bg-sky-950 pt-2 pb-2 pl-2 pr-2 rounded-lg text-white">
                Lng: {lng} | Lat: {lat} | Zoom: {zoom}
              </Typography>
            </Space>
          </div>
          <Modal
            title={modalName}
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            width={1000}
          >
            <h1>
              <div style={{ fontWeight: "bold" }}>INFORMATION: </div>
            </h1>
            <div>
              <span style={{ fontWeight: "bold" }}>Business Process: </span>
              <Button
                onClick={() => {
                  console.log(currentModeler);
                  setOpenBpmnModal(true);
                }}
              >
                Open
              </Button>
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Name: </span> {modalName}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Id: </span> {modalId}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Address: </span>{" "}
              {selectAddress}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Supplier: </span>{" "}
              {selectSupplier == null ? (
                <div>NULL</div>
              ) : (
                selectSupplier.map((e) => (
                  <Button
                    onClick={(e) => {
                      handleClick(e);
                    }}
                  >
                    {e}
                  </Button>
                ))
              )}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Customer: </span>{" "}
              {selectCustomer == null ? (
                <div>NULL</div>
              ) : (
                selectCustomer.map((e) => (
                  <Button
                    onClick={(e) => {
                      handleClick(e);
                    }}
                  >
                    {e}
                  </Button>
                ))
              )}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Inventory: </span>{" "}
              <Table dataSource={inventory} columns={columns2} />
            </div>
            <div>
              <ReactApexChart
                options={options}
                series={series}
                type="line"
                height="350"
                width="800"
              />
            </div>
            <div>
              <ReactApexChart
                options={options}
                series={series}
                type="line"
                height="350"
                width="800"
              />
            </div>
          </Modal>
          <Modal
            title={truckName}
            open={truckModalOpen}
            onOk={handleTruckOk}
            onCancel={handleTruckCancel}
            width={1000}
          >
            <h1>
              <span style={{ fontWeight: "bold" }}>INFORMATION: </span>
            </h1>
            <div>
              <span style={{ fontWeight: "bold" }}>Name: </span> {truckName}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Id: </span> {truckId}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Max Velocity: </span>{" "}
              {truckMaxVelocity}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Weight: </span> {truckWeight}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Max Cargo: </span>{" "}
              {truckMaxCargo}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Type: </span> {truckType}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Is Active: </span>{" "}
              {isTruckActive.toString()}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Longitude: </span>{" "}
              {truckLongitude}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Latitude: </span>{" "}
              {truckLatitude}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Destination: </span>{" "}
              {truckDestination}
            </div>
          </Modal>
          <Modal
            title="Cargo"
            open={isCargoModalOpen}
            onOk={() => {
              setIsCargoModalOpen(false);
            }}
            onCancel={() => {
              setIsCargoModalOpen(false);
            }}
            width={1000}
          >
            <Table dataSource={cargoProductData} columns={columns1} />
          </Modal>
          <Modal
            title="Business Process"
            open={openBpmnModal}
            onOk={() => {
              setOpenBpmnModal(false);
            }}
            onCancel={() => {
              setOpenBpmnModal(false);
            }}
            width={1000}
          >
            <div
              id="container"
              style={{
                border: "1px solid #000000",
                height: "600px",
                width: "100%",
                margin: "auto",
              }}
            >
              Test
            </div>
          </Modal>
        </Col>
      </Row>
    </div>
  );
}

export default RealtimeMap;
