const dayjs = require("dayjs");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");

const PORT = 8080;

const participants = [
  {
    id: "101",
    name: "supplier",
  },
  {
    id: "102",
    name: "distributor",
  },
  {
    id: "103",
    name: "customer",
  },
  {
    id: "104",
    name: "customer2",
  },
];

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "simulation_data",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

app.post("/new_simulation", (req, res) => {
  const curDate = dayjs();
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
  const sqlCreate = `insert into Simulation (UniqueKey, Date) values ('${simId}', CURDATE());`;
  db.query(sqlCreate, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/new_participants", (req, res) => {
  const curDate = dayjs();
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
  const curDate = dayjs();
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
  const sqlCreate = `insert into Statistic (ParticipantKey, SimulationKey, TotalInventory, TotalBackorder, Date) values ${values};`;
  db.query(sqlCreate, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/create_participants_table", (req, res) => {
  const curDate = dayjs();
  const tableId =
    "participant_" +
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
  const sqlCreate = `CREATE TABLE ${tableId} (UniqueKey int NOT NULL PRIMARY KEY, Name varchar(255));`;
  db.query(sqlCreate, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/list_table", (req, res) => {
  const sqlGet = "SHOW TABLES;";
  db.query(sqlGet, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/get", (req, res) => {
  //res.send("hello world bitch");
  const sqlGet = "select * from data";
  db.query(sqlGet, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/post", (req, res) => {
  const data = req.body.data;
  console.log(data);
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i].quantity;
  }
  console.log(sum);
  /* const sqlInsert = "insert into data(stock) values (?)";
  db.query(sqlInsert, [data], (err, result) => {}); */
});

app.get("/getList", (req, res) => {
  const sqlGet =
    "select statistic.UniqueKey, statistic.TotalInventory, statistic.Date from statistic inner join participant on statistic.ParticipantKey = participant.UniqueKey where participant.UniqueKey=102;";
  db.query(sqlGet, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.get("/test", (req, res) => {
  const values = participants.map((p) => `(${p.id},"${p.name}")`).join(",");
  const sqlGet = `insert into Participant (UniqueKey, Name) values ${values}`;
  db.query(sqlGet, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.listen(PORT, () => {
  console.log(`listening on port http://localhost:${PORT}`);
});
