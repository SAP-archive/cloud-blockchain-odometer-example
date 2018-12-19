var express = require("express");
var serveStatic = require("serve-static");
var path = require("path");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var winston = require("winston");
var BlockchainFactory = require("./blockchain-factory.js");
var cfenv = require("cfenv");

var logger = new (winston.Logger)({
    level: "debug",
    transports: [
        new (winston.transports.Console)({ colorize: true }),
    ]
});

var appEnv = cfenv.getAppEnv();
var host = "localhost";
var port = "3010";

var serviceCredentials = appEnv.getServiceCreds(process.env.BC_TECHNOLOGY_SERVICE_NAME);
BlockchainFactory(serviceCredentials, logger, function (blockchain) {
    io.on("connection", function (socket) {
        logger.info("[socket-io] connected");
        socket.on("message", function (message) {
            var options = {};
            var data = JSON.parse(message);

            if (data.action === "init") {
                socket.emit("message", JSON.stringify({
                    action: "finished-loading",
                    origin: data.action,
                    successfull: true
                }));
            }
            else if (data.action === "write") {
                data.assetValue = parseInt(data.asset_value) + "";
                console.log(data);
                logger.info("[socket-io] try to write: " + data.assetValue);
                options.args = {
                    assetId: "SAP000S407W212743",
                    assetValue: data.assetValue,
                    assetUnit: data.asset_unit
                };
                blockchain.write(options, function (err) {
                    if(!err) {
                        logger.info("[socket-io] write: SAP000S407W212743 OK");
                        socket.emit("message", JSON.stringify({
                            action: "finished",
                            origin: data.action,
                            successfull: true
                        }));
                    }
                    else {
                        socket.emit("message", JSON.stringify({
                            action: "finished",
                            message: err,
                            origin: data.action,
                            successfull: false
                        }));
                    }
                });
            }
            else if (data.action === "read") {
                options.args = {
                    assetId: "SAP000S407W212743"
                };
                blockchain.read(options, function (err, value) {
                    if(!err) {
                        logger.info("[socket-io] read: SAP000S407W212743 OK");
                        socket.emit("message", JSON.stringify({
                            action: "finished",
                            origin: data.action,
                            successfull: true,
                            asset_value: value,
                            asset_unit: "km"
                        }));
                    }
                    else {
                        socket.emit("message", JSON.stringify({
                            action: "finished",
                            message: err,
                            origin: data.action,
                            successfull: false
                        }));
                    }
                });
            }
            else if (data.action === "history") {
                options.args = {
                    assetId: "SAP000S407W212743"
                };
                blockchain.history(options, function (err, history) {
                    if (!err) {
                        logger.info("[socket-io] history: SAP000S407W212743 OK");
                        socket.emit("message", JSON.stringify({
                            action: "finished",
                            origin: data.action,
                            successfull: true,
                            history: history
                        }));
                    }
                    else {
                        socket.emit("message", JSON.stringify({
                            action: "finished",
                            message: err,
                            origin: data.action,
                            successfull: false
                        }));
                    }
                });
            }
        });
        socket.on("disconnect", function () {
            logger.info("[socket-io] disconnected");
        });
    });
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/assets.html", function (req, res) {
    res.sendFile(__dirname + "/assets.html");
});

app.use(serveStatic(path.join(__dirname, "public")));
http.listen(process.env.PORT || port, function () {
    console.log("[index.js] Server Up - " + host + ":" + port);
});