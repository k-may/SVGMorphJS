/**
 * Created by kev on 16-04-06.
 */
/**
 * Returns normalized paths
 *
 * @param paths
 * @param callback
 * @constructor
 */
MORPH.LoadShapes = function (paths) {

	if(paths.constructor !== Array){
		paths = [paths];
	}
	var promises = [];
	for(var i = 0; i < paths.length; i ++){
		promises.push(MORPH.LoadShape(paths[i]));
	}
	return Promise.all(promises);
};
MORPH.CachedPaths = {};
MORPH.LoadShape = function(paths){
	return MORPH.LoadSVG(paths.concat())
		.then(function (data) {

			return new Promise(function (resolve,reject) {
				var svgPaths = [];

				var bb = MORPH.SVG.getBoundingBox(data[0]);

				for (var i = 0; i < data.length; i++) {
					var svg = data[i].getElementsByTagName('svg')[0];
					var id = svg.getAttribute("id");
					var pathData = MORPH.SVG.getPathStrings(data[i]);
					for (var p = 0; p < pathData.length; p++) {
						var path = new MORPH.Path({
							id:id + "_" + p,
							d :pathData[p]
						});
						path.setRectangle(bb.clone());
						svgPaths.push(path);
					}
				}
				resolve(svgPaths);

			});
		});
};

MORPH.LoadSVG = function (paths) {

	return new Promise(function (resolve,reject) {

		var svgPaths = [];
		var documents = [];

		function loadHandler(path, data) {
			documents.push(data);
				MORPH.CachedPaths[path] = data;
			if (paths.length) {
				load(paths.shift());
			} else {
				resolve(documents);
			}
		}

		function load(path) {

			if(MORPH.CachedPaths.hasOwnProperty(path)){
				loadHandler(path, MORPH.CachedPaths[path]);
			}else {
				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function () {
					if (xhttp.readyState == 4 && xhttp.status == 200) {
						loadHandler(path, xhttp.responseXML);
					}
				};
				xhttp.open("GET", path, true);
				xhttp.send();
			}
		}

		load(paths.shift());

	});
};
