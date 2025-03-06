'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart } from 'lucide-react'
// import { ProductType } from '@prisma/client'
import { CartItem } from '../types'
import { Decimal } from 'decimal.js'
import Image from 'next/image'

export default function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [balance, setBalance] = useState<number>(0)
  const { items, setItems }: { items: CartItem[], setItems: React.Dispatch<React.SetStateAction<CartItem[]>> } = useCart()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBalance() {
      if (session?.user) {
        try {
          const response = await fetch('/api/balance')
          if (!response.ok) throw new Error('Erro ao carregar saldo')
          const data = await response.json()
          setBalance(Number(data.balance))
        } catch (error) {
          console.error('Erro ao carregar saldo:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadBalance()
  }, [session])

  // Calculate total items
  const totalItems = items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const addItem = (item: { id: number; name: string; price: number; }) => {
    const newItem: CartItem = {
      ...item,
      price: new Decimal(item.price),
      quantity: 1,
    };
    setItems((prevItems) => [...prevItems, newItem]);
  };

  return (
    <header className="bg-gray-600   text-white">
      <nav className="container mx-auto px-2 py-2">
        <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold flex items-center">
          <Image 
            src="/imagens/vision_logo.png" 
            alt="Vision Contigencia"
            width={150}
            height={40}
            priority
            className="object-contain"
          />
        </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/products"
              className={`hover:text-gray-300 ${pathname === '/products' ? 'text-blue-400' : ''}`}
            >
              Produtos
            </Link>
            
            {session ? (
              <>
                <span className="text-gray-300">
                  {session.user?.email}
                </span>
                {!loading && (
                  <span className="text-green-400">
                    R$ {balance.toFixed(2)}
                  </span>
                )}
                <Link 
                  href="/dashboard"
                  className={`hover:text-gray-300 ${pathname === '/dashboard' ? 'text-blue-400' : ''}`}
                >
                  Minha Conta
                </Link>
                {session.user?.isAdmin && (
                  <>
                    <Link
                      href="/admin"
                      className={`hover:text-gray-300 ${pathname === '/admin' ? 'text-blue-400' : ''}`}
                    >
                      Admin
                    </Link>
                    <Link
                      href="/admin/products/manage"
                      className={`hover:text-gray-300 ${pathname === '/admin/products/manage' ? 'text-blue-400' : ''}`}
                    >
                      Gerenciar Perfis
                    </Link>
                    <Link
                      href="/admin/users"
                      className={`hover:text-gray-300 ${pathname === '/admin/users' ? 'text-blue-400' : ''}`}
                    >
                      Usuários
                    </Link>
                  </>
                )}
                <Link
                  href="/cart"
                  className="relative hover:text-gray-300"
                >
                  <ShoppingCart size={24} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <Link
                  href="/add-balance"
                  className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Adicionar Saldo
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="bg-green-600 px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Registrar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
} 