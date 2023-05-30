import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const authenticate = (req, res, next) => {
  try {
    // Check if user is authenticated
    // For example, you can check the presence of a valid JWT token in the request cookies
    const token = req.cookies.comminq_auth_token;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify the JWT token
    const jwtSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, jwtSecret);

    // Add the authenticated user to the request object
    req.user = decoded;

    // Call the next middleware or route handler
    next();
  } catch (error) {
    // Return error response for invalid or expired token
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export { authenticate };
