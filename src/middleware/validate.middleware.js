import { ApiError } from "../utils/ApiError";

const validate = (schema) => (req, res, next) => {
  try {
    const validatedata = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = validatedata.body;
    req.query = validatedata.query;
    req.params = validatedata.params;
    next();
  } catch (error) {
    const errorMessage = error.errors
      .map((details) => `${details.path.join(".")} is ${details.message}`)
      .join(", ");
    next(new ApiError(400, errorMessage || "Validation Error", error.errors));
  }
};
export default validate;
