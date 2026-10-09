
import {
  createRemoteJWKSet,
  jwtVerify,
} from "jose";

const authUrl =
  process.env.BETTER_AUTH_URL ||
  "http://localhost:5000";

const jwks = createRemoteJWKSet(
  new URL(`${authUrl}/api/auth/jwks`)
);

/*
|--------------------------------------------------------------------------
| Protect API
|--------------------------------------------------------------------------
*/

export const protect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required.",
      });
    }

    const [scheme, token, ...extra] =
      authorization.trim().split(/\s+/);

    if (
      scheme !== "Bearer" ||
      !token ||
      extra.length > 0
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization format. Use Bearer token.",
      });
    }

    const verifyOptions = {};

    // Add these only when they match the JWT's actual claims.
    if (process.env.JWT_ISSUER) {
      verifyOptions.issuer = process.env.JWT_ISSUER;
    }

    if (process.env.JWT_AUDIENCE) {
      verifyOptions.audience = process.env.JWT_AUDIENCE;
    }

    const { payload } = await jwtVerify(
      token,
      jwks,
      verifyOptions
    );

    if (!payload.id || !payload.role) {
      return res.status(401).json({
        success: false,
        message: "Token is missing required user information.",
      });
    }

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name || "",
      photo: payload.photo || "",
    };

    return next();
  } catch (error) {
    console.error(
      "JWT verification error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Role Middleware
|--------------------------------------------------------------------------
*/

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to access this resource.",
      });
    }

    return next();
  };
};
