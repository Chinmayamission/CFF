import {isArray, findIndex, cloneDeep, concat} from "lodash";

function filterHeaderObjs(headerObjsOrig, dataOption) {
  let filtered = [];
  let headerObjs = cloneDeep(headerObjsOrig);
  if (dataOption && dataOption.columnOrder && dataOption.columnOrder.length && isArray(dataOption.columnOrder)) {
      // Bring the columns in columnOrder to the front.
      let columnsAtFront = [];
      let wildCardIndex = -1;
      for (let i = 0; i < dataOption.columnOrder.length; i++) {
          let colName = dataOption.columnOrder[i];
          let index = findIndex(headerObjs, e => e.id.toLowerCase() == colName.toLowerCase());
          if (index != -1) {
            columnsAtFront.push(headerObjs.splice(index, 1)[0]);
          }
          else if (colName == "*") { // Wildcard operator.
            wildCardIndex = i;
          }
      }
      if (wildCardIndex != -1) { // Insert headerObjs into wild card index.
        columnsAtFront.splice(wildCardIndex, 0, ...headerObjs);
      }
      filtered = columnsAtFront;
      // filtered = headerObjs.sort((a, b) => ~findIndex(dataOption.columnOrder, header => b.id == header));
      // filtered = intersectionWith(headerObjs, dataOption.columnOrder, (header, order) => header.id == order);
  }
  if (filtered.length == 0) { // Don't return empty header objs.
      return headerObjs;
  }
  return filtered;
}

export default filterHeaderObjs;