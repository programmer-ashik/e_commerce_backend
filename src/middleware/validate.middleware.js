import { ApiError } from "../utils/ApiError.js";

const validate = (schema) => (req, res, next) => {
  try {
    const validatedata = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (validatedata.body) req.body = validatedata.body;
    if (validatedata.query) {
      Object.assign(req.query, validatedata.query);
    }
    if (validatedata.params) {
      Object.assign(req.params, validatedata.params);
    }
    next();
  } catch (error) {
    const issues = error.issues || error.details || [];
    const errorMessage =
      issues.length > 0
        ? issues
            .map((issue) => {
              const { path, message } = issue;
              return `${path ? path + ":" : ""}${message}`;
            })
            .join(", ")
        : error.message || "Validation Error";
    console.log("vaidationError:", errorMessage);
    next(new ApiError(400, errorMessage || "Validation Error", error.errors));
  }
};
export default validate;
