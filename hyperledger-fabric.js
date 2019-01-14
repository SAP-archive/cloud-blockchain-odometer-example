//-------------------------------------------------------------------
// Hyperleder Fabric Library
//-------------------------------------------------------------------

var request = require('request');
var fs = require("fs");

module.exports = function (creds, opts, logger, cb) {
    var hyperledgerFabric = {};
    var accessToken;
    var chaincodeId;
    
    function _init(cb) {
        if (!opts && !opts.chaincodeId) {
            logger.error("Environment variable \"HLF_CHAINCODE_ID\" not provided.");
        }

        _getAccessToken(function (err, token) {
            // check if chaincode already exists
            request({
                method: "GET",
                uri: creds.serviceUrl + "/chaincodes",
                headers: {
                    Authorization: "Bearer " + token
                },
                json: true
            }, function (err, res, body) {
                if (err) {
                    return cb(err);
                }

                // look for odometer chaincode
                body.values.forEach(function (chaincode) {
                    if (chaincode.id.endsWith(opts.chaincodeId)) {
                        chaincodeId = chaincode.id;
                    }
                });

                // if not found deploy odometer chaincode
                if (!chaincodeId) {
                    request.post({
                        uri: creds.serviceUrl + "/chaincodes",
                        headers: {
                            Authorization: "Bearer " + token
                        },
                        json: true,
                        formData: {
                            file: fs.createReadStream(__dirname + "/chaincode/odometer.zip"),
                            arguments: "",
                            description: "SAP Odometer Chaincode"
                        }
                    }, function (err, res, body) {
                        if (err) {
                            return cb(err);
                        }

                        chaincodeId = body.id;
                        request.post({
                            uri: _getChaincodeURL(chaincodeId) + "/SAP000S407W212743",
                            json: true,
                            headers: {
                                Authorization: "Bearer " + token
                            },
                            formData: {
                                organization: "sap"
                            }
                        }, function (err, res, body) {
                            return cb(null);
                        });

                        return cb(new Error("chaincode deploy failed: " + JSON.stringify(body)));
                    });
                } else {
                    // ensure that VIN is created
                    request.post({
                        uri: _getChaincodeURL(chaincodeId) + "/SAP000S407W212743",
                        json: true,
                        headers: {
                            Authorization: "Bearer " + token
                        },
                        formData: {
                            organization: "sap"
                        }
                    }, function (err, res, body) {
                        logger.info("VIN SAP000S407W212743 created");
                        return cb(null);
                    });
                }
            });
        });

        return cb(null);
    }
    
    function _getAccessToken(cb) {
        if (accessToken && isValid(accessToken)) {
            return cb(null, accessToken);
        }

        // get new access token
        var encodedBasicSecret = new Buffer(creds.oAuth.clientId + ":" + creds.oAuth.clientSecret).toString("base64");
        request.post({
            uri: creds.oAuth.url + "/oauth/token?grant_type=client_credentials&response_type=token",
            headers: {
                Authorization: "Basic " + encodedBasicSecret
            },
            json: true
        }, function (err, res, body) {
            if (err) {	
                if (typeof err !== "string") {
                    err = JSON.stringify(err);
                }						
                return cb(err);
            }
            if (res.statusCode !== 200) {
                return cb(new Error("Could not retreive access token"));
            }
            accessToken = body.access_token;
            return cb(null, accessToken);
        });
    }

    function _getChaincodeURL(chaincodeId) {
        var url = creds.serviceUrl;
        return url + "/chaincodes/" + chaincodeId + "/latest";
    }

    _init(function(err) {
        if (err) {
            logger.error(err);
        }

        /**
         * Invoke and write to the given chaincode.
         */
        hyperledgerFabric.write = function (options, cb) {
            _getAccessToken(function (err, token) {
                request.put({
                    uri: _getChaincodeURL(chaincodeId) + "/" + options.args.assetId,
                    json: true,
                    headers: {
                        Authorization: "Bearer " + token
                    },
                    formData: {
                        organization: "sap",
                        odometer: options.args.assetValue,
                        unit: options.args.assetUnit
                    }
                }, function (err, res, body){
                    if (err) {
                        return cb(err);
                    }

                    if (res && res.statusCode === 406) {
                        return cb("Error: Rejecting value for odometer");
                    }

                    if (res && res.statusCode !== 204) {
                        return cb("Error: Value on blockchain not updated");
                    }

                    return cb();
                });
            });
        };  

        /**
         * Query and read from the given chaincode. 
         */
        hyperledgerFabric.read = function (options, cb) {
            _getAccessToken(function (err, token) {
                request.get({
                    uri: _getChaincodeURL(chaincodeId) + "/" + options.args.assetId,
                    json: true,
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }, function (err, res, body){
                    if (err) {
                        return cb(err);
                    }

                    return cb(null, body || "0");
                });
            });
        };

        /**
         * Query histroy from the given chaincode.
         */
        hyperledgerFabric.history = function (options, cb) {
            _getAccessToken(function (err, token) {
                request.get({
                    uri: _getChaincodeURL(chaincodeId) + "/" + options.args.assetId + "/history",
                    json: true,
                    headers: {
                        Authorization: "Bearer " + token
                    }
                }, function (err, res, body) {
                    if (err) {
                        return cb(err);
                    }

                    return cb(null, body.history.reverse() || []);
                });
            });
        }
        
        return cb(hyperledgerFabric);
    });
};

//-------------------------------------------------------------------
// HELPERS
//-------------------------------------------------------------------

function parseJWTPayload(token) {
    const tokenParts = token.split(".");
    const encodedPayload = tokenParts[1];
    const payloadAsBuffer = Buffer.from(encodedPayload, "base64");
    const decodedPayload = payloadAsBuffer.toString();
    return JSON.parse(decodedPayload);
}

function isValid(token) {
    const payload = parseJWTPayload(token);
    const timestampNow = Math.floor(Date.now() / 1000);
    return payload.exp > timestampNow;
}
