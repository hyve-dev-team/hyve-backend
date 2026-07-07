import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

export function generateToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
