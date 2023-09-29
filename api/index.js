/* const dayjs = require("dayjs");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");

const PORT = 8080;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Chip1018!",
  database: "simulation_data",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

app.post("/new_simulation", (req, res) => {
  let data = req.body;
  console.log(data);
  //let dataJson = JSON.parse(data.id);
  console.log(data.id);
  const sqlCreate = `insert into Simulation (SimulationKey,Date,EndDate) values ('${data.id}', STR_TO_DATE('${data.date}','%Y-%m-%dT%T.%fZ'), STR_TO_DATE('${data.endDate}','%Y-%m-%dT%T.%fZ'));`;
  db.query(sqlCreate, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/new_participants", (req, res) => {
  let data = req.body;
  console.log(data);
  const simId = data.simId;
  const participants = data.participants;
  console.log(participants);
  const values = participants
    .map((p) => `('${p.id}', '${simId}','${p.name}')`)
    .join(",");
  const sqlCreate = `insert into Participants (ParticipantKey, SimulationKey, Name) values ${values};`;
  db.query(sqlCreate, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
  /* const curDate = dayjs();
  const simId =
    "simulation_" +
    curDate.date().toString() +
    "_" +
    curDate.month().toString() +
    "_" +
    curDate.year().toString() +
    "_" +
    curDate.hour().toString() +
    "" +
    curDate.minute().toString() +
    "" +
    curDate.second().toString();
  const values = participants
    .map((p) => `('${p.id}', '${simId}','${p.name}')`)
    .join(",");
  const sqlCreate = `insert into Participants (ParticipantKey, SimulationKey, Name) values ${values};`;
  db.query(sqlCreate, (err, result) => {
    if (err) throw err;
    res.send(result);
  }); 
});

app.post("/insert_statistic", (req, res) => {
  const body = req.body;
  console.log(body);
  /* const values = body
    .map(
      (p) =>
        `('${p.participantKey}', '${p.simulationKey}','${p.data.totalInventory}', '${p.data.otalBackorder}', CURDATE())`
    )
    .join(","); 
  const values = `('${body.participantKey}', '${body.simulationKey}','${body.data.totalInventory}', '${body.data.totalBackOrder}', STR_TO_DATE('${body.date}','%Y-%m-%dT%T.%fZ'))`;
  const sqlCreate = `insert into Statistic (ParticipantKey, SimulationKey, TotalInventory, TotalBackorder, Date) values ${values};`;
  db.query(sqlCreate, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
  /* const curDate = dayjs();
  const simId =
    "simulation_" +
    curDate.date().toString() +
    "_" +
    curDate.month().toString() +
    "_" +
    curDate.year().toString() +
    "_" +
    curDate.hour().toString() +
    "" +
    curDate.minute().toString() +
    "" +
    curDate.second().toString();
  const values = statistic
    .map(
      (p) =>
        `('${p.ParticipantKey}', '${p.SimulationKey}','${p.TotalInventory}', '${p.TotalBackorder}', CURDATE())`
    )
    .join(",");
  const sqlCreate = `insert into Statistic (ParticipantKey, SimulationKey, TotalInventory, TotalBackorder, Date) values ${values};`;
  db.query(sqlCreate, (err, result) => {
    if (err) throw err;
    res.send(result);
  }); 
});

app.get("/get_simulation_list", (req, res) => {
  const sqlGet = "select * from simulation;";
  db.query(sqlGet, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/get_participants/:id", (req, res) => {
  const id = req.params.id;
  const sqlGet = `select participants.ParticipantKey, participants.Name, participants.SimulationKey
from participants inner join simulation on participants.SimulationKey = simulation.SimulationKey
where simulation.SimulationKey = '${id}'`;
  db.query(sqlGet, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/get_statistic/:id/:participant", (req, res) => {
  const id = req.params.id;
  const participant = req.params.participant;
  console.log(id);
  const sqlGet = `select statistic.UniqueKey, statistic.ParticipantKey, statistic.TotalInventory,
statistic.TotalBackorder, statistic.Date, statistic.SimulationKey, participants.name
from statistic inner join simulation on
statistic.SimulationKey = simulation.SimulationKey inner join participants
on statistic.SimulationKey = participants.SimulationKey and
statistic.ParticipantKey = participants.ParticipantKey where participants.SimulationKey = '${id}'
and participants.ParticipantKey = '${participant}';`;
  db.query(sqlGet, (err, result) => {
    if (err) throw err;
    res.send(result);
  });

  //res.send(`<h1>${req.params.id}</h1>`);
});

app.listen(PORT, () => {
  console.log(`listening on port http://localhost:${PORT}`);
}); */
const { Client } = require("azure-iot-device");
const Mqtt = require("azure-iot-device-mqtt").Mqtt;
const { Message } = require("azure-iot-device");
const { EventHubConsumerClient } = require("@azure/event-hubs");
const { supabase } = require("./config/supabaseClient.js");

const eventHubConnectionString = `Endpoint=sb://ihsuprodsgres025dednamespace.servicebus.windows.net/;SharedAccessKeyName=iothubowner;SharedAccessKey=MVMEf3cd4a8kQFzWh6MmT+DKsq1F78ZDXbpDBvec2Ss=;EntityPath=iothub-ehub-demoiot-25131092-2791705379`;

// Replace with your connection string and device ID
const connectionString =
  "HostName=DemoIOT.azure-devices.net;DeviceId=rasberry_pi;SharedAccessKey=3Q6ogP2mCwXgc4XhMpNEqnmavug/zvkVKfRlMYgrq6o=";
const deviceId =
  "HostName=DemoIOT.azure-devices.net;DeviceId=rasberry_pi;SharedAccessKey=3Q6ogP2mCwXgc4XhMpNEqnmavug/zvkVKfRlMYgrq6o=";
