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
  MESSAGE_TYPE,
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
  Card,
  List,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { selectChildTwinArray, setChildTwinArray } from "../features/dtdlSlice";
import _ from "lodash";
import Chart from "react-apexcharts";
import ReactApexChart from "react-apexcharts";
import supabase from "../config/supabaseClient";
import { selectTruckDataArray } from "../features/truckSlice";
import { getRoute, openNotificationWithIcon } from "../constants/callback";
import Notification from "./notification";
import Modeler from "bpmn-js/lib/Viewer";
import KeyboardMoveModule from "diagram-js/lib/navigation/keyboard-move";
import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";
import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import axios from "axios";
import BootstrapModal from "react-bootstrap/Modal";
import TruckModalCard from "./truckModalCard";
import ReactBpmn from "react-bpmn";

mapboxgl.accessToken = mapaboxAcessToken;
const { Title } = Typography;

const inventoryColumns = [
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Product",
    dataIndex: "product_name",
    key: "product_name",
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    key: "quantity",
  },
];

const salesColumns = [
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Date",
    dataIndex: "created_at",
    key: "created_at",
  },
  {
    title: "Ticket Number",
    dataIndex: "ticket_number",
    key: "ticket_number",
  },
  {
    title: "Article",
    dataIndex: "article",
    key: "article",
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    key: "quantity",
  },
  {
    title: "Price",
    dataIndex: "unit_price",
    key: "unit_price",
  },
];
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

