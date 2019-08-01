module.exports = {
  server: {
    command: "cd scripts/dist && python3 -m http.server 8000",
    port: 8000,
    usedPortAction: "kill"
  }
};
