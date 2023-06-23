import React, { useEffect, useState, useRef, Children } from "react";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { SUPABASE_TABLE, mapaboxAcessToken } from "../constants";
import { Button, Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { selectChildTwinArray, setChildTwinArray } from "../features/dtdlSlice";
import _ from "lodash";
import supabase from "../config/supabaseClient";

mapboxgl.accessToken = mapaboxAcessToken;

function RealtimeMap() {
  const thisChildTwinArray = useSelector(selectChildTwinArray);
  const mapContainer = useRef(null);
  const dispatch = useDispatch();
  const map = useRef(null);
  const [participantList, setParticipantList] = useState([]);
  const [fetchError, setfetchError] = useState(null);
  const [zoom, setZoom] = useState(5);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  //SUPABASE FETCH
  useEffect(() => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: SUPABASE_TABLE.PARTICIPANT_LIST,
        },
        (payload) => console.log("Changes: ", payload)
      )
      .subscribe();
    fetchParticipantList();
  }, []);

  //FECTH PARTICIPANT LIST
  const fetchParticipantList = async () => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE.PARTICIPANT_LIST)
      .select();
    if (error) {
      setfetchError(error);
      console.log(error);
    } else {
      setParticipantList(data);
      console.log(data);
      setfetchError(null);
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
    /* for (let i = 0; i < graph.getLength(); i++) {
      //console.log(graph);
      initMarker(graph.AdjList[i].data);
    } */
    map.current.on("click", (event) => {
      //console.log("click");
    });
    //CURRENT_MAP.current = map.current;
    /* initMarker("abc", lng, lat);
    initMarker("xyz", lng + 1, lat - 1); */
  }, []);

  //On New DTDL Added
  useEffect(() => {
    console.log("Update");
    if (thisChildTwinArray.length < 1) return;
    thisChildTwinArray.forEach((childTwin) => {
      console.log(childTwin.schema["@id"]);
      for (let i = 0; i < participantList.length; i++) {
        if (participantList[i].id == childTwin.schema["@id"]) {
          initMarker(
            participantList[i].id,
            participantList[i].longtitude,
            participantList[i].latitude
          );
        }
      }
    });
  }, [thisChildTwinArray]);

  const initMarker = (id, lng, lat) => {
    const el = document.createElement("div");
    el.setAttribute("id", id);
    el.className = "marker-supplier";
    el.addEventListener("click", (e) => {
      showModal();
      alert(el.id);
    });

    /* var popup = new mapboxgl.Popup()
      .setHTML(`<strong>Test</strong>`)
      .addTo(map.current); */

    const temp = new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .addTo(map.current);
    /* .setPopup(popup); */
  };

  const updateChildTwinArray = (id, data) => {
    const tempChildTwinArray = _.cloneDeep(thisChildTwinArray);
    for (let i = 0; i < tempChildTwinArray.length; i++) {
      if (tempChildTwinArray[i].schema["@id"] == id) {
        console.log("Found: ", tempChildTwinArray[i]);
        tempChildTwinArray[i].data.Id = data.Id;
        tempChildTwinArray[i].data.location.longtitude =
          data.location.longtitude;
        tempChildTwinArray[i].data.location.latitude = data.location.latitude;
      }
    }
    dispatch(setChildTwinArray(tempChildTwinArray));
  };

  return (
    <div>
      <div ref={mapContainer} className="map-container"></div>
      <Modal
        title="Basic Modal"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <Button
          onClick={() => {
            updateChildTwinArray(
              thisChildTwinArray[thisChildTwinArray.length - 1].schema["@id"],
              {
                Id: "123",
                location: {
                  longtitude: -71.9,
                  latitude: 43.35,
                },
              }
            );
          }}
        >
          Test
        </Button>
      </Modal>
    </div>
  );
}

export default RealtimeMap;
