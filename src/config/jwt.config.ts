import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export default registerAs('jwt', (): JwtConfig => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing');
  }
  if (!expiresIn) {
    throw new Error('JWT_EXPIRES_IN environment variable is missing');
  }

  return {
    secret,
    expiresIn,
  };
});
