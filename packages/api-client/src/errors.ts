/**
 * API Error Hierarchy
 * Standard Error Classes for Bagodi API Integration
 */

export class ApiError extends Error {
  public statusCode: number;
  public details?: unknown;
  public errorCode?: string;

  constructor(message: string, statusCode: number, details?: unknown, errorCode?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = "Authentication required or token expired", details?: unknown) {
    super(message, 401, details, "UNAUTHORIZED");
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "Access denied: insufficient permissions", details?: unknown) {
    super(message, 403, details, "FORBIDDEN");
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Requested resource not found", details?: unknown) {
    super(message, 404, details, "NOT_FOUND");
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ValidationError extends ApiError {
  public errors?: Record<string, string[]>;

  constructor(message: string = "Validation failed", errors?: Record<string, string[]>, details?: unknown) {
    super(message, 422, details, "VALIDATION_ERROR");
    this.name = "ValidationError";
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class ServerError extends ApiError {
  constructor(message: string = "Internal server error occurred", details?: unknown) {
    super(message, 500, details, "SERVER_ERROR");
    this.name = "ServerError";
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

export class NetworkError extends Error {
  constructor(message: string = "Network connection failed or server unreachable") {
    super(message);
    this.name = "NetworkError";
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

