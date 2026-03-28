import React from 'react';
import { Stack } from '@mui/material';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';
import ServiceCard from './ServiceCard';

export interface ServicesListProps {
	properties: Property[];
	onLike: (user: T, id: string) => Promise<void>;
}

/** Catalog grid + empty state; keeps `services-catalog-page__grid` / `__no-data` classes. */
const ServicesList: React.FC<ServicesListProps> = ({ properties, onLike }) => (
	<Stack className={'services-catalog-page__grid'}>
		{properties?.length === 0 ? (
			<div className={'services-catalog-page__no-data'}>
				<img src="/img/icons/icoAlert.svg" alt="" />
				<p>No Services found!</p>
			</div>
		) : (
			properties.map((property: Property) => <ServiceCard property={property} onLike={onLike} key={property._id} />)
		)}
	</Stack>
);

export default ServicesList;
