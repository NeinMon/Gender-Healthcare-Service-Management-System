// Cấu hình Swagger cho API
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const router = express.Router();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gender Healthcare Service Management API',
      version: '1.0.0',
      description: 'API documentation for Gender Healthcare Service Management System',
    },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

export default router;
