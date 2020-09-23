import NOW from './Now.js';
import {CanvasUtils} from './utils/CanvasUtils.js';
import {GEOM} from './utils/GeomUtils.js';
import MorphableGroup from './MorphableGroup.js';
import MorphableGroupParallel from './MorphableGroupParallel.js';
import MorphablePath from './MorphablePath.js';
import Path from './Path.js';
import Group from './Group.js';
import {LoadUtils} from './utils/LoadUtils.js';
import {PathUtils} from './utils/PathUtils.js';
import {Morph} from './Morph.js';

class Main extends Group {

    constructor() {
        super();
        this.now = NOW;
        this.CanvasUtils = CanvasUtils;
        this.GEOM = GEOM;
        this.Morph = Morph;
    }

    /**
     *
     * @param paths : string[]
     * @returns {Promise<unknown[]>}
     * @constructor
     */
    LoadShapes(paths) {
        if(paths.constructor !== Array){
            paths = [paths];
        }
        var promises = [];
        for(var i = 0; i < paths.length; i ++){
            promises.push(SVGMORPH.LoadShape(paths[i]));
        }
        return Promise.all(promises);
    }


    LoadShape(paths){
        return LoadUtils.LoadSVG(paths.concat())
            .then(function (data) {
                return new Promise(function (resolve,reject) {
                    var svgPaths = [];

                    var bb = PathUtils.SVG.getBoundingBox(data[0]);

                    for (var i = 0; i < data.length; i++) {
                        var svg = data[i].getElementsByTagName('svg')[0];
                        var id = svg.getAttribute("id");
                        var pathData = PathUtils.SVG.getPathStrings(data[i]);
                        for (var p = 0; p < pathData.length; p++) {
                            var path = new Path({
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
    }

    /**
     *
     * @param segGroup1
     * @param segGroup2
     * @returns {MorphablePath}
     */
    createMorphablePath(segGroup1, segGroup2) {

        var morphableGroups = [];
        var s1 = segGroup1.length;
        var s2 = segGroup2.length;
        var minCount = Math.min(s1, s2);

        var k1 = 0, k2 = 0;
        for (var k = 0; k < minCount; k++) {
            var arr1 = [], arr2 = [];
            if (s2 > s1) {
                k1 = k;
                arr1.push(segGroup1[k1]);

                while (k2 * (s1 / s2) < (k + 1) && k2 < s2) {
                    arr2.push(segGroup2[k2]);
                    k2++;
                }
            } else {
                k2 = k;
                arr2.push(segGroup2[k2]);
                while (k1 * (s2 / s1) < (k + 1) && k1 < s1) {
                    arr1.push(segGroup1[k1]);
                    k1++
                }

            }
            if (arr1.length !== arr2.length) {
                morphableGroups.push(new MorphableGroup(arr1, arr2));
            } else {
                morphableGroups.push(new MorphableGroupParallel(arr1, arr2));
            }
        }
        return new MorphablePath(morphableGroups);
    };
}

export const SVGMORPH = new Main();