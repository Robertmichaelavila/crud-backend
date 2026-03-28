import { Request, Response } from 'express'
import { TaskService } from '../services/TaskService'

const service = new TaskService()

export class TaskController {
  async create(req: Request, res: Response) {
    const { projectId } = req.params

    const task = await service.create({
      ...req.body,
      projectId
    })

    res.json(task)
  }

  async list(req: Request, res: Response) {
    const { projectId } = req.params
    const userId = req.user.id
    
    const tasks = await service.findAll(userId, projectId)
    res.json(tasks)
  }
}