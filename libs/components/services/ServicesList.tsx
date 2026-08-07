import React from 'react';
import type { Service } from '../../types/services/service';
import { T } from '../../types/common';
import ServiceCard from './ServiceCard';

export interface ServicesListProps {
	services: Service[];
	onLike: (user: T, id: string) => Promise<void>;
}

/** Catalog grid + empty state; keeps `services-catalog-page__grid` / `__no-data` classes. */
const ServicesList: React.FC<ServicesListProps> = ({ services, onLike }) => (
	<div className={'services-catalog-page__grid'}>
		{services?.length === 0 ? (
			<div className={'services-catalog-page__no-data'}>
				<span className="services-catalog-page__no-data-icon" aria-hidden>
					<img src="/img/icons/icoAlert.svg" alt="" />
				</span>
				<p>No Services found!</p>
			</div>
		) : (
			services.map((service: Service) => <ServiceCard service={service} onLike={onLike} key={service._id} />)
		)}
	</div>
);

export default ServicesList;
