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
  let error_state = null;
  if (data.id == "machine_1") {
    if (check(data.data.oven_t, 0, 1000)) {
      status = "ERROR";
      message = `BAKERY 1: MACHINE 1: oven temperature out of bound: ${data.data.oven_t}`;
      error_state = data.state;
    }
    if (check(data.data.proofing_t, 0, 1000)) {
      status = "ERROR";
      message = `BAKERY 1: MACHINE 1: proofing temperature out of bound: ${data.data.proofing_t}`;
      error_state = data.state;
    }
    if (check(data.data.ambient_t, 0, 1000)) {
      status = "ERROR";
      message = `BAKERY 1: MACHINE 1: ambient temperature out of bound: ${data.data.ambient_t}`;
      error_state = data.state;
    }
    if (check(data.data.motor_speed, 0, 3000)) {
      status = "ERROR";
      message = `BAKERY 1: MACHINE 1: motor speed out of bound: ${data.data.motor_speed}`;
      error_state = data.state;
    }
    if (check(data.data.power_consumption, 300, 1000)) {
      console.log("ERROR: power consumption out of bound");
      status = "ERROR";
      message = `BAKERY 1: MACHINE 1: power consumption out of bound: ${data.data.power_consumption}`;
      error_state = data.state;
    }
    if (check(data.data.proof_time, 0, 1000)) {
      status = "ERROR";
      message = `BAKERY 1: MACHINE 1: proofing time out of bound: ${data.data.proof_time}`;
      error_state = data.state;
    }
    if (check(data.data.baking_time, 0, 1000)) {
      status = "ERROR";
      message = `BAKERY 1: MACHINE 1: bakimg time out of bound: ${data.data.baking_time}`;
      error_state = data.state;
    }
    if (check(data.data.baking_temperature, 0, 1000)) {
      status = "ERROR";
      message = `BAKERY 1: MACHINE 1: baking temperature out of bound: ${data.data.baking_temperature}`;
      error_state = data.state;
    }
  }
  if (data.id == "truck_1") {
    if (data.data.temperature > 100) {
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
      error_state: error_state,
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

const check = (val, min, max) => {
  return val < min || val > max;
};

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
