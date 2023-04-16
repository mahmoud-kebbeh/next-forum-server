import jsonwebtoken from "jsonwebtoken";

export const createToken = (_id) => {
  return jsonwebtoken.sign({ _id }, process.env.SECRET, {});
};
