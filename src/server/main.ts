import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
// import { IoAdapter } from '@nestjs/platform-socket.io';
import { SocketIoAdapter } from './adapters/socket-io.adapter';
import { AppModule } from './app.module';

async function bootstrap(): Promise<INestApplication> {
    config();
    const app = await NestFactory.create(AppModule);
    app.useWebSocketAdapter(new SocketIoAdapter(app));
    app.listen(process.env.BROKER_PORT || 3000, process.env.BROKER_HOST || '127.0.0.1');
    return app;
}
bootstrap();
