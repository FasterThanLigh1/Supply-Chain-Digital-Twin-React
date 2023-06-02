const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");

const PORT = 8080;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "persons",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

/* var thisId = -1;
const db = mysql.createConnection({
  host: "localhost",
  uesr: "root",
  password: "password",
  database: "test_data",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
  let d = new Date();
  let id = d.getTime();
  var sql = `CREATE TABLE i${id} (name VARCHAR(255), number INT(10))`;
  //var sql = "CREATE TABLE i (name VARCHAR(255), address VARCHAR(255))";
  db.query(sql, function (err, result) {
    if (err) throw err;
    thisId = id;
    console.log("Table created");
  });
});

app.get("/get", (req, res) => {
  /* res.status(200).send({
    number: 10,
    name: "js",
  }); 
  const sqlInsert = "INSERT INTO users (name, number) VALUES ('F', 0)";
  db.query(sqlInsert, (err, result) => {
    res.send("Push data");
  });
  //res.send("Hello world");
});

app.post("/insert", (req, res) => {
  const supplier = req.body.supplier;
  const manufacturer = req.body.manufacturer;
  const distributor = req.body.distributor;
  const customer = req.body.customer;
  const date = req.body.date;
  const sqlInsert = `INSERT INTO stock (manufacturer, supplier, distributor, customer, dayOrder) VALUES (?,?,?,?,?)`;
  db.query(
    sqlInsert,
    [manufacturer, supplier, distributor, customer, date],
    (err, result) => {
      res.send("Push data");
      if (err) {
        console.log("Error inserting data: " + err);
      }
    }
  );
}); */
app.get("/", (req, res) => {
  const sqlGet = "SELECT * FROM new_schema.persons;";
  db.query(sqlGet);
  
  res.send("hello world bitch");
});

app.listen(PORT, () => {
  console.log(`listening on port http://localhost:${PORT}`);
});
