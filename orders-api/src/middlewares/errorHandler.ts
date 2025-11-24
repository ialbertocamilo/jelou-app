import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  ERROR_MESSAGES
} from '../constants'
import logger from '../logger'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof ZodError) {
    logger.error(
      {
        validation_errors: err.errors,
        req: { method: req.method, url: req.url, body: req.body }
      },
      'Validation error'
    )
    res.status(HTTP_STATUS_BAD_REQUEST).json({
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message
      }))
    })
    return
  }

  if ((err as any).code === 'ER_DUP_ENTRY') {
    logger.error(
      { err, req: { method: req.method, url: req.url } },
      'Duplicate entry error'
    )
    res.status(HTTP_STATUS_BAD_REQUEST).json({
      error: ERROR_MESSAGES.DUPLICATE_ENTRY,
      message: ERROR_MESSAGES.DUPLICATE_ENTRY_MESSAGE
    })
    return
  }

  logger.error(
    { err, req: { method: req.method, url: req.url } },
    'Unhandled error'
  )

  res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
    error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
  })
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
