import { prisma } from '../../prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export class AuthService {
  async signup(name: string, email: string, password: string) {
    const user = await prisma.user.findFirst({
      where: { email }
    })
    
    if (user) throw new Error('User already exists')

    const hash = await bcrypt.hash(password, 10)
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hash,
          role: 'AUTH'
        }
      })

      return { user }
    } catch (error: any) {
      throw new Error('Error creating user')
    }    
  }

  async signin(email: string, password: string) {
    const user = await prisma.user.findFirst({
      where: { email }
    })

    if (!user) throw new Error('User not found')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new Error('Invalid password')

    try {
      const token = jwt.sign({ id: user.id }, JWT_SECRET!, { expiresIn: '1h' })

      return { user, token }
    } catch (error: any) {
      throw new Error('Error signing in')
    }
  }
}