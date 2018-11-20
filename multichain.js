//-------------------------------------------------------------------
// Multichain Library
//-------------------------------------------------------------------

var request = require('request');
String.prototype.hexEncode = function(){
	var hex, i;
	var result = "";
	for (i=0; i<this.length; i++) {
		hex = this.charCodeAt(i).toString(16);
		result += ("0"+hex).slice(-2);
	}
	return result;
} 
String.prototype.hexDecode = function(){
	var hexes = this.match(/.{1,2}/g) || [];
	var result = "";
	for(var j = 0; j<hexes.length; j++) {
		result += String.fromCharCode(parseInt(hexes[j], 16));
	}
	return result;
}
module.exports = function (multichain_options, logger) {
	var multichain = {};
	var streamId = "SAP000S407W212743";
	function _init_stream() {		
		request.post({
			uri: multichain_options.url,
			json: true,
			headers: {
				apikey: multichain_options.api_key
			},
			body: {"method":"create","params":["stream",streamId,true]}
		}, function (err, res, body){
            console.log('[multichain.js] create stream "' + streamId + '": ' + (typeof body=='object'?JSON.stringify(body):body));
		});
	}
	_init_stream();	

	multichain.write = function (options, cb) {
		//logger.info('[multichain.js] Write an odometer value...');		
		request.post({
			uri: multichain_options.url,
			json: true,
			headers: {
				apikey: multichain_options.api_key
			},
			body: {
				"method": "liststreamkeyitems", 
				"params": [
					streamId,
					options.args.asset_id,
					false,
					1,
					-1
				] 
			}
		}, function (err, res, body){
			if (err) {
				if(typeof err != "string") {
					err = JSON.stringify(err);
				}
				return cb(err);
			}
			var value = parseInt(options.args.asset_value);						
			var current = 0;
			current = body&&body.result&&body.result[0]?body.result[0].data.hexDecode():"0";
			current = parseInt(current);
			if(current==value) {
				return cb("Warning: The blockchain is up-to-date");
			}
			if(current>value) {
				return cb("Error: Rejecting value for odometer");				
			}
			request.post({
				uri: multichain_options.url,
				json: true,
				headers: {
					apikey: multichain_options.api_key
				},
				body: {
					"method": "publish", 
					"params": [
						streamId,
						options.args.asset_id,
						options.args.asset_value.hexEncode()
					] 
				}
			}, function (err, res, body) {
				if (err) {
					if(typeof err != "string") {
						err = JSON.stringify(err);
					}
					return cb(err);
				}        
				if (res && res.statusCode != 200) {
					if(typeof body != "string") {
						body = JSON.stringify(body);
					}							
					return cb(body);
				}				
				return cb(null);
			});			
		});
	};  

	multichain.read = function (options, cb) {
		request.post({
			uri: multichain_options.url,
			json: true,
			headers: {
				apikey: multichain_options.api_key
			},
			body: {
				"method": "liststreamkeyitems", 
				"params": [
					streamId,
					options.args.asset_id,
					false,
					1,
					-1
				] 
			}
		}, function (err, res, body){		
			if (err) {	
				if(typeof err != "string") {
					err = JSON.stringify(err);
				}						
				return cb(err);
			}
			var value = body&&body.result&&body.result[0]?body.result[0].data.hexDecode():"0";
			return cb(null, value);
		});
	};
	
	return multichain;
};