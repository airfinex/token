const AirfinexToken = artifacts.require("AirfinexToken");

module.exports = function (deployer) {
  deployer.deploy(AirfinexToken);
};
