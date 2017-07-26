"use strict";

var window = require("global");
var Promise = require("promise");

module.exports = function get_orientation(uri){
	return new Promise(function(resolve, reject){
		var contentType = "image/jpeg";
		var byteCharacters = window.atob(uri.split(",")[1]);
		var byteNumbers = new Array(byteCharacters.length);
		for (var i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i);
		}
		var byteArray = new Uint8Array(byteNumbers);
		var blob = new Blob([byteArray], {type: contentType});

		var reader = new FileReader();
		reader.onload = function(e) {
			var view = new DataView(e.target.result);
			if (view.getUint16(0, false) != 0xFFD8) {
				return resolve(-2);
			}
			var length = view.byteLength, offset = 2;
			while (offset < length) {
				var marker = view.getUint16(offset, false);
				offset += 2;
				if (marker == 0xFFE1) {
					if (view.getUint32(offset += 2, false) != 0x45786966) {
						return resolve(-1);
					}
					var little = view.getUint16(offset += 6, false) == 0x4949;
					offset += view.getUint32(offset + 4, little);
					var tags = view.getUint16(offset, little);
					offset += 2;
					for (var i = 0; i < tags; i++)
						if(view.getUint16(offset + (i * 12), little) == 0x0112){
	            console.log(resolve(view.getUint16(offset + (i * 12) + 8, little)));
							return resolve(view.getUint16(offset + (i * 12) + 8, little));
						}
				}
				else if ((marker & 0xFF00) != 0xFF00) break;
				else offset += view.getUint16(offset, false);
			}
			return resolve(-1);
		};
		reader.readAsArrayBuffer(blob);
	});
}
