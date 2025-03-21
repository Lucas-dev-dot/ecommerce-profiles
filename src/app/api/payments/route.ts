import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Redirecionar para a rota correta
  const url = new URL('/api/payments/pix', request.url);
  
  // Encaminhar a requisição para a rota correta
  const response = await fetch(url, {
    method: 'POST',
    headers: request.headers,
    body: request.body,
  });
  
  // Retornar a resposta da rota correta
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
