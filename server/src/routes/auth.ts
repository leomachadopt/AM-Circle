import { Router } from 'express'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    // Buscar usuário por email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos' })
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou senha inválidos' })
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Retornar dados do usuário (sem senha) e token
    const { password: _, ...userWithoutPassword } = user
    res.json({
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    res.status(500).json({ error: 'Erro ao fazer login' })
  }
})

// Verificar token (usado para verificar se o usuário está autenticado)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string }

      // Buscar usuário atualizado
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.id))
        .limit(1)

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' })
      }

      const { password: _, ...userWithoutPassword } = user
      res.json({ user: userWithoutPassword })
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' })
    }
  } catch (error) {
    console.error('Erro ao verificar token:', error)
    res.status(500).json({ error: 'Erro ao verificar token' })
  }
})

export default router


