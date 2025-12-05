import { db } from './index.js'
import { users } from './schema.js'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'

async function createAdminUsers() {
  try {
    const adminUsers = [
      {
        email: 'leomachadopt@gmail.com',
        password: 'Admin123',
        name: 'Leonardo Machado',
        role: 'admin' as const,
      },
      {
        email: 'martinscristiane73@hotmail.com',
        password: 'Admin123',
        name: 'Cristiane Martins',
        role: 'admin' as const,
      },
    ]

    for (const adminUser of adminUsers) {
      // Verificar se o usuário já existe
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, adminUser.email))
        .limit(1)

      if (existingUser) {
        console.log(`Usuário ${adminUser.email} já existe. Atualizando...`)
        // Atualizar senha e role
        const hashedPassword = await bcrypt.hash(adminUser.password, 10)
        await db
          .update(users)
          .set({
            password: hashedPassword,
            role: 'admin',
            name: adminUser.name,
            updatedAt: new Date(),
          })
          .where(eq(users.email, adminUser.email))
        console.log(`✓ Usuário ${adminUser.email} atualizado`)
      } else {
        // Criar novo usuário
        const hashedPassword = await bcrypt.hash(adminUser.password, 10)
        await db.insert(users).values({
          name: adminUser.name,
          email: adminUser.email,
          password: hashedPassword,
          role: 'admin',
        })
        console.log(`✓ Usuário ${adminUser.email} criado`)
      }
    }

    console.log('✓ Usuários admin criados/atualizados com sucesso!')
  } catch (error) {
    console.error('Erro ao criar usuários admin:', error)
    process.exit(1)
  }
}

createAdminUsers().then(() => {
  process.exit(0)
})

