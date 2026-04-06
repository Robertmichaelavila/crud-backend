import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET not defined')
}

const JWT_SECRET = process.env.JWT_SECRET

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1. Tenta obter token do cookie (httpOnly)
  let token = req.cookies?.token;

  // 2. Se não houver, tenta do header Authorization
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // remove "Bearer "
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {id: string}

    if (!decoded.id) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    req.user = decoded as { id: string }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}