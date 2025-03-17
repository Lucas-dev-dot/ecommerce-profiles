'use client'

import { useEffect, useState } from 'react'

interface User {
  id: number
  name: string
  email: string
  balance: number
  createdAt: string
  _count: {
    orders: number
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data))
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {users.map(user => (
        <div key={user.id} className="border rounded-lg p-4 shadow">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-600">
              Saldo: R$ {user.balance}
            </p>
            <p className="text-sm text-gray-600">
              Pedidos: {user._count.orders}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
