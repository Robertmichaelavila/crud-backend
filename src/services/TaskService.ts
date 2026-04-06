import { prisma } from '../../prisma/client'

export class TaskService {
  async create(data: {
    title: string
    description: string
    dueDate: Date
    projectId: string
    userId: string
  }) {
    // valida se o usuário pertence ao projeto
    const member = await prisma.projectMember.findFirst({
      where: {
        userId: data.userId,
        projectId: data.projectId
      }
    })

    if (!member) {
      throw new Error('User is not a member of this project')
    }

    return prisma.task.create({
      data
    })
  }

  async findAll(userId: string, projectId: string) {
    // 1. valida acesso ao projeto
    const member = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    })

    if (!member) {
      throw new Error('Access denied')
    }

    // 2. busca tasks
    return prisma.task.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }
}