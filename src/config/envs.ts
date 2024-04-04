import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce
    .number()
    .positive()
    .max(65536, `Port should be >= 0 and < 65536`)
    .default(3000),
  DATABASE_URL: z.string({
    description: 'The URL of the database to connect to',
    required_error: 'DATABASE_URL is required',
  }),
});

export type Env = z.infer<typeof envSchema>;
