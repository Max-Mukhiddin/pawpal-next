export default function BrandShowcase() {
	return (
		<section className="pawpal-home-section pawpal-home-section--brand" aria-labelledby="pawpal-home-brand-title">
			<div className="pawpal-home-section__inner">
				<h2 id="pawpal-home-brand-title" className="pawpal-home-section__title">
					PawPal in motion
				</h2>
				<p className="pawpal-home-section__lead">
					A quick look at how our team delivers calm, trusted care experiences for pets and their people.
				</p>
				<div className="pawpal-home-section__media-slot" aria-label="PawPal brand showcase video">
					<video
						className="pawpal-home-section__media-video"
						src="/video/ads.mov"
						autoPlay
						muted
						loop
						playsInline
					/>
				</div>
			</div>
		</section>
	);
}
