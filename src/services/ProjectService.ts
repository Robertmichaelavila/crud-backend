import { prisma } from '../../prisma/client'

export class ProjectService {
  async create(name: string, userId: string) {
    return prisma.project.create({
      data: {
        name,
        members: {
          create: {
            userId,
            role: 'AUTH'
          }
        }
      },
      include: {
        members: true
      }
    })
  }

  async findAll(userId: string) {
    return prisma.project.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        tasks: true
      }
    })
  }
}