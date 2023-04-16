import jsonwebtoken from "jsonwebtoken";

const getUser = (token) => {
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

export const getAuthentication = (ctx) => {
  const authorization = ctx.req.headers.cookie && ctx.req.headers.cookie.includes("authorization") && ctx.req.headers.cookie.split("=")[1];
  const user = getUser(authorization);
  return { authorization, user };
}
