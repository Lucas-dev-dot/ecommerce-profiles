import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

// Defina a interface para o produto
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string; // Adicione outros campos conforme necessário
}

interface Stock {
  id: number;
  productId: number;
  quantity: number;
}

const ProductManagement = () => {
  const router = useRouter();
  const { productId } = router.query; // Obtenha o productId da URL
  const [product, setProduct] = useState<Product | null>(null);
  const [stock, setStock] = useState<Stock[]>([]);
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, quantity: 0 });

  // Verifique se a sessão está carregada e se o usuário está autenticado
  if (status === 'loading') {
    return <div>Carregando...</div>; // Ou uma mensagem de loading
  }

  if (!session) {
    return <div>Você não está autenticado.</div>;
  }

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        const response = await fetch(`/api/admin/products/${productId}`);
        const data = await response.json();
        if (response.ok) {
          setProduct(data);
        } else {
          console.error('Erro ao carregar produto:', data.error);
        }
      };

      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      const fetchStock = async () => {
        const response = await fetch(`/api/admin/products/${productId}/stock`);
        const data = await response.json();
        if (response.ok) {
          setStock(data);
        } else {
          console.error('Erro ao carregar estoque:', data.error);
        }
      };

      fetchStock();
    }
  }, [productId]);

  useEffect(() => {
    if (session) {
      const fetchProducts = async () => {
        const response = await fetch('/api/admin/products');
        const data = await response.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('Erro ao carregar produtos:', data.error);
        }
      };

      fetchProducts();
    }
  }, [session]);

  const handleAddProductToStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api/admin/products/${productId}/stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: productId,
        quantity: newProduct.quantity, // Use a quantidade do novo produto
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setStock(prevStock => [...prevStock, data]); // Adiciona o novo item ao estoque
      setNewProduct({ name: '', price: 0, quantity: 0 }); // Limpa o formulário
    } else {
      console.error('Erro ao adicionar ao estoque:', data.error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProduct),
    });
    const data = await response.json();
    if (response.ok) {
      setProducts(prevProducts => [...prevProducts, data]); // Adiciona o novo produto à lista
      setNewProduct({ name: '', price: 0, quantity: 0 }); // Limpa o formulário
    } else {
      console.error('Erro ao adicionar produto:', data.error);
    }
  };

  if (!product) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Gerenciar Produto</h1>
      <h2>{product.name}</h2>
      <p>Preço: {product.price}</p>
      <p>Descrição: {product.description}</p>
      {/* Adicione mais campos conforme necessário */}
      <h1>Gerenciar Estoque</h1>
      {stock.map(item => (
        <div key={item.id}>
          <p>Produto ID: {item.productId}</p>
          <p>Quantidade: {item.quantity}</p>
          {/* Adicione mais informações conforme necessário */}
        </div>
      ))}
      <h2>Adicionar ao Estoque</h2>
      <form onSubmit={handleAddProductToStock}>
        <input
          type="number"
          placeholder="Quantidade"
          value={newProduct.quantity}
          onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })}
        />
        <button type="submit">Adicionar ao Estoque</button>
      </form>
      <h1>Adicionar Novo Produto</h1>
      <form onSubmit={handleAddProduct}>
        <input
          type="text"
          placeholder="Nome do Produto"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Preço"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
        />
        <button type="submit">Adicionar Produto</button>
      </form>
    </div>
  );
};

export default ProductManagement; 