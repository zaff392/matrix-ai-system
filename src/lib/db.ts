import { PrismaClient } from '@prisma/client'
import { databaseConfig } from './config'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: databaseConfig.log,
    datasources: {
      db: {
        url: databaseConfig.url,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db