import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    
    const { code, items } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Código do cupom é obrigatório' });
    }
    
    // Buscar o cupom pelo código
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
      },
    });
    
    if (!coupon) {
      return res.status(404).json({ error: 'Cupom não encontrado' });
    }
    
    // Verificar se o cupom já atingiu o limite de usos
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ error: 'Cupom já atingiu o limite de usos' });
    }
    
    // Verificar se o cupom está expirado
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Cupom expirado' });
    }
    
    // Verificar se o cupom é específico para um produto
    if (coupon.productId) {
      const hasValidProduct = items.some((item: any) => item.productId === coupon.productId);
      
      if (!hasValidProduct) {
        return res.status(400).json({ error: 'Cupom válido apenas para produtos específicos' });
      }
    }
    
    // Retornar o cupom válido
    return res.status(200).json({
      coupon: {
        code: coupon.code,
        discount: Number(coupon.discount),
        type: coupon.type,
      }
    });
    
  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    return res.status(500).json({ error: 'Erro ao validar cupom' });
  }
}
