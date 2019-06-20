import { Patcher } from "../common/patcher";


describe.only('patcher', () => {
    it('does a simple replace', () => {
        const patches = [[
            { op: "replace", path: "/firstName", value: "Albert"}
        ]];
        const patcher = new Patcher(patches);
        const data = {"firstName": "J"};
        expect(patcher.applyPatches(data)).toEqual({"firstName": "Albert"});
    });
    it('does a conditional thing = true', () => {
        const patches = [
            [
                { op: "test", path: "/firstName", value: "J" },
                { op: "replace", path: "/firstName", value: "Albert"}
            ],
            [
                { op: "test", path: "/firstName", value: "K" },
                { op: "replace", path: "/firstName", value: "Albert2"}
            ]
        ];
        const patcher = new Patcher(patches);
        const data = {"firstName": "J"};
        expect(patcher.applyPatches(data)).toEqual({"firstName": "Albert"});
    });
    it('increments grade', () => {
        const patches = [
            [
                { op: "test", path: "/participants/grade", value: "1" },
                { op: "replace", path: "/participants/grade", value: "2"}
            ],
            [
                { op: "test", path: "/grade", value: "2" },
                { op: "replace", path: "/grade", value: "3"}
            ]
        ];
        const patcher = new Patcher(patches);
        expect(patcher.applyPatches({"participants": [{"grade": "1"}] })).toEqual({"participants": [{"grade": "2"}] });
    });
});