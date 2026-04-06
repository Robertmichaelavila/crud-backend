import { NextFunction, Request, Response } from 'express'
import { TaskService } from '../services/TaskService'
import { isProjectAuth } from '../utils/permissions'

const service = new TaskService()

export class TaskController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params
      const requesterId = req.user.id

      const isAuth = await isProjectAuth(requesterId, projectId)

      if (!isAuth) {
        return res.status(403).json({ error: 'Only AUTH can create tasks' })
      }

      const task = await service.create({
        ...req.body,
        projectId
      })

      res.json(task)
    } catch (error: any) {
      next(error)
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try{
      const { projectId } = req.params
      const userId = req.user.id
      
      const tasks = await service.findAll(userId, projectId)
      res.json(tasks)
    } catch (error: any) {
      next(error)
    }
  }
}