import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpar dados existentes
  await prisma.stock.deleteMany();
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
      { name: 'Perfil Pro', price: 10.0, description: 'Perfil com funcionalidades básicas', type: 'PROFILE', userId: normalUser.id, imageUrl: 'perfil_pro.png' },
      { name: 'Business Manager', price: 20.0, description: 'Perfil com funcionalidades avançadas', type: 'PROFILE', userId: normalUser.id, imageUrl: 'business_manager.png' },
      { name: 'Perfil Expert', price: 30.0, description: 'Perfil com todas as funcionalidades', type: 'PROFILE', userId: normalUser.id, imageUrl: 'perfil_expert.png' },
    ],
  });

  // Criar proxies - Agora usando o mesmo formato que os perfis
  await prisma.product.createMany({
    data: [
      { name: 'Proxy IPV4 SOCKS5', price: 5.0, description: 'Proxy com velocidade básica', type: 'PROXY', userId: normalUser.id, imageUrl: 'proxy_básico.png' },
      { name: 'Proxy IPV6 SOCKS5', price: 15.0, description: 'Proxy com velocidade média', type: 'PROXY', userId: normalUser.id, imageUrl: 'proxy_avancado.png' },
      { name: 'Proxy IPV6 HTTP', price: 25.0, description: 'Proxy com alta velocidade', type: 'PROXY', userId: normalUser.id, imageUrl: 'proxy_premium.png' },
    ],
  });

  console.log('Perfis e Proxies criados com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
