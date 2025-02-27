'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Product } from '@prisma/client';
import { Decimal } from 'decimal.js';
import type { product_type } from '@prisma/client/edge';

interface CartItem {
  id: number;
  name: string;
  price: Decimal;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addItem: (product: Product) => void
  removeItem: (productId: number) => void
  clearCart: () => void
  calculateTotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Carregar carrinho do localStorage ao iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  // Salvar carrinho no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (product: { 
    name: string; 
    id: number; 
    description: string | null; 
    price: Decimal; 
    type: product_type;
    createdAt: Date; 
    updatedAt: Date; 
    imageUrl: string | null; 
    profileFile: string | null; 
    isUsed: boolean; 
    userId: number | null; 
  }) => {
    const productToAdd: CartItem = {
      ...product,
      quantity: 1,
    };

    // Verificar se o produto já está no carrinho
    if (!items.find(item => item.id === productToAdd.id)) {
      setItems([...items, productToAdd]);
    }
  }

  const removeItem = (productId: number) => {
    setItems(items.filter(item => item.id !== productId))
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('cart')
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => total + Number(item.price), 0)
  }

  return (
    <CartContext.Provider value={{ items, setItems, addItem, removeItem, clearCart, calculateTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 