import { Router } from 'express'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { uploadAvatar, compressAvatar } from '../middleware/upload-avatar.js'
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js'
import bcrypt from 'bcrypt'
import fs from 'fs'

const router = Router()

// Obter todos os usuários (apenas admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const allUsers = await db.select().from(users)
    // Remover senhas da resposta
    const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user)
    res.json(usersWithoutPasswords)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    res.status(500).json({ error: 'Erro ao buscar usuários' })
  }
})

// Obter usuário por ID (próprio usuário ou admin)
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.id)

    // Verificar se o usuário pode ver (próprio perfil ou admin)
    if (req.user!.id !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const { password: _, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    res.status(500).json({ error: 'Erro ao buscar usuário' })
  }
})

// Criar novo usuário (apenas admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role, avatar, progress } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        avatar,
        progress: progress || 0,
      })
      .returning()

    const { password: _, ...userWithoutPassword } = newUser
    res.status(201).json(userWithoutPassword)
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Este email já está em uso' })
    }
    res.status(500).json({ error: 'Erro ao criar usuário' })
  }
})

// Upload de avatar
router.post('/:id/avatar', uploadAvatar.single('avatar'), compressAvatar, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    }

    const userId = parseInt(req.params.id)
    
    // Verificar se o arquivo foi convertido para JPEG (avatares são sempre convertidos)
    let filename = req.file.filename
    const filePath = req.file.path
    const jpegPath = filePath.replace(/\.[^.]+$/, '.jpg')
    
    // Se foi convertido para JPEG, usar o nome JPEG
    if (fs.existsSync(jpegPath) && jpegPath !== filePath) {
      filename = filename.replace(/\.[^.]+$/, '.jpg')
    }
    
    const avatarUrl = `/uploads/avatars/${filename}`

    // Atualizar avatar do usuário
    const [updatedUser] = await db
      .update(users)
      .set({
        avatar: avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning()

    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    res.json({ avatar: avatarUrl, user: updatedUser })
  } catch (error: any) {
    console.error('Erro ao fazer upload do avatar:', error)
    if (error.message) {
      return res.status(400).json({ error: error.message })
    }
    res.status(500).json({ error: 'Erro ao fazer upload do avatar' })
  }
})

// Alterar senha (próprio usuário)
router.put('/:id/password', authenticate, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = parseInt(req.params.id)

    // Verificar se o usuário pode alterar (apenas próprio perfil)
    if (req.user!.id !== userId) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' })
    }

    // Validar força da nova senha
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' })
    }

    // Buscar usuário com senha
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Senha atual incorreta' })
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Atualizar senha
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    res.json({ success: true, message: 'Senha alterada com sucesso' })
  } catch (error: any) {
    console.error('Erro ao alterar senha:', error)
    res.status(500).json({ error: 'Erro ao alterar senha' })
  }
})

// Atualizar usuário (próprio usuário ou admin)
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, email, password, role, avatar, progress } = req.body
    const userId = parseInt(req.params.id)

    // Verificar se o usuário pode atualizar (próprio perfil ou admin)
    if (req.user!.id !== userId && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    // Construir objeto de atualização apenas com campos fornecidos
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (avatar !== undefined) updateData.avatar = avatar
    if (progress !== undefined) updateData.progress = progress

    // Apenas admin pode alterar role
    if (role !== undefined && req.user!.role === 'admin') {
      updateData.role = role
    }

    // Se forneceu senha, fazer hash (apenas para admin alterar senha de outros usuários)
    if (password && req.user!.role === 'admin' && req.user!.id !== userId) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning()

    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const { password: _, ...userWithoutPassword } = updatedUser
    res.json(userWithoutPassword)
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Este email já está em uso' })
    }
    res.status(500).json({ error: 'Erro ao atualizar usuário' })
  }
})

// Deletar usuário (apenas admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id)

    // Não permitir deletar a si mesmo
    if ((req as AuthRequest).user!.id === userId) {
      return res.status(400).json({ error: 'Não é possível deletar seu próprio usuário' })
    }

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning()

    if (!deletedUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const { password: _, ...userWithoutPassword } = deletedUser
    res.json({ success: true, user: userWithoutPassword })
  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    res.status(500).json({ error: 'Erro ao deletar usuário' })
  }
})

export default router


