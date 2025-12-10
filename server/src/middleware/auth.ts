import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido. Configure a variável de ambiente.')
}

export interface AuthRequest extends Request {
  user?: {
    id: number
    email: string
    role: string
  }
}

// Middleware de autenticação
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string }

      // Buscar usuário
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.id))
        .limit(1)

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' })
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      }

      next()
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' })
    }
  } catch (error) {
    console.error('Erro na autenticação:', error)
    res.status(500).json({ error: 'Erro na autenticação' })
  }
}

// Middleware de autorização (verificar se é admin)
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' })
  }

  next()
}


