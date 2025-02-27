import prisma from '@/lib/prisma'
import ProductList from '../components/ProductList'

export default async function Home() {
  const productsData = await prisma.product.findMany({
    orderBy: {
      name: 'asc'
    }
  })
  
  // Buscar estoque separadamente
  for (const product of productsData) {
    const stockCount = await prisma.stock.count({
      where: {
        productId: product.id,
        isUsed: false
      }
    })
    ;(product as any).stockCount = stockCount
  }

  // E depois contar manualmente
  const products = productsData.map((product: any) => ({
    ...product,
    price: Number(product.price),
    stock: product.stockCount
  }))

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Nossos Produtos</h1>
      <ProductList products={products} />
    </main>
  )
} 