const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "mysql-db",
  user: "root",
  password: "admin123",
  database: "users"
});

db.connect(err => {
  if (err) console.error(err);
  else console.log("MySQL Connected");
});

/* API */
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, data) => {
    if (err) return res.send(err);
    res.json(data);
  });
});

/* Place order (REAL-TIME EVENT) */
app.post("/order", (req, res) => {
  const { product } = req.body;
  db.query("INSERT INTO orders (product) VALUES (?)", [product]);
  io.emit("new-order", product); // 🔥 real-time push
  res.send("Order placed");
});

/* WebSocket */
io.on("connection", socket => {
  console.log("Client connected");
});

server.listen(3000, () => console.log("Backend running on 3000"));

