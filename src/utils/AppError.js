class ApiError extends Error {
  constructor(
    statusCode,
    message = "Somthing went wrong",
    error = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.error = this.error;
    if (stack) {
      this.stack = stack;
    } else {
      // Error.captureStackTrace(targetObject, constructorOpt);
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export { ApiError };
