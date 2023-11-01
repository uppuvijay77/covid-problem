const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// API 1 GET ALL STATES
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT * 
    FROM state
    ORDER BY state_id;`;
  const dbResponse = await db.all(getStatesQuery);
  response.send(
    dbResponse.map((eachArray) => ({
      stateId: eachArray.state_id,
      stateName: eachArray.state_name,
      population: eachArray.population,
    }))
  );
});

//API 2 GET ONE STATE
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStatesQuery = `
    SELECT * 
    FROM state
    WHERE state_id = ${stateId};`;
  const dbResponse = await db.all(getStatesQuery);
  response.send(
    dbResponse.map((eachArray) => ({
      stateId: eachArray.state_id,
      stateName: eachArray.state_name,
      population: eachArray.population,
    }))
  );
});

//API 3 POST DISTRICT
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const postDistrictQuery = `
    INSERT INTO 
        district (district_name, state_id, cases, cured, active, deaths)
    VALUES (
        '${districtName}',
         ${stateId},
         ${cases},
         ${cured},
         ${active},
         ${deaths})`;
  await db.run(postDistrictQuery);
  response.send("District Successfully Added");
});

//API 4 GET ONE DISTRICT
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT * 
    FROM district
    WHERE district_id = ${districtId};`;
  const daResponse = await db.all(getDistrictQuery);
  response.send(
    daResponse.map((dbResponse) => ({
      districtId: dbResponse.district_id,
      districtName: dbResponse.district_name,
      stateId: dbResponse.state_id,
      cases: dbResponse.cases,
      cured: dbResponse.cured,
      active: dbResponse.active,
      deaths: dbResponse.deaths,
    }))
  );
});

//API 5 DELETE DISTRICT
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    DELETE FROM district
    WHERE district_id = ${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//API 6 UPDATE DISTRICT
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateDistrictQuery = `
    UPDATE 
        district
    SET 
        district_name = '${districtName}',
        state_id = ${stateId},
        cases = ${cases},
        cured = ${cured},
        active = ${active},
        deaths = ${deaths}
    WHERE 
        district_id = ${districtId}`;
  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//API 7 GET ROWS SUM OF STATES
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatesQuery = `
    SELECT 
        SUM(cases),
        SUM(cured),
        SUM(active),
        SUM(deaths)
    FROM 
        district 
    WHERE 
        state_id = ${stateId};`;
  const stats = await db.all(getStatesQuery);
  console.log(stats);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});

//API 8 GET ONE STATE NAME
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
    SELECT
        state_id 
    FROM
        district
    WHERE
        district_id = ${districtId};`; //With this we will get the state_id using district table
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);
  const getStateNameQuery = `
    SELECT
        state_name as stateName from state
    WHERE
        state_id = ${getDistrictIdQueryResponse.state_id};`; //With this we will get state_name as stateName using the state_id
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(
    getStateNameQueryResponse.map((each) => ({
      stateName: getStateNameQueryResponse.state_name,
    }))
  );
}); //sending the required response

module.exports = app;
