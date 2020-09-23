export const LoadUtils = {

    /**
     * Previously loaded SVG
     */
    CachedPaths: {},

    /**
     *
     * @param paths : string[]
     * @returns {Promise<SVG[]>}
     * @constructor
     */
    LoadSVG: function (paths) {

        paths = Array.isArray(paths) ? paths : [paths];

        return new Promise(function (resolve, reject) {

            var svgPaths = [];
            var documents = [];

            function loadHandler(path, data) {
                documents.push(data);
                LoadUtils.CachedPaths[path] = data;
                if (paths.length) {
                    load(paths.shift());
                } else {
                    resolve(documents);
                }
            }

            /**
             * Path to svg
             * @param path : string
             */
            function load(path) {

                if (LoadUtils.CachedPaths.hasOwnProperty(path)) {
                    loadHandler(path, LoadUtils.CachedPaths[path]);
                } else {
                    var xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function () {
                        if (xhttp.readyState == 4 && xhttp.status == 200) {
                            loadHandler(path, xhttp.responseXML);
                        }
                    };
                    xhttp.open('GET', path, true);
                    xhttp.send();
                }
            }

            load(paths.shift());

        });
    }

}

