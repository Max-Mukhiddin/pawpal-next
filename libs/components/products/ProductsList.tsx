import React from 'react';
import { Stack } from '@mui/material';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';
import ProductCard from './ProductCard';

export interface ProductsListProps {
	properties: Property[];
	onLike: (user: T, id: string) => Promise<void>;
}

const ProductsList: React.FC<ProductsListProps> = ({ properties, onLike }) => (
	<Stack className={'products-catalog-page__grid'}>
		{properties?.length === 0 ? (
			<div className={'products-catalog-page__no-data'}>
				<img src="/img/icons/icoAlert.svg" alt="" />
				<p>No Products found!</p>
			</div>
		) : (
			properties.map((property: Property) => <ProductCard property={property} onLike={onLike} key={property._id} />)
		)}
	</Stack>
);

export default ProductsList;
