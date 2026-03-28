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

  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
        // não retorna password
      }
    })
  }

  async addToProject(data: {
    name: string
    email: string
    role: 'AUTH' | 'MEMBER'
    projectId: string
  }) {
    // 1. verifica se usuário já existe
    let user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    // 2. se não existir, cria
    if (!user) {
      const hash = await bcrypt.hash('123456', 10) // senha padrão

      user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hash,
          role: 'MEMBER'
        }
      })
    }

    // 3. evita duplicidade
    const existing = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: data.projectId
        }
      }
    })

    if (existing) {
      throw new Error('User already in project')
    }

    // 4. adiciona ao projeto
    return prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId: data.projectId,
        role: data.role
      }
    })
  }

  async getUserProjects(userId: string) {
    return prisma.projectMember.findMany({
      where: { userId },
      include: {
        project: true
      }
    })
  }
}