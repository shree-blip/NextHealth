import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { PrismaClient } from '@prisma/client';
import AdminJSPrisma from '@adminjs/prisma';

AdminJS.registerAdapter({ Database: AdminJSPrisma.Database, Resource: AdminJSPrisma.Resource });

const prisma = new PrismaClient();

const adminJs = new AdminJS({
  databases: [prisma],
  rootPath: '/admin',
  branding: {
    companyName: 'NexHealth Marketing Admin',
  },
});

const router = AdminJSExpress.buildRouter(adminJs);

const app = express();
app.use(adminJs.options.rootPath, router);

const port = process.env.ADMIN_PORT || 3001;
app.listen(port, () => {
  console.log(`AdminJS is under http://localhost:${port}${adminJs.options.rootPath}`);
});
