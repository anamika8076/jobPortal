import { timingSafeEqual } from "crypto";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const sameSecret = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

// For routes only other Hirely services may call. Fails closed if the key isn't configured.
export const requireInternalKey = (req: Request, res: Response, next: NextFunction) => {
  const expected = process.env.INTERNAL_API_KEY;
  const provided = req.header("x-internal-key");
  if (!expected || !provided || !sameSecret(provided, expected)) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
};

// For routes called by signed-in users. Password-reset tokens share JWT_SEC but carry
// no user id, so they are rejected here.
export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const secret = process.env.JWT_SEC;
  if (!secret || !header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Please log in to use this feature" });
    return;
  }
  try {
    const payload = jwt.verify(header.slice("Bearer ".length), secret) as JwtPayload;
    if (!payload?.id) throw new Error("Token has no user");
    next();
  } catch {
    res.status(401).json({ message: "Your session has expired. Please log in again" });
  }
};
