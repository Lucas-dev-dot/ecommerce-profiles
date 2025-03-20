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
    <main className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c]">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Nossos Produtos</h1>
          <div className="w-24 h-1 bg-[#2c2979] mx-auto mb-6"></div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Descubra nossa seleção exclusiva de produtos premium
          </p>
        </header>
        
        <ProductList products={products} />
      </div>
    </main>
  )
}
