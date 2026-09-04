'use strict';

const logger = require('pino')();

/**
 * Centralised Express error handler.
 * Must be the LAST middleware registered in `server/index.js`.
 *
 * - Production: returns generic `{ error: 'Something went wrong' }` — never leaks stack traces
 * - Development: additionally includes the error `message` for easier debugging
 * - Always logs the full error server-side via pino
 *
 * @param {Error} err
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next  - Required 4th param so Express treats this as error handler
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error({ err, url: req.url, method: req.method }, 'Unhandled error');

  const status = err.status || err.response?.status || 500;

  const body =
    process.env.NODE_ENV === 'development'
      ? { error: 'Something went wrong', message: err.message }
      : { error: 'Something went wrong' };

  res.status(status).json(body);
}

module.exports = errorHandler;
