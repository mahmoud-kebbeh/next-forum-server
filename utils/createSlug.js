export function createSlug(index, string) {
  string = `${index}-${string.replace(/\s/g, "-")}`;

  function removeConsecutiveHyphens(str) {
    let newStr = "";
    let prev;
    for (let i = 0; i < str.length; i++) {
      let char = str[i];
      if (char !== "-") {
        newStr += char;
      } else if (char !== prev) {
        newStr += char;
      }
      prev = char;
    }
    return newStr;
  }

  return removeConsecutiveHyphens(string);
}
