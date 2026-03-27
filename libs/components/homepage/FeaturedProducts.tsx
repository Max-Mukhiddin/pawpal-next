import Link from 'next/link';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

const PRODUCTS = [
	{
		id: '1',
		title: 'Premium Dog Food',
		category: 'Nutrition',
		price: '$32.00',
		oldPrice: '$38.00',
		rating: '4.9',
		image: '/images/services/service-grooming.jpg',
	},
	{
		id: '2',
		title: 'Organic Cat Food',
		category: 'Nutrition',
		price: '$28.00',
		oldPrice: '$34.00',
		rating: '4.8',
		image: '/images/services/service-walking.jpg',
	},
	{
		id: '3',
		title: 'Pet Shampoo',
		category: 'Grooming',
		price: '$14.00',
		oldPrice: '$18.00',
		rating: '4.7',
		image: '/images/services/service-vet.jpg',
	},
	{
		id: '4',
		title: 'Training Toy Set',
		category: 'Training',
		price: '$22.00',
		oldPrice: '$27.00',
		rating: '4.8',
		image: '/images/services/service-training.jpg',
	},
	{
		id: '5',
		title: 'Adjustable Leash',
		category: 'Walking',
		price: '$16.00',
		oldPrice: '$20.00',
		rating: '4.6',
		image: '/images/services/service-boarding.jpg',
	},
	{
		id: '6',
		title: 'Cozy Pet Bed',
		category: 'Comfort',
		price: '$46.00',
		oldPrice: '$56.00',
		rating: '4.9',
		image: '/images/services/service-shop.jpg',
	},
] as const;

export default function FeaturedProducts() {
	return (
		<section className="pawpal-home-section featured-products-pawpal" aria-labelledby="pawpal-home-products-title">
			<div className="pawpal-home-section__inner featured-products-pawpal__inner">
				<header className="featured-products-pawpal__head">
					<div className="featured-products-pawpal__intro">
						<p className="featured-products-pawpal__eyebrow">Featured products</p>
						<h2 id="pawpal-home-products-title" className="featured-products-pawpal__title">
							Essentials pets love every day
						</h2>
						<p className="featured-products-pawpal__lead">
							From nutrition to comfort, discover quality picks trusted by PawPal families.
						</p>
					</div>
					<Link href="/products" className="featured-products-pawpal__browse">
						<span>Browse all products</span>
						<ArrowForwardOutlinedIcon className="featured-products-pawpal__browse-icon" aria-hidden />
					</Link>
				</header>

				<div className="featured-products-pawpal__grid">
					{PRODUCTS.map((product) => (
						<article key={product.id} className="featured-products-pawpal__card">
							<div className="featured-products-pawpal__media">
								<img src={product.image} alt={product.title} className="featured-products-pawpal__img" />
								<span className="featured-products-pawpal__chip">{product.category}</span>
							</div>
							<div className="featured-products-pawpal__body">
								<h3 className="featured-products-pawpal__name">{product.title}</h3>
								<div className="featured-products-pawpal__meta">
									<span className="featured-products-pawpal__price">{product.price}</span>
									<span className="featured-products-pawpal__old-price">{product.oldPrice}</span>
								</div>
								<div className="featured-products-pawpal__footer">
									<span className="featured-products-pawpal__rating">{"★"} {product.rating}</span>
									<button type="button" className="featured-products-pawpal__cta">
										<ShoppingBagOutlinedIcon className="featured-products-pawpal__cta-icon" />
										Add to cart
									</button>
								</div>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
