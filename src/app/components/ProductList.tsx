import { useRouter } from 'next/router';

// Defina a interface para o produto
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string; // Adicione outros campos conforme necessário
}

interface ProductListProps {
  products: Product[]; // Use a interface para tipar a propriedade products
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  const router = useRouter();

  const handleEdit = (productId: number) => {
    router.push(`/admin/products/${productId}`); // Use productId aqui
  };

  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>
          {product.name}
          <button onClick={() => handleEdit(product.id)}>Editar</button>
        </li>
      ))}
    </ul>
  );
};

export default ProductList; 