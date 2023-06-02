const dayjs = require("dayjs");
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
  }); */
});

app.post("/insert_statistic", (req, res) => {
  const body = req.body;
  console.log(body);
  /* const values = body
    .map(
      (p) =>
        `('${p.participantKey}', '${p.simulationKey}','${p.data.totalInventory}', '${p.data.otalBackorder}', CURDATE())`
    )
    .join(","); */
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
  }); */
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
});
