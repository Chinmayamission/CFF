import { applyPatch, applyReducer } from 'fast-json-patch';
import { cloneDeep} from 'lodash';

export class Patcher {
    _patches: any[]
    constructor(patches) {
        this._patches = patches;
    }
    applyPatches(data) {
        data = cloneDeep(data);
        for (let patch of this._patches) {
            try {
                patch.reduce(applyReducer, data);
            }
            catch(e) {
                console.error(e);
                continue;
            }
            break;
        }
        return data;
    }
}