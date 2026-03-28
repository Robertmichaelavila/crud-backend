import { Request, Response } from 'express'
import { ProjectService } from '../services/ProjectService'

const service = new ProjectService()

export class ProjectController {
  async create(req: Request, res: Response) {
    const { name } = req.body
    const userId = req.user.id

    const project = await service.create(name, userId)
    res.json(project)
  }

  async list(req: Request, res: Response) {
    const userId = req.user.id

    const projects = await service.findAll(userId)
    res.json(projects)
  }
}