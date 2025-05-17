const app = require("./src/app");
const connectDB = require("./src/config/db");
const setupSocket = require("./src/config/socket");
const http = require("http");

const server = http.createServer(app);
setupSocket(server);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
