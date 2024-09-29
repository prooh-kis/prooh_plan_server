import express from "express";
import cors from "cors";
import { createServer } from "http";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import { connectSqlDb } from "./db/mysql.js";
import {createWebSocket } from "./broadcast/broadcastModel.js";
import { connectWebSocket } from "./db/webSocket.js";
import screenRouter from "./routers/screenRouters.js";

dotenv.config();


const app = express();
const httpServer = createServer(app);


// establish web socket
createWebSocket(httpServer);


// middle-where
app.use(express.json({ limit: "100mb", extended: true }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// db connection
connectDB();
connectWebSocket();
connectSqlDb();



// test router
app.get("/", (req, res) => {
  return res.send({ message: "Server is live!" });
});

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

//routes

app.use("/api/v2/screens", screenRouter);




//start server
const PORT = 3838;
httpServer.listen(PORT, () => {
    console.log("Server is running: ", `localhost:${PORT}`);
});
