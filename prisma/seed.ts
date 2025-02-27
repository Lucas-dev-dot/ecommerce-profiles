import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const prisma = new PrismaClient();

// Obtenha o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  // Limpar dados existentes
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuário administrador
  const adminPassword = await hash('admin123', 12);
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      balance: 1000.00,
      isAdmin: true,
    },
  });

  console.log({ adminUser });

  // Criar usuário normal
  const normalPassword = await hash('john123', 12);
  const normalUser = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: normalPassword,
      balance: 500.00,
      isAdmin: false,
    },
  });

  console.log({ normalUser });

  // Criar perfis
  await prisma.product.createMany({
    data: [
      { name: 'Perfil Básico', price: 10.0, description: 'Perfil com funcionalidades básicas', type: 'PROFILE', userId: normalUser.id, imageUrl: '/imagens/perfil_basico.jpg' },
      { name: 'Perfil Avançado', price: 20.0, description: 'Perfil com funcionalidades avançadas', type: 'PROFILE', userId: normalUser.id, imageUrl: '/imagens/perfil_avancado.jpg' },
      { name: 'Perfil Premium', price: 30.0, description: 'Perfil com todas as funcionalidades', type: 'PROFILE', userId: normalUser.id, imageUrl: '/imagens/perfil_premium.jpg' },
    ],
  });

  // Criar proxies
  await prisma.product.createMany({
    data: [
      { name: 'Proxy Básico', price: 5.0, description: 'Proxy com velocidade básica', type: 'PROXY', userId: normalUser.id, imageUrl: '/imagens/proxy_basico.jpg' },
      { name: 'Proxy Avançado', price: 15.0, description: 'Proxy com velocidade média', type: 'PROXY', userId: normalUser.id, imageUrl: '/imagens/proxy_avancado.jpg' },
      { name: 'Proxy Premium', price: 25.0, description: 'Proxy com alta velocidade', type: 'PROXY', userId: normalUser.id, imageUrl: '/imagens/proxy_premium.jpg' },
    ],
  });

  console.log('Perfis e Proxies criados com sucesso!');
}

async function importStockData(filePath: string) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n');

    for (const line of lines) {
      const [productId, stockCount] = line.split(',');
      await prisma.stock.upsert({
        where: { id: parseInt(productId) },
        update: { quantity: parseInt(stockCount) },
        create: { productId: parseInt(productId), quantity: parseInt(stockCount), isUsed: false },
      });
    }

    console.log('Dados de estoque importados com sucesso!');
  } catch (error) {
    console.error('Erro ao importar dados de estoque:', error);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Chame a função com o caminho do arquivo .txt
importStockData(path.join(__dirname, 'estoque.txt'));

const products = await prisma.product.findMany({
  where: { type: 'PROFILE' }, // Filtra apenas os perfis
  take: 3, // Limita a 3 produtos por chamada
});