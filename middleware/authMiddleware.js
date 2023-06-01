import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  try {
    // const header = req.headers.authorization;
    // const token = header?.split(" ")[1];
    const token = req.cookies.comminq_auth_token;

    if (!token) {
      return res.status(401).json({ error: "Authorization token is missing" });
    }

    // Verify the JWT token
    const jwtSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, jwtSecret, { algorithm: "HS256" });

    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Add the authenticated user to the request object
    req.user = decoded;

    // Call the next middleware or route handler
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token has expired" });
    }
    return res.status(401).json({ error: error.message });
  }
};

export { authenticate };
