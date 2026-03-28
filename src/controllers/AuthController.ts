import { Request, Response } from 'express'
import { AuthService } from '../services/AuthService'

const service = new AuthService()

export class AuthController {
  async signup(req: Request, res: Response) {
    const { name, email, password } = req.body
    const result = await service.signup(name, email, password)
    res.json(result)
  }

  async signin(req: Request, res: Response) {
    const { email, password } = req.body
    const result = await service.signin(email, password)
    res.json(result)
  }
}