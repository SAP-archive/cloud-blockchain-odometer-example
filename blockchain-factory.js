var HyperledgerFabric = require("./hyperledger-fabric.js")
var MultiChain = require("./multichain.js");

module.exports = function (creds, logger, cb) {
    var opts = {};
    var type = creds.type || "";

    switch (type.toLowerCase()) {
        case "hyperledger-fabric":
            opts.chaincodeId = process.env.HLF_CHAINCODE_ID;
            HyperledgerFabric(creds, opts, logger, cb);
            break;
        case "":
            opts.streamId = process.env.MC_STREAM_ID;
            MultiChain(creds, opts, logger, cb);
            break;
        default:
            logger.error("No blockchain technology specified.");
            break;
    }
}
