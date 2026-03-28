// src/utils/permissions.ts
import { prisma } from '../../prisma/client'

export async function isProjectAuth(userId: string, projectId: string) {
  const member = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId
      }
    }
  })

  return member?.role === 'AUTH'
}