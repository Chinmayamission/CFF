import {isArray, findIndex} from "lodash-es";

function filterHeaderObjs(headerObjs, dataOption) {
  let filtered = [];
  if (dataOption && dataOption.columnOrder && dataOption.columnOrder.length && isArray(dataOption.columnOrder)) {
      // Bring the columns in columnOrder to the front.
      let columnsAtFront = (dataOption.columnOrder);
      for (let colName of columnsAtFront.reverse()) {
          let index = findIndex(headerObjs, e => e.id.toLowerCase() == colName.toLowerCase());
          if (index != -1)
              headerObjs.unshift(headerObjs.splice(index, 1)[0]);
      }
      filtered = headerObjs;
      // filtered = headerObjs.sort((a, b) => ~findIndex(dataOption.columnOrder, header => b.id == header));
      // filtered = intersectionWith(headerObjs, dataOption.columnOrder, (header, order) => header.id == order);
  }
  if (filtered.length == 0) { // Don't return empty header objs.
      return headerObjs;
  }
  return filtered;
}

export default filterHeaderObjs;