import { prisma } from '../../prisma/client'

export async function getProjectMember(userId: string, projectId: string) {
  return prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId }
    }
  })
}

export async function isProjectAuth(userId: string, projectId: string) {
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId }
    }
  })

  return member?.role === 'AUTH'
}