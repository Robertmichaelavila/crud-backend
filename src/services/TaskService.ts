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
        projectId: data.projectId,
        userId: data.userId
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
    return prisma.task.findMany({
      where: {
        projectId,
        project: {
          members: {
            some: { userId }
          }
        }
      }
    })
  }
}