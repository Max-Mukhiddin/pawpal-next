import Link from 'next/link';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

const BRAND_IMAGE = '/img/banner/services.webp';

export default function BrandShowcase() {
	return (
		<section className="section-pawpal section-pawpal--white brand-showcase-pawpal animate-on-scroll" aria-labelledby="brand-showcase-title">
			<div className="section-container">
				<div className="brand-showcase-pawpal__layout pawpal-card">
					<div className="brand-showcase-pawpal__copy">
						<p className="section-label">ABOUT PAWPAL</p>
						<h2 id="brand-showcase-title" className="section-title">
							Trusted pet care, made simple
						</h2>
						<p className="section-subtitle">
							From everyday walks to specialist care, PawPal connects pet parents with warm, reliable
							professionals in one easy experience.
						</p>
						<Link href="/about" className="section-action">
							Learn more
							<ArrowForwardOutlinedIcon fontSize="small" />
						</Link>
					</div>

					<div className="brand-showcase-pawpal__media" aria-label="PawPal care video preview">
						<img
							src={BRAND_IMAGE}
							alt="Happy pet receiving loving care from a PawPal specialist"
							onError={(e) => {
								e.currentTarget.src = '/img/listing/default-listing.webp';
							}}
						/>
						<span className="brand-showcase-pawpal__play" aria-hidden>
							▶
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
