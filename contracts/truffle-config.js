require('dotenv').config();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // localhost
      port: 8545,            // default port for local Ganache CLI
      network_id: "*",       // match any network id
    },
    ganache: {
      host: "127.0.0.1",     // localhost
      port: 7545,            // default port for Ganache GUI
      network_id: "*",       // match any network id
    },
  },

  compilers: {
    solc: {
      version: "0.8.17",      // Solidity version
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },

  mocha: {
    timeout: 100000
  }
};
