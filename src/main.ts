import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';
import { ResponseInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },

      exceptionFactory: (errors) => {
        const formattedErrors = {};

        errors.forEach((error) => {
          if (error.constraints) {
            formattedErrors[error.property] = Object.values(error.constraints);
          }
        });

        return new BadRequestException({
          code: 400,
          status: 'BAD_REQUEST',
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  );

  app.enableCors();

  await app.listen(process.env.PORT ?? 3002);
  console.log(`🚀 Application running on port ${process.env.PORT ?? 3002}`);
}

bootstrap();
