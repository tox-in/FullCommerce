var Ecommerce=artifacts.require('Ecommerce')
module.exports = function(_deployer) {
  // Use deployer to state migration tasks.
  deployer.deploy("Ecommerce");
};
