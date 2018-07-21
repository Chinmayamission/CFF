let MongodbMemoryServer = require('mongodb-memory-server').default;

const mongoServer = new MongodbMemoryServer({
  binary: { version: "latest" },
  instance: {port: 10255, dbName: "admin"}
});

  console.warn("Setting up mongodb server...");
  mongoServer.getConnectionString().then((uri) => {
    console.log("Mongodb server running on url", uri);
  });