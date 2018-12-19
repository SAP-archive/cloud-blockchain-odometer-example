//-------------------------------------------------------------------
// Multichain Library
//-------------------------------------------------------------------

var request = require("request");

module.exports = function (creds, opts, logger, cb) {
	var multichain = {};
	var streamId = opts.streamId || "SAP000S407W212743";

	function _init(cb) {		
		request.post({
			uri: creds.url,
			json: true,
			headers: {
				apikey: creds.api_key
			},
			body: {
				method: "create",
				params: [
					"stream",
					streamId,
					true
				]
			}
		}, function (err, res, body){
            logger.info("[multichain.js] create stream \"" + streamId + "\": " + (typeof body === "object" ? JSON.stringify(body) : body));
			cb();
		});
	}

	_init(function() {
		/**
		 * Write to the given multichain stream.
		 */
		multichain.write = function (options, cb) {		
			request.post({
				uri: creds.url,
				json: true,
				headers: {
					apikey: creds.api_key
				},
				body: {
					"method": "liststreamkeyitems", 
					"params": [
						streamId,
						options.args.assetId,
						false,
						1,
						-1
					] 
				}
			}, function (err, res, body){
				if (err) {
					if(typeof err !== "string") {
						err = JSON.stringify(err);
					}
					return cb(err);
				}
				var value = parseInt(options.args.assetValue);						
				var current = 0;
				var unit = options.args.assetUnit;
				current = (body && body.result && body.result[0]) ? body.result[0].data.hexDecode() : "0";
				current = parseInt(current);

				if (unit.startsWith("mi")) {
					value = Math.floor(value * 1.609344);
				}

				if (current === value) {
					return cb("Warning: The blockchain is up-to-date");
				}
				if (current >= value) {
					return cb("Error: Rejecting value for odometer");				
				}
				request.post({
					uri: creds.url,
					json: true,
					headers: {
						apikey: creds.api_key
					},
					body: {
						method: "publish", 
						params: [
							streamId,
							options.args.assetId,
							value.toString().hexEncode()
						] 
					}
				}, function (err, res, body) {
					if (err) {
						if (typeof err !== "string") {
							err = JSON.stringify(err);
						}
						return cb(err);
					}

					if (res && res.statusCode !== 200) {
						if (typeof body !== "string") {
							body = JSON.stringify(body);
						}
						return cb(body);
					}
					return cb(null);
				});			
			});
		};  

		/**
		 * Read from the given multichain stream.
		 */
		multichain.read = function (options, cb) {
			request.post({
				uri: creds.url,
				json: true,
				headers: {
					apikey: creds.api_key
				},
				body: {
					"method": "liststreamkeyitems", 
					"params": [
						streamId,
						options.args.assetId,
						false,
						1,
						-1
					] 
				}
			}, function (err, res, body){		
				if (err) {	
					if (typeof err !== "string") {
						err = JSON.stringify(err);
					}						
					return cb(err);	
				}
				var value = body && body.result && body.result[0] ? body.result[0].data.hexDecode() : "0";
				return cb(null, value);
			});
		};

		/**
		 * Returns the history of the asset from the multichain stream.
		 */
		multichain.history = function (options, cb) {
			request.post({
				uri: creds.url,
				json: true,
				headers: {
					apikey: creds.api_key
				},
				body: {
					method: "liststreamkeyitems",
					params: [
						streamId,
						options.args.assetId,
						false,
						100
					]
				}
			}, function (err, res, body) {
				if (err) {
					return cb(err);
				}
				const results = body.result.reverse();
				cb(null, parseHistoryArray(results));
			});
		};
		
		cb(multichain);
	});
};

//-------------------------------------------------------------------
// HELPERS
//-------------------------------------------------------------------

String.prototype.hexEncode = function() {
	var hex, i;
	var result = "";
	for (i = 0; i < this.length; i++) {
		hex = this.charCodeAt(i).toString(16);
		result += ("0"+hex).slice(-2);
	}
	return result;
}

String.prototype.hexDecode = function() {
	var hexes = this.match(/.{1,2}/g) || [];
	var result = "";
	for(var j = 0; j < hexes.length; j++) {
		result += String.fromCharCode(parseInt(hexes[j], 16));
	}
	return result;
}

function parseHistoryArray(historyArray) {
	const result = [];
	historyArray.forEach(function(item) {
		const odometer = item.data.hexDecode();
		const timestamp = new Date(item.blocktime * 1000);
		result.push({
			kilometre: odometer,
			timestamp: timestamp
		});
	});
	return result;
}
