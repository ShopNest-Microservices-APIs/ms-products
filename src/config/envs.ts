import 'dotenv/config';
import { z, object } from 'zod';

interface EnvVars {
  PORT: number;
  NATS_SERVERS: string[];
}

const envsSchema = object({
  PORT: z.coerce
    .number()
    .positive()
    .max(65536, `Port should be >= 0 and < 65536`)
    .default(3000),

  NATS_SERVERS: z.array(
    z.string({
      required_error: `NATS_SERVERS is required`,
    }),
  ),
});

const envVars = envsSchema.parse({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
}) as EnvVars;

export const Envs = {
  ENVIRONMENT: {
    PORT: envVars.PORT,
  },
  NATS: {
    SERVERS: envVars.NATS_SERVERS,
  },
};
