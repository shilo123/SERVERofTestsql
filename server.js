const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
let mongo = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const bodyParser = require("body-parser");
const fs = require("fs");
const axios = require("axios");
app.use(bodyParser.json());
app.use(cors());
const sql = require("mssql");

const config = {
  user: "sqlserver",
  password: "Shilo#123",
  server: "34.41.107.10",
  database: "newDB",
  options: {
    trustServerCertificate: true,
  },
};

async function SQL(query) {
  try {
    await sql.connect(config);
    const result = await sql.query(query);
    return result.recordset;
  } catch (err) {
    console.error("SQL error:", err);
    throw err;
  } finally {
    await sql.close();
  }
}

async function nisuySQL(query) {
  try {
    const res = await SQL(query);
    console.log(res);
  } catch (err) {
    console.error("Error running query:", err);
  }
}

// var q = `
// SELECT COUNT(ovdim.Name) AS TOTAL,Department.DepartmentName, Managers.Name AS ManagerName
// FROM ovdim
// JOIN Department ON ovdim.DepartmentID = Department.DepartmentID
// LEFT JOIN ovdim AS Managers ON Department.ManagerID = Managers.EmployeeID
// GROUP BY Department.DepartmentName, Managers.Name
// ORDER BY Department.DepartmentName;
// `;

// let q = `SELECT COUNT(ovdim.Name) AS TOTAL,Department.DepartmentName, Managers.Name AS ManagerName
// FROM ovdim
// JOIN Department  ON ovdim.DepartmentID = Department.DepartmentID
// LEFT JOIN ovdim AS Managers ON Department.ManagerID = Managers.EmployeeID
// GROUP BY Department.DepartmentName,Managers.Name  ORDER BY TOTAL DESC
// `;

// nisuySQL(q);

app.get("/", async (req, res) => {
  try {
    const q = `SELECT ovdim.EmployeeID ,ovdim.Name,ovdim.Position,Department.DepartmentName  FROM
    ovdim JOIN Department ON ovdim.DepartmentID = Department.DepartmentID ORDER BY Department.DepartmentName
    `;
    const result = await SQL(q);
    res.json(result);
  } catch (error) {
    res.json("ERROR");
  }
});
app.get("/Getnetunim", async (req, res) => {
  let q = `SELECT COUNT(ovdim.Name) AS TOTAL,Department.DepartmentName, Managers.Name AS Manger
  FROM ovdim 
  JOIN Department  ON ovdim.DepartmentID = Department.DepartmentID 
  LEFT JOIN ovdim AS Managers ON Department.ManagerID = Managers.EmployeeID
  GROUP BY Department.DepartmentName,Managers.Name  ORDER BY TOTAL DESC
  `;

  let result = await SQL(q);
  console.log(result);
  res.json(result);
});
app.get("/GetD", async (req, res) => {
  const q = `SELECT DISTINCT DepartmentName FROM Department`;
  let result = await SQL(q);
  result = result.map((e) => {
    return (e = e.DepartmentName);
  });
  res.json(result);
});
app.post("/AddOved", async (req, res) => {
  console.log(req.body);
  try {
    const q = `SELECT * FROM Department WHERE DepartmentName = '${req.body.Department}'`;
    let D_id = await SQL(q);
    D_id = D_id[0].DepartmentID;
    console.log(D_id);
    const query = `INSERT INTO ovdim (Name,DepartmentID,Position) VALUES ('${req.body.shem}',${D_id},'${req.body.position}')`;
    let result = await SQL(query);
    console.log(result);
    res.json(true);
  } catch (error) {
    console.log(error);
    res.json(false);
  }
});
app.delete("/deleteUser/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const q = `DELETE FROM ovdim WHERE EmployeeID = ${id}`;
    await SQL(q);
    res.json(true);
  } catch (error) {
    res.json(false);
  }
});
app.post("/AddDepartment", async (req, res) => {
  console.log(req.body);
  try {
    const q = `SELECT MAX(DepartmentID) AS id FROM Department`;
    let id = await SQL(q);
    id = id[0].id + 1;
    console.log(id);
    const query = `INSERT INTO Department (DepartmentID,DepartmentName) VALUES (${id},'${req.body.newP}')`;
    await SQL(query);
    res.json(true);
  } catch (error) {
    res.json(false);
  }
});
app.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});
