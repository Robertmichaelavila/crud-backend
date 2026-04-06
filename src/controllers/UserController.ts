import { NextFunction, Request, Response } from 'express'
import { UserService } from '../services/UserService'
import { isProjectAuth, getProjectMember } from '../utils/permissions'
import { prisma } from '../../prisma/client';
import jwt from 'jsonwebtoken'

const service = new UserService()

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await service.create(req.body)
      res.json(user)
    } catch (err) {
      next(err)
    }
  }

  async addToProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params
      const { name, email, role } = req.body
      const userId = req.user.id

      if (!(await isProjectAuth(userId, projectId))) {
        return res.status(403).json({ error: 'Only AUTH can add members' })
      }

      const result = await service.addToProject({
        name,
        email,
        role,
        projectId
      })
      
      res.json(result)
    } catch (error: any) {
      next(error)
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, userId } = req.params
      const requesterId = req.user.id

      if (!(await isProjectAuth(requesterId, projectId))) {
        return res.status(403).json({ error: 'Only AUTH can remove members' })
      }

      await service.removeFromProject(userId, projectId)
      res.json({ message: 'Removed' })
    } catch (error: any) {
      next(error)
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, userId } = req.params
      const { role } = req.body
      const requesterId = req.user.id

      console.log({ userId, projectId })

      if (!(await isProjectAuth(requesterId, projectId))) {
        return res.status(403).json({ error: 'Only AUTH can update roles' })
      }

      if (!['AUTH', 'MEMBER'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' })
      }

      const member = await getProjectMember(userId, projectId)
      if (!member) {
        return res.status(404).json({ error: 'Member not found' })
      }

      const result = await service.updateRole(userId, projectId, role)
      res.json(result)
    } catch (error: any) {
      next(error)
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await service.findAll()
      res.json(users)
    } catch (error: any) {
      next(error)
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      // O token vem do cookie httpOnly (precisa do cookie-parser)
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Verifica o token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      if (!decoded.id) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Busca o usuário no banco (sem a senha)
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          // inclua outros campos que deseja expor, mas nunca a senha
        },
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      // Token inválido ou erro de verificação
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      await service.updatePassword(userId, currentPassword, newPassword);
      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      await service.deleteUser(userId);
      // Limpa o cookie de autenticação
      res.clearCookie('token');
      res.json({ message: 'Conta deletada com sucesso' });
    } catch (error: any) {
      next(error);
    }
  }
}