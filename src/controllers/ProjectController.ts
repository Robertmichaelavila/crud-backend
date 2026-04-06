import { NextFunction, Request, Response } from 'express'
import { ProjectService } from '../services/ProjectService'

const service = new ProjectService()

export class ProjectController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body
      const userId = req.user.id

      const project = await service.create(name, userId)
      res.json(project)
    } catch (error: any) {
      next(error)
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try{
      const userId = req.user.id

      const projects = await service.findAll(userId)
      res.json(projects)
    } catch (error: any) {
      next(error)
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const userId = req.user.id

      const project = await service.findOne(id, userId)
      if (!project) {
        return res.status(404).json({ error: 'Projeto não encontrado' })
      }
      res.json(project)
    } catch (error: any) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const result = await service.delete(id, userId);
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  }
}