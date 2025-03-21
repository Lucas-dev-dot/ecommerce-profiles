// Configuração da OpenPix
export const openpixConfig = {
    appId: process.env.OPENPIX_APP_ID || '',
    authKey: process.env.OPENPIX_AUTH_KEY || '',
    baseUrl: process.env.OPENPIX_BASE_URL || 'https://api.openpix.com.br/api/v1',
  };
  
  // Função para criar uma cobrança Pix
  export async function createPixCharge({
    correlationID,
    value,
    comment,
    expiresIn,
    customer,
  }: {
    correlationID: string;
    value: number;
    comment: string;
    expiresIn: number;
    customer: {
      name: string;
      email: string;
    };
  }) {
    try {
      const response = await fetch(`${openpixConfig.baseUrl}/charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': openpixConfig.authKey,
        },
        body: JSON.stringify({
          correlationID,
          value, // Valor em centavos
          comment,
          expiresIn, // Tempo de expiração em segundos
          customer,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar cobrança Pix');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar cobrança Pix:', error);
      throw error;
    }
  }
  
  // Função para consultar o status de uma cobrança
  export async function getPixChargeStatus(correlationID: string) {
    try {
      const response = await fetch(`${openpixConfig.baseUrl}/charge/${correlationID}`, {
        method: 'GET',
        headers: {
          'Authorization': openpixConfig.authKey,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao consultar cobrança Pix');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Erro ao consultar cobrança Pix:', error);
      throw error;
    }
  }
  