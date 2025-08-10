import { PrismaClient } from '@prisma/client'
<<<<<<< HEAD
import { databaseConfig } from './config'
=======
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
<<<<<<< HEAD
    log: databaseConfig.log,
    datasources: {
      db: {
        url: databaseConfig.url,
      },
    },
=======
    log: ['query'],
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db