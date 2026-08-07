import React from 'react';
import type { Product } from '../../types/products/product';
import { T } from '../../types/common';
import ProductCard from './ProductCard';

export interface ProductsListProps {
	products: Product[];
	onLike: (user: T, id: string) => Promise<void>;
}

const ProductsList: React.FC<ProductsListProps> = ({ products, onLike }) => (
	<div className={'products-catalog-page__grid'}>
		{products?.length === 0 ? (
			<div className={'products-catalog-page__no-data'}>
				<span className="products-catalog-page__no-data-icon" aria-hidden>
					<img src="/img/icons/icoAlert.svg" alt="" />
				</span>
				<p>No Products found!</p>
			</div>
		) : (
			products.map((product: Product) => <ProductCard product={product} onLike={onLike} key={product._id} />)
		)}
	</div>
);

export default ProductsList;
