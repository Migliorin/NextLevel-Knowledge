
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle('NextLevel Knowledge Backend API')
  .setDescription(
    'Backend oficial da plataforma NextLevel Knowledge. Fornece endpoints para autenticação, gerenciamento de usuários, comunicação com o serviço de IA Efficient RAG e suporte às funcionalidades de busca, recuperação e geração de respostas contextualizadas.',
  )
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Informe o token JWT',
    },
    'jwt',
  )
  .setVersion('1.0.0')
  .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();