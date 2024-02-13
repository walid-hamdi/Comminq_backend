import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  try {
    // const token = req.cookies?.comminq_auth_token;

    const { authorization } = req.headers;
    const token = authorization?.split(" ")[1];

    if (!token)
      return res.status(401).json({ error: "Authorization token is missing" });

    const jwtSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, jwtSecret, { algorithm: "HS256" });

    if (!decoded) return res.status(401).json({ error: "Invalid token" });

    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError)
      return res.status(401).json({ error: "Token has expired" });

    return res.status(401).json({ error: error.message });
  }
};

export { authenticate };
