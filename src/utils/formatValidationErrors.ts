import { ValidationError } from "express-validator";

const formatValidationErrors = (errors: ValidationError[]) => {
    const messages: string[] = [];
    errors.forEach((error) => {
        messages.push(error.msg);
    });
    return messages;
};
export default formatValidationErrors;
