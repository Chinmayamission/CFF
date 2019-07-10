import { isArray, get, set, cloneDeep } from "lodash";

export default function unwind(data, unwindBy) {
  let unwoundData = [];
  for (const row of data) {
    const unwindArray = get(row, unwindBy, []);
    if (isArray(unwindArray)) {
      for (const index in unwindArray) {
        let unwoundRow = cloneDeep(row);
        set(unwoundRow, unwindBy, unwindArray[index]);
        set(unwoundRow, "CFF_UNWIND_BY", unwindBy);
        set(unwoundRow, "CFF_UNWIND_INDEX", index);
        set(unwoundRow, "CFF_UNWIND_ACCESSOR", `${unwindBy}.${index}`);
        unwoundData.push(unwoundRow);
      }
    }
  }
  return unwoundData;
}
