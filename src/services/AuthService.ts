import { prisma } from '../../prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export class AuthService {
  async signup(name: string, email: string, password: string) {
    const hash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hash,
        role: 'AUTH'
      }
    })

    const token = jwt.sign({ id: user.id }, JWT_SECRET)

    return { user, token }
  }

  async signin(email: string, password: string) {
    const user = await prisma.user.findFirst({
      where: { email }
    })

    if (!user) throw new Error('User not found')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new Error('Invalid password')

    const token = jwt.sign({ id: user.id }, JWT_SECRET)

    return { user, token }
  }
}