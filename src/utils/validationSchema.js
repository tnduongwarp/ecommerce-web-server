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

const productBodyValidation = (body) => {
    const schema = Joi.object({
        category: Joi.string().required(),
        owner: Joi.string().required(),
        image: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required(),
        amount: Joi.number().required()
    });
    return schema.validate(body);
}
const reviewBodyValidation = (body) => {
    const schema = Joi.object({
        owner: Joi.string().required(),
        productIds: Joi.array().required(),
        description: Joi.string().required(),
        rating: Joi.number().required(),
        orderId: Joi.string().required()
    });
    return schema.validate(body);
}
const addToCartBodyValidation = (body) => {
    const schema = Joi.object({
        owner: Joi.string().required(),
        productId: Joi.string().required(),
        quantity: Joi.number().required(),
    });
    return schema.validate(body);
}
const createOrderBodyValidation = (body) => {
    const schema = Joi.object({
        owner: Joi.string().required(),
        address: Joi.string().required(),
        totalPrice: Joi.number().required(),
        products: Joi.array().min(1).required(),
        paymentType: Joi.number().required(),
        note: Joi.string().optional().allow('', null)
    });
    return schema.validate(body);
}

const createBidBodyValidation = (body) => {
    const schema = Joi.object({
        owner: Joi.string().required(),
        products: Joi.array().required(),
        price: Joi.number().required(),
    });
    return schema.validate(body);
}

export {
    signUpBodyValidation,
    logInBodyValidation,
    refreshTokenBodyValidation,
    productBodyValidation,
    reviewBodyValidation,
    addToCartBodyValidation,
    createOrderBodyValidation,
    createBidBodyValidation
};