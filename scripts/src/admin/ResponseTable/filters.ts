export const filterCaseInsensitive = (filter, row) => {
  const id = filter.pivotId || filter.id;
  if (row[id] !== null) {
    let res =
      row[id] !== undefined
        ? ~String(row[id])
            .toLowerCase()
            .indexOf(filter.value.toLowerCase().trim())
        : true;
    return !!res;
  }
};
