import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { EnvModule } from './env/env.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './config/envs';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    ProductsModule,
    EnvModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
