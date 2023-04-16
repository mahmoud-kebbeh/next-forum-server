export function formatStringAndLowerCase(string) {
  string = string
    .replace(/[^\w]|\s/g, " ")
    .trim()
    .toLowerCase();

  function removeConsecutiveSpaces(str) {
    let newStr = "";
    let prev;
    for (let i = 0; i < str.length; i++) {
      let char = str[i];
      if (char !== " ") {
        newStr += char;
      } else if (char !== prev) {
        newStr += char;
      }
      prev = char;
    }
    return newStr;
  }

  return removeConsecutiveSpaces(string);
}

export function formatStringAndKeepCase(string) {
  string = string.replace(/[^\w]|\s/g, " ").trim();

  function removeConsecutiveSpaces(str) {
    let newStr = "";
    let prev;
    for (let i = 0; i < str.length; i++) {
      let char = str[i];
      if (char !== " ") {
        newStr += char;
      } else if (char !== prev) {
        newStr += char;
      }
      prev = char;
    }
    return newStr;
  }

  return removeConsecutiveSpaces(string);
}
