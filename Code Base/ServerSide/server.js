require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "homequest",
    password: "yourpassword",  // Replace with your actual password
    port: 5432,
});

// 📝 Test route to check if the server is running
app.get("/", (req, res) => {
    res.send("Hello World! Node.js & PostgreSQL are working!");
});

// 📝 API to Insert a String into the Database
app.post("/submit", async (req, res) => {
    const { inputString } = req.body;
    try {
        await pool.query("INSERT INTO test_strings (content) VALUES ($1)", [inputString]);
        res.send("String has been stored!");
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

// 📝 API to Retrieve Stored Strings
app.get("/strings", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM test_strings");
        res.json(result.rows);
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

// Start the Server
app.listen(5000, () => console.log("Server running on port 5000"));
