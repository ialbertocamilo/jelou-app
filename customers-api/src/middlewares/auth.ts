import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import {
  ERROR_MESSAGES,
  HTTP_STATUS_FORBIDDEN,
  HTTP_STATUS_UNAUTHORIZED
} from '../constants'
import logger from '../logger'

const JWT_SECRET =
  process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'secret-token'

export interface AuthRequest extends Request {
  user?: {
    id: number
    email: string
  }
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res
      .status(HTTP_STATUS_UNAUTHORIZED)
      .json({ error: ERROR_MESSAGES.MISSING_AUTH_HEADER })
    return
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number
      email: string
    }
    req.user = decoded
    next()
  } catch (error) {
    logger.warn({ error }, 'Invalid JWT token')
    res
      .status(HTTP_STATUS_FORBIDDEN)
      .json({ error: ERROR_MESSAGES.INVALID_TOKEN })
  }
}

export function authenticateService(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res
      .status(HTTP_STATUS_UNAUTHORIZED)
      .json({ error: ERROR_MESSAGES.MISSING_AUTH_HEADER })
    return
  }

  const token = authHeader.substring(7)

  if (token !== SERVICE_TOKEN) {
    res
      .status(HTTP_STATUS_FORBIDDEN)
      .json({ error: ERROR_MESSAGES.INVALID_SERVICE_TOKEN })
    return
  }

  next()
}

export function generateToken(payload: { id: number; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}
