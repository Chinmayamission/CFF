import { applyPatch, deepClone } from 'fast-json-patch';

export class Patcher {
    _patches: any[]
    constructor(patches) {
        this._patches = patches;
    }
    applyPatches(data) {
        for (let patch of this._patches) {
            data = applyPatch(patch, deepClone(data));
        }
        return data;
    }
}