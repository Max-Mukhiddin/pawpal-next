import Link from 'next/link';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

const ARTICLES = [
	{
		id: '1',
		category: 'Grooming',
		title: 'How to prepare your pet for grooming',
		excerpt: 'A calm, step-by-step routine to make grooming day safer, cleaner, and less stressful for your pet.',
		meta: '7 min read',
		image: '/images/services/service-grooming.jpg',
	},
	{
		id: '2',
		category: 'Activity',
		title: '5 signs your dog needs more daily activity',
		excerpt: 'Learn the everyday behavior cues that suggest your dog needs more movement, play, and stimulation.',
		meta: '5 min read',
		image: '/images/services/service-walking.jpg',
	},
	{
		id: '3',
		category: 'Nutrition',
		title: 'Choosing the right food for indoor cats',
		excerpt: 'A simple guide to balanced indoor nutrition, portion habits, and ingredient labels worth checking.',
		meta: '6 min read',
		image: '/images/services/service-vet.jpg',
	},
] as const;

export default function PetTipsSection() {
	return (
		<section
			className="pawpal-home-section pet-tips-pawpal animate-on-scroll"
			aria-labelledby="pawpal-home-tips-title"
		>
			<div className="pawpal-home-section__inner pet-tips-pawpal__inner">
				<header className="pet-tips-pawpal__head">
					<div className="pet-tips-pawpal__intro">
						<p className="pet-tips-pawpal__eyebrow">Pet care tips</p>
						<h2 id="pawpal-home-tips-title" className="pet-tips-pawpal__title">
							Trusted advice for healthier pets
						</h2>
						<p className="pet-tips-pawpal__lead">
							Practical reads from grooming, activity, and nutrition experts to support better daily care.
						</p>
					</div>
					<Link href="/blog" className="pet-tips-pawpal__browse">
						<span>View all articles</span>
						<ArrowForwardOutlinedIcon className="pet-tips-pawpal__browse-icon" aria-hidden />
					</Link>
				</header>

				<div className="pet-tips-pawpal__grid">
					{ARTICLES.map((article) => (
						<article key={article.id} className="pet-tips-pawpal__card">
							<div className="pet-tips-pawpal__media">
								<img src={article.image} alt={article.title} className="pet-tips-pawpal__img" />
								<span className="pet-tips-pawpal__chip">{article.category}</span>
							</div>
							<div className="pet-tips-pawpal__body">
								<h3 className="pet-tips-pawpal__card-title">{article.title}</h3>
								<p className="pet-tips-pawpal__excerpt">{article.excerpt}</p>
								<div className="pet-tips-pawpal__meta-row">
									<span className="pet-tips-pawpal__meta">{article.meta}</span>
									<Link href="/blog" className="pet-tips-pawpal__read">
										Read article
										<ArrowForwardOutlinedIcon className="pet-tips-pawpal__read-icon" aria-hidden />
									</Link>
								</div>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
