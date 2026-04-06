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
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        tasks: true
      }
    })
  }

  async findOne(projectId: string, userId: string) {
    return prisma.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        tasks: true
      }
    })
  }

  async delete(projectId: string, userId: string) {
    // 1. Verifica se o usuário é AUTH do projeto
    const authMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: userId,
        role: 'AUTH'
      }
    });

    if (!authMember) {
      throw new Error('Projeto não encontrado ou você não tem permissão para deletá-lo');
    }

    // 2. Deleta dependências e o projeto em uma transação
    await prisma.$transaction([
      prisma.task.deleteMany({ where: { projectId } }),
      prisma.projectMember.deleteMany({ where: { projectId } }),
      prisma.project.delete({ where: { id: projectId } })
    ]);

    return { message: 'Projeto deletado com sucesso' };
  }
}