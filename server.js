const express = require("express");
const morgan = require("morgan");
const path = require("path");
const argv = require("yargs")
  .usage("Usage: $0 -p [port]")
  .alias("p", "port")
  .describe("port", "(optional) Port Number -default is 3000")
  .strict().argv;

const DEFAULT_PORT = 5502;
const app = express();
let port = DEFAULT_PORT;
if (argv.p) {
  port = argv.p;
}

app.use(morgan("dev"));
app.use(
  "/lib",
  express.static(path.join(__dirname, "../../lib/msal-browser/lib"))
);

app.use(
  "/lib",
  express.static(path.join(__dirname, "../../lib/msal-browser/lib"))
);

// Serve static files from the "app" directory
app.use(express.static("app"));

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(express.static("app"));
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port);
console.log(`Listening on port ${port}.....`);
