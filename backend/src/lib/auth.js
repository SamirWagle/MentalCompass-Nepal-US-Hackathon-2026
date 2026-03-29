import jwt from 'jsonwebtoken';
import { getUserById, ROLES } from '../store/userStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aegisspeak-secret-key-2026-hackathon';
const JWT_EXPIRY = '24h';

/**
 * Generate a JWT token for a user
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Verify a JWT token and return the decoded payload
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Express middleware: requires authentication
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  }

  const token = header.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      ok: false,
      error: { code: 'TOKEN_INVALID', message: 'Invalid or expired token.' },
    });
  }

  const user = getUserById(decoded.id);
  if (!user) {
    return res.status(401).json({
      ok: false,
      error: { code: 'USER_NOT_FOUND', message: 'User account not found.' },
    });
  }

  req.user = user;
  next();
}

/**
 * Express middleware: requires specific role(s)
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required role: ${roles.join(' or ')}`,
        },
      });
    }

    next();
  };
}

/**
 * Optional auth — attaches user if token present, does NOT block
 */
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = getUserById(decoded.id);
    }
  }
  next();
}
