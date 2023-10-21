/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, Children } from "react";
import mapboxgl from "mapbox-gl";
import {
  SUPABASE_DATA,
  DTDL_MARKER_TYPE,
  SUPABASE_TABLE,
  mapaboxAcessToken,
  MESSAGE_TYPE,
} from "../constants";
import {
  Modal,
  Space,
  Typography,
  Col,
  Row,
  Table,
  Tag,
  Card,
  List,
  Skeleton,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import supabase from "../config/supabaseClient";
import { getRoute, openNotificationWithIcon } from "../constants/callback";
import Notification from "./notification";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import ReactBpmn from "react-bpmn";
import { selectState, setState } from "../features/stateSlice";
import AttributeCard from "./attributeCard";
import { FaBeer, FaTemperatureHigh } from "react-icons/fa";
import { AiOutlineEllipsis } from "react-icons/ai";
import { BsSpeedometer2 } from "react-icons/bs";
import { PiEngineThin, PiTimer } from "react-icons/pi";
import { BiTime } from "react-icons/bi";
import MyReactBpmn from "./myBpmnReact";

mapboxgl.accessToken = mapaboxAcessToken;

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
  const organizationState = useSelector(selectState);

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

  const [truckData, setTruckData] = useState([]);

  //SELECT PARTICIAPANT MODAL ATTRIBUTE
  const [modalName, setModalName] = useState(null);
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

  //UI ATTRIBUTE
  const [selectDeviceId, setSelectDeviceId] = useState(null);
  const [tabContent, setTabContent] = useState(null);
  const [localeTime, setLocaleTime] = useState(new Date().toLocaleString());

  //BPMN UI ATTRIBUTE
  const [participantsIoTDevices, setParticipantsIoTDevices] = useState([]);
  const [bpmn, setBpmn] = useState(null);
  const [machineState, setMachineState] = useState(null);
  const [errorState, setErrorState] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    let secTimer = setInterval(() => {
      setLocaleTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(secTimer);
  }, []);

  //On select cargo
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
      console.log(api_participantList.find((p) => p.id == id));
      setBpmn(api_participantList.find((p) => p.id == id).bpmn);
    } else if (id == "dtmi:dtdl:Material1;1" || id == "dtmi:dtdl:Material2;1") {
      showStoreModal(id);
    }
  };

  useEffect(() => {
    const temp = participantsIoTDevices.filter((e) =>
      e.id.startsWith("machine_")
    );
    console.log("New machine data: ", temp);
    if (temp.length > 0) {
      setMachineState(temp[0].data.data.state);
    }

    setMachineAttributes(temp);
  }, [participantsIoTDevices]);

  useEffect(() => {
    console.log("MACHIN STATE: ", machineState);
  }, [machineState]);

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
        }
        //ORGANIZATION STATE CHANGE
        else if (payload.table == SUPABASE_TABLE.ORGANIZATION_LIST) {
          console.log(payload.new.state);
          dispatch(setState(payload.new.state));
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

      setfetchError(null);
      api_fetchIoTDataById(data[0].iot_device_id);
    }
  };

  useEffect(() => {
    console.log("Truck attribute: ", truckAttributeData);
  }, [truckAttributeData]);

  //FETCH PROCESS
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
      setfetchError(null);
      //fecth
      api_fecthTransportData();
    }
  };

  const api_fetchParticipantById = async (id) => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.PARTICIPANT_LIST)
      .select()
      .eq("id", id);
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      api_setParticipantList(data);
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
      }
    }
    const geoJsonPlaces = createGeoJsonData(api_participantList);
    setGeojsonPlaces(geoJsonPlaces);
    SUPABASE_DATA.ACTIVE_LIVE_PARTICIPANTS = api_participantList;
  }, [api_participantList]);

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

  return (
    <div className="h-screen">
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
                  <Card
                    title={
                      e.id == "machine_1" ? (
                        <div>Commercial baking machine</div>
                      ) : (
                        <div>Cash register</div>
                      )
                    }
                    bordered={false}
                  >
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
            {bpmn ? (
              <MyReactBpmn
                diagramXML={bpmn}
                onShown={() => {
                  console.log("show");
                }}
                onLoading={() => {
                  console.log("Loading");
                }}
                onError={() => {
                  console.log("error");
                }}
                style={{ height: "100%" }}
                state={machineState}
              />
            ) : (
              <Skeleton />
            )}
          </div>
          <div className="font-bold mt-4">MACHINE ATTRIBUTE</div>
          <Row gutter={16}>
            <Col span={8}>
              <AttributeCard
                title="State"
                content={
                  machineAttributes.length > 0
                    ? machineAttributes[0].data.data.state
                    : null
                }
                icon={AiOutlineEllipsis}
              />
            </Col>
            <Col span={8}>
              <AttributeCard
                title="Oven temperature"
                content={
                  machineAttributes.length > 0
                    ? machineAttributes[0].data.data.oven_t
                    : null
                }
                icon={FaTemperatureHigh}
                unit="celsius"
              />
            </Col>
            <Col span={8}>
              <AttributeCard
                title="Proofing temperature"
                content={
                  machineAttributes.length > 0
                    ? machineAttributes[0].data.data.proofing_t
                    : null
                }
                icon={FaTemperatureHigh}
                unit="celsius"
              />
            </Col>
            <Col span={8}>
              <AttributeCard
                title="Ambient temperature"
                content={
                  machineAttributes.length > 0
                    ? machineAttributes[0].data.data.ambient_t
                    : null
                }
                icon={FaTemperatureHigh}
                unit="celsius"
              />
            </Col>
            <Col span={8}>
              <AttributeCard
                title="Motor speed"
                content={
                  machineAttributes.length > 0
                    ? machineAttributes[0].data.data.motor_speed
                    : null
                }
                icon={BsSpeedometer2}
                unit="rpm"
              />
            </Col>
            <Col span={8}>
              <AttributeCard
                title="Power consumption"
                content={
                  machineAttributes.length > 0
                    ? machineAttributes[0].data.data.power_consumption
                    : null
                }
                icon={PiEngineThin}
                unit="Watt"
              />
            </Col>
            <Col span={8}>
              <AttributeCard
                title="Baking time"
                content={
                  machineAttributes.length > 0
                    ? machineAttributes[0].data.data.baking_time
                    : null
                }
                icon={PiTimer}
                unit="minutes"
              />
            </Col>
            <Col span={8}>
              <AttributeCard
                title="Baking temperature"
                content={
                  machineAttributes.length > 0
                    ? machineAttributes[0].data.data.baking_temperature
                    : null
                }
                icon={FaTemperatureHigh}
                unit="celsius"
              />
            </Col>
            <Col span={8}>
              <AttributeCard
                title="Proof time"
                content={
                  machineAttributes.length > 0
                    ? machineAttributes[0].data.data.proof_time
                    : null
                }
                icon={PiTimer}
                unit="minutes"
              />
            </Col>
          </Row>
          {/* <List
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
          </List> */}
          <div className="font-bold mt-4">SALES</div>
          <Table columns={salesColumns} dataSource={salesData} />
          <div className="font-bold mt-4">INVENTORY</div>
          <Table columns={inventoryColumns} dataSource={inventory} />
        </h1>
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
      <Notification trigger={trigger} />
    </div>
  );
}

export default RealtimeMap;
