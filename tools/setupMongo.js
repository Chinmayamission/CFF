const MongodbMemoryServer = require('mongodb-memory-server').default;
const Mongonaut = require("mongonaut");

const mongoServer = new MongodbMemoryServer({
  binary: { version: "latest" },
  instance: { port: 10255, dbName: "admin" }
});

console.warn("Setting up mongodb server...");
mongoServer.getConnectionString().then((uri) => {
  console.log("Mongodb server running on url", uri);
  console.log("Importing data...");
  const mongonaut = new Mongonaut({
    'host': 'localhost:10255',
    'db': 'admin',
    'collection': 'cff_dev',
    'jsonArray': false
  });
  mongonaut.import(__dirname + '/mongoFixtures.json')
    .then(function (response) {
      console.log("Data import complete.", response);
    }).catch(e => console.error("Data import error: ", e));
});