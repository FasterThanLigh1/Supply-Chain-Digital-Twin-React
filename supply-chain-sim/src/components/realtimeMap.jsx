/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, Children } from "react";
import mapboxgl from "mapbox-gl";
import {
  SUPABASE_DATA,
  DTDL_MARKER_TYPE,
  SUPABASE_TABLE,
  mapaboxAcessToken,
  BPMN_TYPE,
  UI_DATA,
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
  Tabs,
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
import Modeler from "bpmn-js/lib/Viewer";
import KeyboardMoveModule from "diagram-js/lib/navigation/keyboard-move";
import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";
import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import axios from "axios";
import BootstrapModal from "react-bootstrap/Modal";

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

const items = [
  {
    key: "1",
    label: `Tab 1`,
    children: `Content of Tab Pane 1`,
  },
  {
    key: "2",
    label: `Tab 2`,
    children: `Content of Tab Pane 2`,
  },
  {
    key: "3",
    label: `Tab 3`,
    children: `Content of Tab Pane 3`,
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
  const [zoom, setZoom] = useState(9);
  const [geojsonPlaces, setGeojsonPlaces] = useState(null);
  const [lng, setLng] = useState(106.505);
  const [lat, setLat] = useState(10.9374);

  const [salesSeries, setSalesSeries] = useState([]);
  const [salesCategories, setSalesCategories] = useState([]);
  const [truckData, setTruckData] = useState([]);

  //SELECT PARTICIAPANT MODAL ATTRIBUTE
  const [modalName, setModalName] = useState(null);
  const [modalId, setModalId] = useState(null);
  const [selectAddress, setSelectAddress] = useState(null);
  const [description, setDescription] = useState(null);
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
  const [cargoTemperature, setCargoTemperature] = useState(null);
  const [cargoHumidity, setCargoHumidity] = useState(null);

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
  const [canvas, setCanvas] = useState(null);
  const [currentModeler, modelerSet] = useState(null);
  const container = document.getElementById("container");

  //UI ATTRIBUTE
  const [selectDeviceId, setSelectDeviceId] = useState(null);
  const [tabContent, setTabContent] = useState(null);
  const [currentBpmnTask, setCurrentBpmnTask] = useState([]);

  //BPMN UI ATTRIBUTE
  const [openTaskModal, setOpenTaskModal] = useState(false);

  useEffect(() => {
    console.log(diagram);
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
    }

    if (diagram.length > 0) {
      if (currentModeler == null) {
        const modeler = new Modeler({
          container,
          additionalModules: [KeyboardMoveModule, MoveCanvasModule],
          keyboard: {
            bindTo: document,
          },
        });
        modelerSet(modeler);
        /* setBusiness(modeler);
        console.log(business); */
        modeler.importXML(diagram, (err) => {
          if (err) {
          } else {
            var elementRegistry = modeler.get("elementRegistry");
            var canvas = modeler.get("canvas");
            setCanvas(canvas);
            //setCanvas(canvas);
            console.log(elementRegistry);
            elementRegistry.forEach(function (elem, gfx) {
              if (elem.type === "bpmn:StartEvent") {
                // do something with the task
                const businessObject = elem.businessObject;
                /* canvas.addMarker(elem.id, "highlight"); */
                console.log("Start", elem);
                //canvas.addMarker(elem.id, "highlight");
              }
            });
            let eventBus = modeler.get("eventBus");
            let events = [
              "element.hover",
              "element.out",
              "element.click",
              "element.dblclick",
              "element.mousedown",
              "element.mouseup",
            ];

            events.forEach(function (event) {
              eventBus.on(event, function (e) {
                // e.element = the model element
                // e.gfx = the graphical element
                if (event === "element.click") {
                  console.log(event, "on", e.element.id);
                  showTaskModal(e.element.id);
                }
              });
            });
          }
        });
      } else {
        currentModeler.importXML(diagram, (err) => {
          if (err) {
          } else {
            console.log("[modeler", currentModeler);
            var elementRegistry = currentModeler.get("elementRegistry");
            //setCanvas(canvas);
            console.log(elementRegistry);
            const tempTask = [];
            elementRegistry.forEach(function (elem, gfx) {
              console.log(elem.type);
              if (elem.type === BPMN_TYPE.TASK) {
                // do something with the task
                console.log("Start", elem);
                tempTask.push(elem);

                //canvas.addMarker(elem.id, "highlight");
                //simulationSupport.triggerElement(elem.id);
              }
            });
            console.log(tempTask);
            setCurrentBpmnTask(tempTask);
            UI_DATA.SELECT_BPMN_TASK = tempTask;
          }
        });
      }
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
        setDescription(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].description);
        setSelectCustomer(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].target);
        setSelectSupplier(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].supplier);
        diagramSet(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].bpmn);
      }
    }

    api_fetchInvetoryById(id);
    api_fetchParticipantDataById(id);
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
    api_fetchVehicleDataById(id);
  };
  const handleTruckOk = () => {
    setTruckModalOpen(false);
  };
  const handleTruckCancel = () => {
    setTruckModalOpen(false);
  };

  useEffect(() => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
        },
        (payload) => console.log(payload)
      )
      .subscribe();
    /* const channelVehicle = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: SUPABASE_TABLE.IOT_DEVICES,
        },
        (payload) => {
          console.log("Changes: ", payload.new);
        }
      )
      .subscribe(); */
  }, []);

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
    const channelTelemetry = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: SUPABASE_TABLE.LIVE_TELEMETRY,
        },
        (payload) => {
          console.log("Changes: ", payload);
          console.log("ID: ", selectDeviceId);
          setCargoTemperature(payload.new.temperature);
          setCargoHumidity(payload.new.humidity);
          if (payload.new.device_id == selectDeviceId) {
          }
        }
      )
      .subscribe();
    const channelLiveProcess = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: SUPABASE_TABLE.LIVE_PROCESS,
        },
        (payload) => {
          console.log("Changes: ", payload);
          api_fetchBpmnProcessById(UI_DATA.SELECT_PARTICIPANT_ID);
          console.log(UI_DATA.SELECT_BPMN_TASK);
          /* for (let i = 0; i < UI_DATA.SELECT_BPMN_TASK.length; i++) {
            canvas.removeMarker(
              UI_DATA.SELECT_BPMN_TASK[i].id,
              "highlight-idle"
            );
            canvas.removeMarker(
              UI_DATA.SELECT_BPMN_TASK[i].id,
              "highlight-active"
            );
          } */
          for (let i = 0; i < currentBpmnTask.length; i++) {
            if (currentBpmnTask[i].id == payload.new.id) {
              console.log(currentBpmnTask[i]);
              //REMOVE OLD MARKER
              /* if (payload.old.status == SUPABASE_TABLE.PROCESS_STATUS.ACTIVE) {
                canvas.removeMarker(payload.new.id, "highlight-active");
              } else if (
                payload.old.status == SUPABASE_TABLE.PROCESS_STATUS.IDLE
              ) {
                canvas.removeMarker(payload.new.id, "highlight-idle");
              } */
              //ADD NEW MARKER
              if (payload.new.status == SUPABASE_TABLE.PROCESS_STATUS.ACTIVE) {
                console.log("ACTIVE");
                canvas.addMarker(payload.new.id, "highlight-active");
              } else if (
                payload.new.status == SUPABASE_TABLE.PROCESS_STATUS.IDLE
              ) {
                console.log("IDLE");
                canvas.addMarker(payload.new.id, "highlight-idle");
              }
            }
          }
        }
      )
      .subscribe();

    api_fetchParticipantList();
    api_fetchProducData();
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

      api_fetchVehicleData();
    }
  };

  //FECTH VEHICLE DATA
  const api_fetchVehicleData = async () => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.VEHICLE)
      .select();
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("VEHICLE: ", data);

      setTruckData(data);

      //api_fecthLatestTelemetry(data[0].iot_device_id);

      setfetchError(null);
    }
  };

  //FECTH PRODUCT DATA
  const api_fetchProducData = async () => {
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

      api_fetchWarningList();
    }
  };

  //FECTH CARGO DATA BY ID
  const api_fetchCargoData = async (id) => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.CARGO_DATA)
      .select()
      .eq("id", id);
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("CARGO DATA: ", data);
      api_fetchCargoProductData(data[0].cargo_product_id);
      setfetchError(null);
    }
  };

  const api_fetchCargoProductData = async (arrayId) => {
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

  const api_fetchVehicleDataById = async (id) => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.VEHICLE)
      .select()
      .eq("id", id);
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log(" SELECTED VEHICLE: ", data);
      api_fecthLatestTelemetry(data[0].iot_device_id);
      console.log("NEW DEVICE ID: ", data[0].iot_device_id);
      setSelectDeviceId(data[0].iot_device_id);

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

  //FETCH INVENTORY DATA
  const api_fetchInvetoryById = async (id) => {
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
  const api_fetchWarningList = async () => {
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

  //FETCH DATA BY ID
  const api_fetchParticipantDataById = async (id) => {
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

  //FETCH PROCESS BY ID
  const api_fetchBpmnProcessById = async (participantId) => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.LIVE_PROCESS)
      .select()
      .eq("participant_id", participantId);
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        console.log(data[i].id);
        console.log(currentBpmnTask);
        for (let j = 0; j < currentBpmnTask.length; j++) {
          console.log(currentBpmnTask[j].id);
          console.log(data[i].id);
          if (data[i].id == currentBpmnTask[j].id) {
            if (data[i].status == SUPABASE_TABLE.PROCESS_STATUS.ACTIVE) {
              console.log("ACTIVE");
              canvas.addMarker(data[i].id, "highlight-active");
            } else if (data[i].status == SUPABASE_TABLE.PROCESS_STATUS.IDLE) {
              console.log("IDLE");
              canvas.addMarker(data[i].id, "highlight-idle");
            }
          }
        }
      }
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

  //FECTH LATEST TELEMETRY DATA
  const api_fecthLatestTelemetry = async (deviceId) => {
    console.log(deviceId);
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.LIVE_TELEMETRY)
      .select()
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("TELEMETRY", data);
      setCargoTemperature(data[0].temperature);
      setCargoHumidity(data[0].humidity);
      //fecth
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
    const tempTabItems = [];
    for (let i = 0; i < api_participantList.length; i++) {
      initMarker(
        api_participantList[i].id,
        api_participantList[i].longitude,
        api_participantList[i].latitude,
        api_participantList[i].type
      );
      tempTabItems.push({
        key: api_participantList[i].id,
        label: api_participantList[i].name,
        children: api_participantList[i].name,
      });
    }

    setTabContent(tempTabItems);

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
    } else if (type === DTDL_MARKER_TYPE.FARM) {
      el.className = "marker-farm";
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

  const onTabChange = (e) => {
    console.log("TAB CHANGE: ", e);
    UI_DATA.SELECT_PARTICIPANT_ID = e;
    for (let i = 0; i < api_participantList.length; i++) {
      if (api_participantList[i].id == e) {
        console.log(api_participantList[i]);
        diagramSet(api_participantList[i].bpmn);
        api_fetchBpmnProcessById(api_participantList[i].id);
        return;
      }
    }
  };

  const showTaskModal = (id) => {
    console.log("TASK MODAL: ", id);
    setOpenTaskModal(true);
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
            api_fetchCargoData(e.target.innerText);
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
              <span style={{ fontWeight: "bold" }}>Description: </span>{" "}
              {description}
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
            <div>
              <span style={{ fontWeight: "bold" }}>Temperature: </span>{" "}
              {cargoTemperature}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Humidity: </span>{" "}
              {cargoHumidity}
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
                height: "400px",
                width: "100%",
                margin: "auto",
                zIndex: 100,
              }}
            ></div>
          </Modal>
          <Modal
            title="Task"
            open={openTaskModal}
            onOk={() => {
              setOpenTaskModal(false);
            }}
            onCancel={() => {
              setOpenTaskModal(false);
            }}
            width={1000}
          >
            Process
          </Modal>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Tabs
            defaultActiveKey="1"
            items={tabContent}
            onChange={onTabChange}
          />
          <div
            id="container"
            style={{
              border: "1px solid #000000",
              height: "250px",
              width: "100%",
              margin: "auto",
            }}
          ></div>
        </Col>
      </Row>
    </div>
  );
}

export default RealtimeMap;
