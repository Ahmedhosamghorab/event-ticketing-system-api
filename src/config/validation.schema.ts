import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  PORT: Joi.number().integer().positive().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'dev', 'prod')
    .default('development'),
  APP_NAME: Joi.string().default('Event Ticketing System'),

  // Database
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().integer().positive().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_DATABASE: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
  DB_SSL: Joi.boolean().default(false),
  DB_RETRY_ATTEMPTS: Joi.number().integer().positive().default(10),
  DB_RETRY_DELAY: Joi.number().integer().positive().default(3000),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
});
