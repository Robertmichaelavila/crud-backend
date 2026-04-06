import { NextFunction, Request, Response } from 'express'
import { AuthService } from '../services/AuthService'

const service = new AuthService()

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET not defined')
}

const JWT_SECRET = process.env.JWT_SECRET

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body
      const result = await service.signup(name, email, password)
      res.status(201).json(result)
    } catch (error: any) {
      next(error)
    }
  }

  async signin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body
      const { user, token } = await service.signin(email, password);

      res.cookie('token', token, {
        httpOnly: true,          // inacessível via JavaScript (maior segurança)
        secure: JWT_SECRET === 'production', // HTTPS em produção
        sameSite: 'strict',         // protege contra CSRF
        path: '/',               // disponível em todas as rotas
        maxAge: 60 * 60 * 1000,  // 1 hora (mesmo tempo do JWT)
      });

      res.json({ user })
    } catch (error: any) {
      next(error)
    }
  }
}