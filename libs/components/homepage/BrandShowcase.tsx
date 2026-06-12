import Link from 'next/link';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export default function BrandShowcase() {
	return (
		<section className="brand-showcase animate-on-scroll" aria-labelledby="brand-showcase-title">
			<div className="brand-showcase__shapes" aria-hidden>
				<div className="brand-showcase__shape brand-showcase__shape--1" />
				<div className="brand-showcase__shape brand-showcase__shape--2" />
				<div className="brand-showcase__shape brand-showcase__shape--3" />
			</div>

			<div className="brand-showcase__container">
				<p className="brand-showcase__label">ABOUT PAWPAL</p>
				<div className="brand-showcase__grid">
				<div className="brand-showcase__content">
					<h2 id="brand-showcase-title" className="brand-showcase__title">
						<span className="brand-showcase__title-line brand-showcase__title-line--outline">
							Trusted
						</span>
						<span className="brand-showcase__title-line brand-showcase__title-line--outline">
							Pet Care
						</span>
						<span className="brand-showcase__title-line brand-showcase__title-line--solid">
							Made Simple
						</span>
					</h2>
					<p className="brand-showcase__description">
						From everyday walks and playtime to specialized medical care and
						training, PawPal connects pet parents with reliable, pre-vetted
						professionals. We believe in building lasting relationships based on
						trust, warmth, and a shared love for animals. Your pet&apos;s
						happiness and well-being are our top priority, always.
					</p>
					<Link href="/about" className="brand-showcase__btn">
						<span>Learn More</span>
						<ArrowForwardOutlinedIcon className="brand-showcase__btn-icon" aria-hidden />
					</Link>
				</div>

				<div className="brand-showcase__media">
					<div className="brand-showcase__frame">
						<img
							src="/images/about/brand-showcase.jpg"
							alt="A family spending time with their dogs outdoors"
							className="brand-showcase__img"
							onError={(e) => {
								e.currentTarget.src = '/img/listing/default-listing.webp';
							}}
						/>
						<button type="button" className="brand-showcase__play" aria-label="Play story">
							<PlayArrowIcon />
						</button>
					</div>
				</div>
				</div>
			</div>
		</section>
	);
}
