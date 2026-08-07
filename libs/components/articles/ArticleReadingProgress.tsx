type ArticleReadingProgressProps = {
	progress: number;
};

export default function ArticleReadingProgress({ progress }: ArticleReadingProgressProps) {
	const clamped = Math.min(100, Math.max(0, progress));

	return (
		<div className="pp-adetail-progress" aria-hidden>
			<div className="pp-adetail-progress__fill" style={{ width: `${clamped}%` }} />
		</div>
	);
}
