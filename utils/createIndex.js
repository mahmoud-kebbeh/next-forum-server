export function createIndex(index, array) {
  if (index === null || index === undefined || index === 0) {
    index = array.length + 1;
  }
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length; j++) {
      if (array[j].index === +index) {
        index++;
        j = -1;
      }
      if (array[i].index === +index) {
        index++;
        i = -1;
      }
    }
  }

  return index;
}
