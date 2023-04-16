import jsonwebtoken from "jsonwebtoken";

export const getUser = (token) => {
  try {
    if (token) {
      const user = jsonwebtoken.verify(token, process.env.SECRET);
      return user;
    }

    return null;
  } catch (error) {
    return null;
  }
};