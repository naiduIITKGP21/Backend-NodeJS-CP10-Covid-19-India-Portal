const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let db = null;
const dbPath = path.join(__dirname, "covid19IndiaPortal.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("server running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1: user login and jwtToken creation
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const userExistedQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const userExisted = await db.get(userExistedQuery);
  if (userExisted === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(
      password,
      userExisted.password
    );
    if (isPasswordMatched === true) {
      const payload = { username: username };
      console.log(payload);
      const jwtToken = jwt.sign(payload, "a1234s", () =>
        console.log("jwtToken created")
      );
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});
