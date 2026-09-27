import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

function isConnectionError(error: any): boolean {
  const message = error?.message || '';
  return (
    message.includes("Can't reach database server") ||
    message.includes('Connection terminated') ||
    error?.code === 'P1001'
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

prisma.$use(async (params, next) => {
  let attempts = 0;

  while (true) {
    try {
      return await next(params);
    } catch (error: any) {
      attempts++;

      if (isConnectionError(error) && attempts <= MAX_RETRIES) {
        console.warn(
          `Database connection issue (attempt ${attempts}/${MAX_RETRIES}), retrying in ${RETRY_DELAY_MS}ms...`
        );
        await delay(RETRY_DELAY_MS);
        continue;
      }

      throw error;
    }
  }
});