import NOW from './Now.js';

export default class Group {

    constructor() {
        this._morphs = [];
    }

    add(morph) {
        this._morphs.push(morph);
    }

    //todo check performance on time
    update({time, deltaTime}) {

        if (this._morphs.length === 0)
            return false;

        var i = 0, numMorphs = this._morphs.length;

        time = time !== undefined ? time : NOW()

        while (i < numMorphs) {
            if (this._morphs[i].update(time)) {
                i++;
            } else {
                this._morphs.splice(i, 1);
                numMorphs--;
            }
        }
        return true;
    }

    draw(p) {
        var i = 0, numMorphs = this._morphs.length;
        while (i < numMorphs) {
            var morph = this._morphs[i++];
            morph.draw(p)
        }
    }

    clear() {
        this._morphs = [];
    }

}
