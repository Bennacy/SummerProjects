const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql');
const app = express()
const port = 3000
let timeScale= 1 //speed(in seconds) at which things occur=> 1: one second; 60: one minute


app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

//creates instance to make connection to the sql database
const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "summer",
  //WORKING WITH MAMP ON MAC!!!
  //socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
});


db.connect(function(err) {
  if (err) throw err;
  console.log("Connected to DB!");
});	




app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
  }