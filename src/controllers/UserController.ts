import { Request, Response } from 'express'
import { UserService } from '../services/UserService'
import { isProjectAuth } from '../utils/permissions'

const service = new UserService()

export class UserController {
  async create(req: Request, res: Response) {
    const user = await service.create(req.body)
    res.json(user)
  }

  async addToProject(req: Request, res: Response) {
    const { projectId } = req.params
    const { name, email, role } = req.body
    const userId = req.user.id

    // valida permissão
    const isAuth = await isProjectAuth(userId, projectId)
    if (!isAuth) {
      return res.status(403).json({ error: 'Only AUTH can add members' })
    }

    const result = await service.addToProject({
      name,
      email,
      role,
      projectId
    })

    res.json(result)
  }

  async list(req: Request, res: Response) {
    const users = await service.findAll()
    res.json(users)
  }
}