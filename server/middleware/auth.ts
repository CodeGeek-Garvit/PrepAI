import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'prepai-super-secret-key';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Auth failed' });

    const decodedToken = jwt.verify(token, JWT_SECRET) as { id: string };
    req.userId = decodedToken.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Auth failed' });
  }
};
