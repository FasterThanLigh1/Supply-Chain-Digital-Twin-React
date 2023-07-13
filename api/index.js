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

// If you have access to the Event Hub-compatible connection string from the Azure portal, then
// you can skip the Azure CLI commands above, and assign the connection string directly here.
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

    if (message.body.type == "truck") {
      console.log("Truck received");
      console.log(message.body);
      api_updateVehicleById(message.body);
    }
    if (message.body.type == "milk_monitor") {
      console.log("Milk monitor resceive");
      console.log(message.body);
    }
    //console.log(message.body.telemetry.id);
    // console.log("Properties (set by device): ");
    // console.log(JSON.stringify(message.properties));
    /*console.log("Temperatures: ", message.properties.sensor1);
    console.log("Humidity:", message.properties.sensor2);
    console.log("System properties (set by IoT Hub): ");
    console.log(JSON.stringify(message.systemProperties)); */

    //api_updateLiveTelemetry(message.body);

    console.log("");
  }
};

async function api_updateLiveTelemetry(data) {
  const { error } = await supabase
    .from("iot_devices")
    .update({
      data: data,
    })
    .eq("id", "rasperry_1");
}

async function api_updateVehicleById(data) {
  const { error } = await supabase
    .from("vehicle")
    .update({
      longitude: data.longitude,
      latitude: data.latitude,
      temperature: data.temperature,
      humidity: data.humidity,
      cargo_weight: data.cargo_weight,
      velocity: data.speed,
    })
    .eq("id", data.id);
}

// Open a connection to the IoT Hub
client.open((err) => {
  if (err) {
    console.error("Error opening IoT Hub connection:", err);
  } else {
    console.log("IoT Hub connection opened");

    // Send a message to the IoT device
    /* const message = new Message(
      JSON.stringify({
        data: "Hello from the cloud!",
      })
    );
    console.log("Sending message:", message.getData());
    client.sendEvent(message, (err, res) => {
      if (err) {
        console.error("Error sending message:", err);
      } else {
        console.log(
          "Message sent to IoT device with status:",
          res.constructor.name
        );
      }
      client.close();
    }); */

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
