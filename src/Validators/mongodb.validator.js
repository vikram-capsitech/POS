import { body, param } from 'express-validator';

// Validator to ensure MongoDB IDs passed in the URL's path variable are valid
export const mongoIdPathVariableValidator = (idName) => {
  return [
    param(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`),
  ];
};

// Validator to ensure MongoDB IDs passed in the request body are valid
export const mongoIdRequestBodyValidator = (idName) => {
  return [
    body(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`),
  ];
};
