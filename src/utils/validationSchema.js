import Joi from "joi";

const signUpBodyValidation = (body) => {
    const schema = Joi.object({
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        role: Joi.string().required()
    });
    return schema.validate(body);
};

const logInBodyValidation = (body) => {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
    });
    return schema.validate(body);
};

const refreshTokenBodyValidation = (body) => {
    const schema = Joi.object({
        refreshToken: Joi.string().required(),
    });
    return schema.validate(body);
};

export {
    signUpBodyValidation,
    logInBodyValidation,
    refreshTokenBodyValidation,
};