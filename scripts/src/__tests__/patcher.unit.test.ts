import { Patcher } from "../common/patcher";


describe.only('patcher', () => {
    it('does a simple replace', () => {
        const patches = [[
            { op: "replace", path: "/firstName", value: "Albert"}
        ]];
        const patcher = new Patcher(patches);
        const data = {"firstName": "J"};
        expect(patcher.applyPatches(data)).toEqual({"firstName": "Albert"});
    })
});