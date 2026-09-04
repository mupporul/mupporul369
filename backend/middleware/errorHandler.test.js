// TDD RED PHASE — tests written before implementation
'use strict';

const errorHandler = require('./errorHandler');

function makeRes() {
  return {
    status(code) { this._status = code; return this; },
    json(body)   { this._body = body; return this; },
    _status: null,
    _body:   null,
  };
}

describe('errorHandler middleware', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('sends a generic error body in production — no stack trace', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('internal secret details');
    const res = makeRes();
    errorHandler(err, {}, res, jest.fn());

    expect(res._body.error).toBe('Something went wrong');
    expect(res._body.message).toBeUndefined();
    expect(res._body.stack).toBeUndefined();
  });

  it('includes message in development but never stack', () => {
    process.env.NODE_ENV = 'development';
    const err = new Error('debug info');
    const res = makeRes();
    errorHandler(err, {}, res, jest.fn());

    expect(res._body.error).toBe('Something went wrong');
    expect(res._body.message).toBe('debug info');
    expect(res._body.stack).toBeUndefined();
  });

  it('uses err.status if present', () => {
    process.env.NODE_ENV = 'production';
    const err = Object.assign(new Error('Not Found'), { status: 404 });
    const res = makeRes();
    errorHandler(err, {}, res, jest.fn());

    expect(res._status).toBe(404);
  });

  it('falls back to 500 when no status on the error', () => {
    process.env.NODE_ENV = 'production';
    const res = makeRes();
    errorHandler(new Error('boom'), {}, res, jest.fn());

    expect(res._status).toBe(500);
  });
});