// Create a new IoT Hub client
const client = Client.fromConnectionString(connectionString, Mqtt);

var printError = function (err) {
  console.log(err.message);
};

// Display the message content - telemetry and properties.
// - Telemetry is sent in the message body
// - The device can add arbitrary properties to the message
// - IoT Hub adds system properties, such as Device Id, to the message.
var printMessages = function (messages) {
  for (const message of messages) {
    console.log("Telemetry received: ");

    // if (message.body.type == "truck") {
    //   console.log("Truck received");
    //   api_updateVehicleById(message.body);
    // }
    // if (message.body.type == "milk-monitor") {
    //   console.log("Milk monitor resceive", message.body.data.milk_temperature);
    //   api_updateLiveTelemetry(message.body);
    //   if (message.body.data.milk_temperature < 20) {
    //     console.log("Print warning");
    //     api_insertWarning(message.body, "temperature drop");
    //   }
    // }
    // if (message.body.type == "sales-monitor") {
    //   console.log("Sales monitor resceive");
    //   api_updateLiveTelemetry(message.body);
    // }

    if (message.body.id == "sales_record") {
      api_insertSales(message.body);
    }
    if (message.body.id == "truck_1") {
      api_updateVehicleById(message.body);
    }

    console.log(message.body);
    api_updateLiveTelemetry(message.body);
    // const buffer = Buffer.from(message.body, "hex");
    // const mesg = buffer.toString("utf-8");
    // console.log(mesg);
    // const jsonObject = JSON.parse(mesg);
    // console.log(jsonObject.data);
    //console.log(message.body.telemetry.id);
    // console.log("Properties (set by device): ");
    // console.log(JSON.stringify(message.properties));
    /*console.log("Temperatures: ", message.properties.sensor1);
    console.log("Humidity:", message.properties.sensor2);
    console.log("System properties (set by IoT Hub): ");
    console.log(JSON.stringify(message.systemProperties)); */

    //api_updateLiveTelemetry(message.body);

    console.log(" ");
  }
};

async function api_insertWarning(data, description) {
  const { error } = await supabase.from("warning").insert({
    description: description,
    is_resolved: false,
    participant_id: "dtmi:dtdl:Supplier;1",
    iot_device_id: data.data.id,
    data: data,
  });
  if (error) {
    console.log("Error inserting warning", error);
  }
}

async function api_insertSales(data) {
  console.log("Updated data: ", data);
  let participant_id = null;
  if (data.id == "sales_record") {
    participant_id = "dtmi:dtdl:Bakery1;1";
  } else {
    participant_id = "dtmi:dtdl:Bakery2;1";
  }
  const { error } = await supabase.from("sales").insert({
    article: data.data.article,
    quantity: data.data.quantity,
    unit_price: data.data.unit_price,
    ticket_number: data.data.ticket_number,
    participant_id: participant_id,
  });
  if (error) {
    console.log(error);
  }
}

async function api_updateLiveTelemetry(data) {
  console.log("Updated data: ", data);
  let status = "OK";
  let message = null;
  if (data.id == "machine_1") {
    if (data.data.oven_t < 350) {
      status = "ERROR";
      message = "BAKERY 1: MACHINE 1: oven temperature low";
    }
  }
  if (data.id == "truck_1") {
    if (data.data.temperature > 100) {
      console.log("st wrong");
      status = "ERROR";
      message = "TRUCK 1: temperature hight";
    }
  }
  const { error } = await supabase
    .from("iot_devices")
    .update({
      last_updated: data.data.date_time,
      data: data,
      status: status,
      error_message: message,
    })
    .eq("id", data.id);
  if (error) {
    console.log(error);
  }
}

async function api_updateVehicleById(data) {
  console.log("Truck: ", data);
  const cargo = {
    flour: 1000,
    sugar: 1000,
    eggs: 100,
    butter: 2000,
    milk: 2000,
    salt: 1000,
  };
  const { error } = await supabase
    .from("vehicle")
    .update({
      longitude: data.data.latitude,
      latitude: data.data.longitude,
      current_destination: data.data.destination,
      temperature: data.data.temperature,
      humidity: data.data.humidity,
      shock_level: data.data.shock_level,
      light_exposure: data.data.light_exposure,
      door_status: data.data.door_status,
      battery_level: data.data.battery_level,
      connectivity: data.data.connectivity,
      cargo: cargo,
    })
    .eq("name", data.id);
  if (error) {
    console.log(error);
  }
}

// Open a connection to the IoT Hub
client.open((err) => {
  if (err) {
    console.error("Error opening IoT Hub connection:", err);
  } else {
    console.log("IoT Hub connection opened");
    // Listen for incoming messages from the device
    client.on("message", (msg) => {
      console.log("Received message from device:", msg.getData().toString());
    });
  }
});

async function main() {
  console.log("IoT Hub Quickstarts - Read device to cloud messages.");
  // If using websockets, uncomment the webSocketOptions below
  // If using proxy, then set `webSocketConstructorOptions` to { agent: proxyAgent }
  // You can also use the `retryOptions` in the client options to configure the retry policy
  const clientOptions = {
    // webSocketOptions: {
    //   webSocket: WebSocket,
    //   webSocketConstructorOptions: {}
    // }
  };

  // Create the client to connect to the default consumer group of the Event Hub
  const consumerClient = new EventHubConsumerClient(
    "$Default",
    eventHubConnectionString,
    clientOptions
  );

  // Subscribe to messages from all partitions as below
  // To subscribe to messages from a single partition, use the overload of the same method.
  consumerClient.subscribe({
    processEvents: printMessages,
    processError: printError,
  });
}

main().catch((error) => {
  console.error("Error running sample:", error);
});
