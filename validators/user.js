import Joi from "joi";

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const profileSchema = Joi.object({
  id: Joi.string().required(),
});

const usersSchema = Joi.object({});

const updateSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  picture: Joi.string().allow(""),
  password: Joi.string().min(6).required(),
});

const deleteSchema = Joi.object({
  id: Joi.string().required(),
});

const googleLoginSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  picture: Joi.string().required(),
});

export {
  registerSchema,
  loginSchema,
  profileSchema,
  usersSchema,
  updateSchema,
  deleteSchema,
  googleLoginSchema,
};
