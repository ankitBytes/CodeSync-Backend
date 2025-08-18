import jwt from "jsonwebtoken";

export default function AuthMiddleware(req, res, next) {
  // Check if the user is authenticated
  const token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided. Please log in." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Invalid token or token has expired." });
    }

    req.user = decoded; // Attach user info to request object
    next(); // Proceed to the next middleware or route handler
  });
}
