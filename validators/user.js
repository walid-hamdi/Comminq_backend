import Joi from "joi";

const registerSchema = Joi.object({
  name: Joi.string().required().label("Name"),
  email: Joi.string().email().required().label("Email"),
  password: Joi.string().min(6).required().label("Password"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().label("Email"),
  password: Joi.string().required().label("Password"),
});

const profileSchema = Joi.object({
  id: Joi.string().required().label("ID"),
});

const usersSchema = Joi.object({}).label("Users");

const updateSchema = Joi.object({
  name: Joi.string().optional().label("Name"),
  email: Joi.string().email().optional().label("Email"),
  picture: Joi.string().allow("").optional().label("Picture"),
  password: Joi.string().min(6).optional().label("Password"),
});

const deleteSchema = Joi.object({
  id: Joi.string().required().label("ID"),
});

const googleLoginSchema = Joi.object({
  name: Joi.string().required().label("Name"),
  email: Joi.string().email().required().label("Email"),
  picture: Joi.string().required().label("Picture"),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().label("Email"),
});

const changePasswordByCodeSchema = Joi.object({
  code: Joi.string().required().label("Code"),
  newPassword: Joi.string().min(6).required().label("New Password"),
});
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().label("Current Password"),
  newPassword: Joi.string().min(6).required().label("New Password"),
});

const changePasswordFromGoogleSchema = Joi.object({
  currentPassword: Joi.string().allow("").label("Current Password"),
  newPassword: Joi.string().min(6).required().label("New Password"),
});

export {
  registerSchema,
  loginSchema,
  profileSchema,
  usersSchema,
  updateSchema,
  deleteSchema,
  googleLoginSchema,
  forgotPasswordSchema,
  changePasswordByCodeSchema,
  changePasswordSchema,
  changePasswordFromGoogleSchema,
};