function RealtimeMap() {
  const thisChildTwinArray = useSelector(selectChildTwinArray);
  const thisTruckDataArray = useSelector(selectTruckDataArray);

  //MAP ATTRIBUTE
  const mapContainer = useRef(null);
  const dispatch = useDispatch();
  const map = useRef(null);
  const [api_participantList, api_setParticipantList] = useState([]);
  const [fetchError, setfetchError] = useState(null);
  const [zoom, setZoom] = useState(13.81);
  const [geojsonPlaces, setGeojsonPlaces] = useState(null);
  const [lng, setLng] = useState(2.329);
  const [lat, setLat] = useState(48.8487);

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
  const [selectParticipant, setSelectParticipant] = useState(null);
  const [machineAttributes, setMachineAttributes] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [participantId, setParticipantId] = useState(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [storeProduct, setStoreProduct] = useState(null);

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
  const [truckCargo, setTruckCargo] = useState(null);

  const [truckAttributeData, setTruckAttributeData] = useState(null);

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
  const [currentDate, setCurrentDate] = useState(null);
  const [localeTime, setLocaleTime] = useState(new Date().toLocaleString());

  //BPMN UI ATTRIBUTE
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [taskName, setTaskName] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [taskIotId, setTaskIotId] = useState(null);
  const [taskIotData, setTaskIotData] = useState(null);
  const [taskStatus, setTaskStatus] = useState(null);
  const [taskIotType, setTaskIotType] = useState(null);
  const [participantsIoTDevices, setParticipantsIoTDevices] = useState([]);

  useEffect(() => {
    let secTimer = setInterval(() => {
      setLocaleTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(secTimer);
  }, []);

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
            UI_DATA.SELECT_CANVAS = canvas;
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
                if (event === "element.click") {
                  if (e.element.type == "bpmn:Task") {
                    console.log(event, "on", e.element.id);
                    showTaskModal(e.element.id);
                  }
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
            console.log(elementRegistry);
            const tempTask = [];
            elementRegistry.forEach(function (elem, gfx) {
              console.log(elem.type);
              if (elem.type === BPMN_TYPE.TASK) {
                // do something with the task
                console.log("Start", elem);
                tempTask.push(elem);
              }
            });
            console.log("SET TASK: ", tempTask);
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
  const showStoreModal = (id) => {
    console.log("Open store: ", id);
    setIsStoreModalOpen(true);
    api_fetchStoreProduct(id);
  };

  //On select participant marker
  const showModal = (id) => {
    if (id == "dtmi:dtdl:Bakery1;1" || id == "dtmi:dtdl:Bakery2;1") {
      setIsModalOpen(true);
      setSelectParticipant(true);
      setParticipantId(id);
      api_fetchIoTData(id);
      api_fetchSales(id);
    } else if (id == "dtmi:dtdl:Material1;1" || id == "dtmi:dtdl:Material2;1") {
      showStoreModal(id);
    }

    console.log(id);
    // for (let i = 0; i < SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS.length; i++) {
    //   console.log(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i]);
    //   if (SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].id == id) {
    //     setModalName(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].name);
    //     setModalId(id);
    //     setSelectAddress(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].address);
    //     setDescription(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].description);
    //     setSelectCustomer(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].target);
    //     setSelectSupplier(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].supplier);
    //     diagramSet(SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS[i].bpmn);
    //   }
    // }

    // api_fetchInvetoryById(id);
    // api_fetchParticipantDataById(id);
  };

  useEffect(() => {
    const temp = participantsIoTDevices.filter((e) =>
      e.id.startsWith("machine_")
    );
    console.log("New machine data: ", temp);
    setMachineAttributes(temp);
  }, [participantsIoTDevices]);

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

  //SUPABASE FETCH
  useEffect(() => {
    console.log("START FETCH");
    api_fetchParticipantList();
    api_fetchProducData();
    supabase
      .channel("any")
      .on("postgres_changes", { event: "*", schema: "*" }, (payload) => {
        console.log("Change received!", payload);
        console.log("In table: ", payload.table);
        //VEHICLE CHANGES
        if (payload.table == SUPABASE_TABLE.VEHICLE) {
          adjustTruckMarker(payload.new);
          console.log("Truck changed! ", payload.new);
          setTruckAttributeData(payload.new);
        }
        //WARNING CHANGES
        else if (payload.table == SUPABASE_TABLE.WARNING_LIST) {
          setTrigger(payload.new);
        }
        //TRANSPORT CHANGES
        else if (payload.table == SUPABASE_TABLE.TRANSPORT_DATA) {
          onUpdateTransport(payload.new);
        }
        //IOT CHANGES
        else if (payload.table == SUPABASE_TABLE.IOT_DEVICES) {
          setTaskIotData(payload.new.data.data);
          if (payload.new.status == "ERROR") {
            // setTrigger(payload.new);
            openNotificationWithIcon(
              "WARNING",
              payload.new.error_message,
              MESSAGE_TYPE.ERROR,
              10
            );
          }
          setParticipantsIoTDevices((prev) => {
            const tempArr = [...prev];
            console.log(payload.new.data.data);
            for (let i = 0; i < tempArr.length; i++) {
              console.log(
                "Current index: ",
                tempArr[i],
                " new id: ",
                payload.new.id
              );
              if (tempArr[i].id == payload.new.id) {
                console.log("yes ", payload.new.data);
                tempArr[i].data = payload.new.data;
              } else {
                console.log("no");
              }
            }
            console.log("New array: ", tempArr);
            return tempArr;
          });
          // if (payload.new.data.id == "sales_record") {
          //   api_fetchSales(participantId);
          // }
        }
        //PROCESS CHANGES
        else if (payload.table == SUPABASE_TABLE.LIVE_PROCESS) {
          console.log(payload.new);
          for (let j = 0; j < UI_DATA.SELECT_BPMN_TASK.length; j++) {
            if (payload.new.id == UI_DATA.SELECT_BPMN_TASK[j].id) {
              //ADD NEW MARKER
              if (payload.new.status == SUPABASE_TABLE.PROCESS_STATUS.ACTIVE) {
                console.log("ACTIVE");
                UI_DATA.SELECT_CANVAS.removeMarker(
                  payload.new.id,
                  "highlight-idle"
                );
                UI_DATA.SELECT_CANVAS.addMarker(
                  payload.new.id,
                  "highlight-active"
                );
              } else if (
                payload.new.status == SUPABASE_TABLE.PROCESS_STATUS.IDLE
              ) {
                console.log("IDLE");
                UI_DATA.SELECT_CANVAS.removeMarker(
                  payload.new.id,
                  "highlight-active"
                );
                UI_DATA.SELECT_CANVAS.addMarker(
                  payload.new.id,
                  "highlight-idle"
                );
              }
            }
          }
        }
      })
      .subscribe();
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
      setTruckAttributeData(data[0]);
      //api_fecthLatestTelemetry(data[0].iot_device_id);
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
      setCargoTemperature(data[0].temperature);
      setCargoHumidity(data[0].humidity);
      setTruckCargo(data[0].cargo_id);

      setfetchError(null);
      api_fetchIoTDataById(data[0].iot_device_id);
    }
  };

  useEffect(() => {
    console.log("Truck attribute: ", truckAttributeData);
  }, [truckAttributeData]);

  //FETCH PROCESS
  const api_fecthTaskById = async (id) => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.LIVE_PROCESS)
      .select()
      .eq("id", id);
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("TASK: ", data);
      console.log(data[0].name);
      setTaskName(data[0].name);
      setTaskId(data[0].id);
      setTaskStatus(data[0].status);
      setTaskIotId(data[0].iot_device_id);

      api_fetchIOTById(data[0].iot_device_id);
    }
  };

  //FETCH IOT DEVICE
  const api_fetchIOTById = async (id) => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.IOT_DEVICES)
      .select()
      .eq("id", id);
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("IOT DEVICES: ", data);
      console.log(data[0].data.data);
      setTaskIotType(data[0].data.type);
      setTaskIotData(data[0].data.data);
      if (data[0].data.type == SUPABASE_TABLE.IOT_DEVICE_TYPE.MILK_MONITOR) {
        console.log("MILK MONITORITOR");
        console.log(data[0].data);
      } else if (
        data[0].data.type == SUPABASE_TABLE.IOT_DEVICE_TYPE.PACKAGE_MONITOR
      ) {
        console.log("PACKAGE MONITORITOR");
      } else if (
        data[0].data.type == SUPABASE_TABLE.IOT_DEVICE_TYPE.MILK_MONITOR
      ) {
        console.log("MILK MONITORITOR");
      }
    }
  };

  //FETCH INVENTORY DATA

  const api_fetchInventory = async (id) => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.INVENTORY)
      .select()
      .eq("participant_id", id);
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("INVENTORY: ", data);
      setInventory(data);
      setfetchError(null);
    }
  };

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
      console.log("CURRENT TASK: ", UI_DATA.SELECT_BPMN_TASK);
      for (let i = 0; i < data.length; i++) {
        console.log(data[i].id);
        console.log(UI_DATA.SELECT_BPMN_TASK);
        for (let j = 0; j < UI_DATA.SELECT_BPMN_TASK.length; j++) {
          console.log(UI_DATA.SELECT_BPMN_TASK[j].id);
          console.log(data[i].id, data[i].status);
          if (data[i].id == UI_DATA.SELECT_BPMN_TASK[j].id) {
            if (data[i].status == SUPABASE_TABLE.PROCESS_STATUS.ACTIVE) {
              console.log("ACTIVE");
              UI_DATA.SELECT_CANVAS.addMarker(data[i].id, "highlight-active");
            } else if (data[i].status == SUPABASE_TABLE.PROCESS_STATUS.IDLE) {
              console.log("IDLE");
              UI_DATA.SELECT_CANVAS.addMarker(data[i].id, "highlight-idle");
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

  //FETCH STORE PRODUCT LIST
  const api_fetchStoreProduct = async (id) => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.SUPPLIER)
      .select()
      .eq("store", id);
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("IOT devices", data);
      setStoreProduct(data);
    }
  };

  //FECTH IOT DEVICES DATA
  const api_fetchIoTData = async (id) => {
    console.log("IOT DEVICES", id);
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.IOT_DEVICES)
      .select()
      .eq("name", id);
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("IOT devices", data);
      setParticipantsIoTDevices(data);
    }
  };
  const api_fetchIoTDataById = async (id) => {
    console.log("IOT DEVICES BY ID", id);
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.IOT_DEVICES)
      .select()
      .eq("id", id);
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("IOT devices", data);
      setParticipantsIoTDevices(data);
    }
  };

  //FETCH SALES DATA
  const api_fetchSales = async (id) => {
    console.log("Sales", id);
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.SALES)
      .select()
      .eq("participant_id", id)
      .order("created_at", { ascending: false });
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      console.log("Sales: ", data);
      setSalesData(data);
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
        for (let j = 0; j < api_participantList[i].supplier.length; j++) {
          console.log(api_participantList[i].supplier[j]);
          const targetSupplier = api_participantList.find(
            (e) => e.id == api_participantList[i].supplier[j]
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

        // getRoute(
        //   [api_participantList[i].longitude, api_participantList[i].latitude],
        //   [targetSupplier.longitude, targetSupplier.latitude],
        //   "route" +
        //     api_participantList[i].id.toString() +
        //     "_" +
        //     targetSupplier.id.toString(),
        //   map
        // );
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

    const routeId = "route_" + truckData.id.toString();
    setTruckRoute(truckData, routeId, api_participantList);
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
        const routeId = "route_" + newData.id.toString();
        setTruckRoute(newData, routeId, SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS);
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
    api_fecthTaskById(id);
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
    <div className="h-screen">
      {/* <Row className="h-full">
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
        <Col span={18}> */}
      <div ref={mapContainer} className="realtime-map-container">
        <Space direction="vertical" className="absolute z-40 w-69 left-0">
          <Typography className="bg-amber-400 mt-2 ml-2 pt-2 pb-2 pl-2 pr-2 rounded-lg text-white">
            Lng: {lng} | Lat: {lat} | Zoom: {zoom}
          </Typography>
          <Typography className="bg-amber-400 ml-2 pb-2 pl-2 pr-2 rounded-lg text-white">
            Date Time: {localeTime}
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
          <div style={{ fontWeight: "bold" }}>AVAILABLE IOT DEVICES: </div>
          <Row gutter={16}>
            {participantsIoTDevices.map((e) => {
              return (
                <Col span={8}>
                  <Card title={e.id} bordered={false}>
                    <div className="font-bold">Latest data:</div>
                    <div>{JSON.stringify(e.data)}</div>
                  </Card>
                </Col>
              );
            })}
          </Row>
          <div className="font-bold mt-4 mb-4">
            COMMERCIAL BAKING MACHINE STATUS:
          </div>
          <div className="rounded border-4 mb-4 mt-4 h-64">
            <ReactBpmn
              url="/public/diagram1.bpmn"
              onShown={() => {
                console.log("show");
              }}
              onLoading={() => {
                console.log("Loading");
              }}
              onError={() => {
                console.log("eroro");
              }}
            />
          </div>
          <List
            size="large"
            header={<div className="text-xl font-bold">Machine attribute</div>}
            bordered
          >
            <List.Item>
              State:{" "}
              {machineAttributes.length > 0
                ? machineAttributes[0].data.data.state
                : null}
            </List.Item>
            <List.Item>
              Oven temperature:{" "}
              {machineAttributes.length > 0
                ? machineAttributes[0].data.data.oven_t
                : null}
            </List.Item>
            <List.Item>
              Proofing temperature:{" "}
              {machineAttributes.length > 0
                ? machineAttributes[0].data.data.proofing_t
                : null}
            </List.Item>
            <List.Item>
              Ambient temperature:{" "}
              {machineAttributes.length > 0
                ? machineAttributes[0].data.data.ambient_t
                : null}
            </List.Item>
            <List.Item>
              Motor speed:{" "}
              {machineAttributes.length > 0
                ? machineAttributes[0].data.data.motor_speed
                : null}
            </List.Item>
            <List.Item>
              Power consumption:{" "}
              {machineAttributes.length > 0
                ? machineAttributes[0].data.data.power_consumption
                : null}
            </List.Item>
            <List.Item>
              Dough weight:{" "}
              {machineAttributes.length > 0
                ? machineAttributes[0].data.data.dough_weight
                : null}
            </List.Item>
            <List.Item>
              Dough volume:{" "}
              {machineAttributes.length > 0
                ? machineAttributes[0].data.data.dough_volume
                : null}
            </List.Item>
            <List.Item>
              Proof time:{" "}
              {machineAttributes.length > 0
                ? machineAttributes[0].data.data.proof_time
                : null}
            </List.Item>
            <List.Item>
              Baking time:{" "}
              {machineAttributes.length > 0
                ? machineAttributes[0].data.data.baking_time
                : null}
            </List.Item>
            <List.Item>
              Baking temperature:{" "}
              {machineAttributes.length > 0
                ? machineAttributes[0].data.data.baking_temperature
                : null}
            </List.Item>
            <List.Item>
              Quantity produce:{" "}
              {machineAttributes.length > 0
                ? machineAttributes[0].data.data.quantity_produced
                : null}
            </List.Item>
          </List>
          <div className="font-bold mt-4">SALES</div>
          <Table columns={salesColumns} dataSource={salesData} />
          <div className="font-bold mt-4">INVENTORY</div>
          <Table columns={inventoryColumns} dataSource={inventory} />
        </h1>
        {/* <div>
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
            </div> */}
      </Modal>
      <Modal
        open={isStoreModalOpen}
        onOk={() => {
          setIsStoreModalOpen(false);
        }}
        onCancel={() => {
          setIsStoreModalOpen(false);
        }}
        width={500}
      >
        <h1>
          <div className="text-3xl font-bold">SALES GOODS: </div>
          <div>
            {storeProduct != null
              ? storeProduct.map((product) => {
                  return (
                    <Tag className="text-2xl mt-4" color="green">
                      {product.product_name}
                    </Tag>
                  );
                })
              : null}
          </div>
        </h1>
      </Modal>
      <Modal
        title={truckName}
        open={truckModalOpen}
        onOk={handleTruckOk}
        onCancel={handleTruckCancel}
        width={1000}
      >
        <h1>
          <div style={{ fontWeight: "bold" }}>AVAILABLE IOT DEVICES: </div>
          <Row gutter={16}>
            {participantsIoTDevices.map((e) => {
              return (
                <Col span={8}>
                  <Card title={e.id} bordered={false}>
                    <div className="font-bold">Latest data:</div>
                    <div>{JSON.stringify(e.data)}</div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </h1>
        <List
          size="large"
          header={<div style={{ fontWeight: "bold" }}>TRUCK ATTRIBUTE</div>}
          bordered
        >
          <List.Item>
            Longitude:{" "}
            {truckAttributeData != null ? truckAttributeData.longitude : null}
          </List.Item>
          <List.Item>
            Latitude:{" "}
            {truckAttributeData != null ? truckAttributeData.latitude : null}
          </List.Item>
          <List.Item>
            Temperature:{" "}
            {truckAttributeData != null ? truckAttributeData.temperature : null}
          </List.Item>
          <List.Item>
            Humidity:{" "}
            {truckAttributeData != null ? truckAttributeData.humidity : null}
          </List.Item>
          <List.Item>
            Shock level:{" "}
            {truckAttributeData != null ? truckAttributeData.shock_level : null}
          </List.Item>
          <List.Item>
            Light exposure:{" "}
            {truckAttributeData != null
              ? truckAttributeData.light_exposure
              : null}
          </List.Item>
          <List.Item>
            Door status:{" "}
            {truckAttributeData != null
              ? truckAttributeData.door_status.toString()
              : false.toString()}
          </List.Item>
          <List.Item>
            Battery level:{" "}
            {truckAttributeData != null
              ? truckAttributeData.battery_level
              : null}
          </List.Item>
          <List.Item>
            Connectivity:{" "}
            {truckAttributeData != null
              ? truckAttributeData.connectivity.toString()
              : null}
          </List.Item>
          <List.Item>
            Destination:{" "}
            {truckAttributeData != null
              ? truckAttributeData.current_destination
              : null}
          </List.Item>
          <List.Item>
            Cargo:{" "}
            {truckAttributeData != null
              ? JSON.stringify(truckAttributeData.cargo)
              : null}
          </List.Item>
        </List>
        {/* <div>
              <span style={{ fontWeight: "bold", fontSize: "15px" }}>
                NAME:{" "}
              </span>{" "}
              {truckName}
            </div>
            <div>
              <span style={{ fontWeight: "bold", fontSize: "15px" }}>ID: </span>{" "}
              {truckId}
            </div>
            <div>
              <span style={{ fontWeight: "bold", fontSize: "15px" }}>
                CARGO:{" "}
              </span>{" "}
              <a
                onClick={(e) => {
                  console.log(e.target.innerText);
                  api_fetchCargoData(e.target.innerText);
                  showCargoModal(e.target.innerText);
                }}
              >
                {truckCargo}
              </a>
            </div>
            <TruckModalCard
              title={"DESTINATION"}
              data={truckDestination}
              unit={""}
            />
            <TruckModalCard
              title={"LONGITUDE"}
              data={truckLongitude}
              unit={""}
            />
            <TruckModalCard title={"LATITUDE"} data={truckLatitude} unit={""} />
            <TruckModalCard
              title={"VELOCITY"}
              data={truckMaxVelocity}
              unit={"km/h"}
            />
            <TruckModalCard
              title={"CARGO WEIGHT"}
              data={truckWeight}
              unit={"kg"}
            />
            <TruckModalCard title={"TYPE"} data={truckType} unit={" "} />
            <TruckModalCard
              title={"IS ACTIVE"}
              data={isTruckActive.toString()}
              unit={""}
            />
            <TruckModalCard
              title={"TEMPERATURE"}
              data={cargoTemperature}
              unit={"celsius"}
            />
            <TruckModalCard
              title={"HUMIDITY"}
              data={cargoHumidity}
              unit={"f"}
            /> */}
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
        title={taskName}
        open={openTaskModal}
        onOk={() => {
          setOpenTaskModal(false);
        }}
        onCancel={() => {
          setOpenTaskModal(false);
        }}
        width={1000}
      >
        <h1>
          <span style={{ fontWeight: "bold", fontSize: "20px" }}>
            INFORMATION:{" "}
          </span>
        </h1>
        <div>
          <span style={{ fontWeight: "bold", fontSize: "15px" }}>NAME: </span>{" "}
          {taskName}
        </div>
        <div>
          <span style={{ fontWeight: "bold", fontSize: "15px" }}>ID: </span>{" "}
          {taskId}
        </div>
        <div>
          <span style={{ fontWeight: "bold", fontSize: "15px" }}>STATUS: </span>{" "}
          {taskStatus}
        </div>
        <div>
          <span style={{ fontWeight: "bold", fontSize: "20px" }}>DATA: </span>{" "}
        </div>
        <div>
          <span style={{ fontWeight: "bold", fontSize: "15px" }}>
            IOT DEVICE ID:{" "}
          </span>{" "}
          {taskIotId}
        </div>
        <div>
          <span style={{ fontWeight: "bold", fontSize: "15px" }}>DATA: </span>{" "}
          {taskIotType == SUPABASE_TABLE.IOT_DEVICE_TYPE.MILK_MONITOR ? (
            <div>
              <TruckModalCard
                title={"MILK YIELD TOTAL"}
                data={taskIotData.milk_yield_total}
                unit={"litres"}
              />
              <TruckModalCard
                title={"MILK CONDUCTIVITY"}
                data={taskIotData.milk_conductivity}
                unit={"litres"}
              />
              <TruckModalCard
                title={"MILK TEMPERATURE"}
                data={taskIotData.milk_temperature}
                unit={"C"}
              />
              <TruckModalCard
                title={"FAT CONTENT"}
                data={taskIotData.fat_content}
                unit={"C"}
              />
              <TruckModalCard
                title={"PROTEIN CONTENT"}
                data={taskIotData.protein_content}
                unit={"C"}
              />
              <TruckModalCard
                title={"PRODUCT DATE"}
                data={taskIotData.product_date}
                unit={""}
              />
            </div>
          ) : taskIotType == SUPABASE_TABLE.IOT_DEVICE_TYPE.PACKAGE_MONITOR ? (
            <div>
              <TruckModalCard
                title={"PACKAGE COUNT TOTAL"}
                data={taskIotData.package_count_total}
                unit={"box"}
              />
              <TruckModalCard
                title={"FAILED PACKAGE"}
                data={taskIotData.failed_package}
                unit={"box"}
              />
              <TruckModalCard
                title={"DELIVERY DATE"}
                data={taskIotData.delivery_date}
                unit={""}
              />
            </div>
          ) : taskIotType ==
            SUPABASE_TABLE.IOT_DEVICE_TYPE.WAREHOUSE_MONITOR ? (
            <div>
              <TruckModalCard
                title={"TEMPERATURE"}
                data={taskIotData.temperature}
                unit={"C"}
              />
              <TruckModalCard
                title={"HUMIDITY"}
                data={taskIotData.humidity}
                unit={"litres"}
              />
              <TruckModalCard
                title={"INVENTORY COUNT"}
                data={taskIotData.inventory_count}
                unit={"C"}
              />
              <TruckModalCard
                title={"TIME STAMP"}
                data={taskIotData.time_stamp}
                unit={""}
              />
            </div>
          ) : taskIotType == SUPABASE_TABLE.IOT_DEVICE_TYPE.SALE_MONITOR ? (
            <div>
              <TruckModalCard
                title={"ITEM"}
                data={taskIotData.item}
                unit={""}
              />
              <TruckModalCard
                title={"PRICE"}
                data={taskIotData.price}
                unit={"dollars"}
              />
              <TruckModalCard
                title={"COUNT"}
                data={taskIotData.count}
                unit={"C"}
              />
              <TruckModalCard
                title={"DISCOUNT"}
                data={taskIotData.discount}
                unit={"C"}
              />
              <TruckModalCard
                title={"TIME STAMP"}
                data={taskIotData.time_stamp}
                unit={""}
              />
            </div>
          ) : taskIotType == SUPABASE_TABLE.IOT_DEVICE_TYPE.PRODUCE_MONITOR ? (
            <div>
              <TruckModalCard
                title={"PRODUCT"}
                data={taskIotData.product}
                unit={""}
              />
              <TruckModalCard
                title={"PRODUCT ID"}
                data={taskIotData.product_id}
                unit={"C"}
              />
              <TruckModalCard
                title={"COUNT"}
                data={taskIotData.count}
                unit={"C"}
              />
              <TruckModalCard
                title={"PRODUCTION RATE"}
                data={taskIotData.poduction_rate}
                unit={"C"}
              />
              <TruckModalCard
                title={"TIME STAMP"}
                data={taskIotData.time_stamp}
                unit={""}
              />
            </div>
          ) : taskIotType == SUPABASE_TABLE.IOT_DEVICE_TYPE.SHIP_MONITOR ? (
            <div>
              <TruckModalCard
                title={"TRANSPORT ID"}
                data={taskIotData.transport_id}
                unit={""}
              />
              <TruckModalCard
                title={"START DATE"}
                data={taskIotData.start_date}
                unit={""}
              />
            </div>
          ) : null}
        </div>
      </Modal>
      {/* </Col>
      </Row> */}
      {/* <Row>
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
      </Row> */}
      <Notification trigger={trigger} />
    </div>
  );
}

export default RealtimeMap;
