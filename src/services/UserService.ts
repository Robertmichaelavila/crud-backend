import { prisma } from '../../prisma/client'
import bcrypt from 'bcryptjs'

export class UserService {
  async create(data: {
    name: string
    email: string
    password: string
    role: 'AUTH' | 'MEMBER'
  }) {
    return prisma.user.create({
      data
    })
  }

  async addToProject(data: {
    name: string
    email: string
    role: 'AUTH' | 'MEMBER'
    projectId: string
  }) {
    let user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (!user) {
      const hash = await bcrypt.hash('123456', 10)

      user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hash,
          role: 'MEMBER'
        }
      })
    }

    const exists = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: data.projectId
        }
      }
    })

    if (exists) throw new Error('User already in project')

    return prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId: data.projectId,
        role: data.role
      }
    })
  }

  async removeFromProject(userId: string, projectId: string) {
    return prisma.projectMember.delete({
      where: {
        userId_projectId: { userId, projectId }
      }
    })
  }

  async updateRole(userId: string, projectId: string, role: 'AUTH' | 'MEMBER') {
    return prisma.projectMember.update({
      where: {
        userId_projectId: { userId, projectId }
      },
      data: { role }
    })
  }

  async findAll() {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    })
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuário não encontrado');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new Error('Senha atual incorreta');

    const hashed = await bcrypt.hash(newPassword, 10);
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashed }
    });
  }

  async deleteUser(userId: string) {
    // 1. Projetos onde o usuário é AUTH (dono)
    const ownedProjects = await prisma.project.findMany({
      where: {
        members: {
          some: { userId, role: 'AUTH' }
        }
      },
      select: { id: true }
    });
    const ownedProjectIds = ownedProjects.map(p => p.id);

    // 2. Deletar projetos onde é AUTH e suas dependências (tarefas e membros)
    if (ownedProjectIds.length) {
      await prisma.$transaction([
        prisma.task.deleteMany({ where: { projectId: { in: ownedProjectIds } } }),
        prisma.projectMember.deleteMany({ where: { projectId: { in: ownedProjectIds } } }),
        prisma.project.deleteMany({ where: { id: { in: ownedProjectIds } } })
      ]);
    }

    // 3. Remover vínculos onde o usuário é MEMBER (nos projetos restantes)
    await prisma.projectMember.deleteMany({
      where: { userId, role: 'MEMBER' }
    });

    // 4. Deletar o usuário
    return prisma.user.delete({ where: { id: userId } });
  }
}