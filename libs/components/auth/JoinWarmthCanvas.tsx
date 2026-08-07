import React, { useEffect, useRef } from 'react';

type Orb = {
	x: number;
	y: number;
	baseX: number;
	baseY: number;
	radius: number;
	phase: number;
	speed: number;
	ampX: number;
	ampY: number;
	color: 'honey' | 'sage' | 'forest';
};

type Particle = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	radius: number;
	phase: number;
	speed: number;
	amp: number;
	color: 'honey' | 'white';
	opacity: number;
};

const ORB_COUNT = 5;
const PARTICLE_COUNT = 40;
const REPEL_RADIUS = 120;
const REPEL_STRENGTH = 0.55;
const ORB_PARALLAX = 16;

const prefersReducedMotion = () =>
	typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function createOrbs(width: number, height: number): Orb[] {
	return Array.from({ length: ORB_COUNT }, (_, i) => {
		const colors: Orb['color'][] = ['honey', 'sage', 'forest', 'honey', 'sage'];
		return {
			x: (width * (0.15 + (i * 0.18) % 0.7)),
			y: (height * (0.2 + (i * 0.22) % 0.6)),
			baseX: 0,
			baseY: 0,
			radius: 90 + (i % 3) * 40,
			phase: Math.random() * Math.PI * 2,
			speed: 0.18 + Math.random() * 0.22,
			ampX: 40 + Math.random() * 50,
			ampY: 30 + Math.random() * 45,
			color: colors[i],
		};
	}).map((orb) => ({ ...orb, baseX: orb.x, baseY: orb.y }));
}

function createParticles(width: number, height: number): Particle[] {
	return Array.from({ length: PARTICLE_COUNT }, () => ({
		x: Math.random() * width,
		y: Math.random() * height,
		vx: (Math.random() - 0.5) * 0.15,
		vy: (Math.random() - 0.5) * 0.15,
		radius: 1.2 + Math.random() * 2.2,
		phase: Math.random() * Math.PI * 2,
		speed: 0.3 + Math.random() * 0.5,
		amp: 8 + Math.random() * 14,
		color: Math.random() > 0.45 ? 'honey' : 'white',
		opacity: 0.18 + Math.random() * 0.28,
	}));
}

function orbGradient(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	radius: number,
	color: Orb['color'],
) {
	const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
	if (color === 'honey') {
		gradient.addColorStop(0, 'rgba(232, 160, 75, 0.22)');
		gradient.addColorStop(0.45, 'rgba(232, 160, 75, 0.1)');
		gradient.addColorStop(1, 'rgba(232, 160, 75, 0)');
	} else if (color === 'sage') {
		gradient.addColorStop(0, 'rgba(30, 107, 79, 0.18)');
		gradient.addColorStop(0.5, 'rgba(226, 237, 229, 0.12)');
		gradient.addColorStop(1, 'rgba(226, 237, 229, 0)');
	} else {
		gradient.addColorStop(0, 'rgba(23, 62, 50, 0.16)');
		gradient.addColorStop(0.5, 'rgba(23, 62, 50, 0.07)');
		gradient.addColorStop(1, 'rgba(23, 62, 50, 0)');
	}
	return gradient;
}

/**
 * Ambient Canvas 2D warmth field for /account/join — soft orbs + particles
 * with gentle mouse repulsion. No WebGL.
 */
export default function JoinWarmthCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d', { alpha: true });
		if (!ctx) return;

		const reduced = prefersReducedMotion();
		let raf = 0;
		let disposed = false;
		let width = 0;
		let height = 0;
		let dpr = 1;
		let orbs: Orb[] = [];
		let particles: Particle[] = [];
		let start = performance.now();
		const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

		const resize = () => {
			const parent = canvas.parentElement;
			width = parent?.clientWidth || window.innerWidth;
			height = parent?.clientHeight || window.innerHeight;
			dpr = Math.min(window.devicePixelRatio || 1, 1.75);
			canvas.width = Math.floor(width * dpr);
			canvas.height = Math.floor(height * dpr);
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			if (orbs.length === 0) {
				orbs = createOrbs(width, height);
				particles = createParticles(width, height);
			} else {
				orbs.forEach((orb, i) => {
					orb.baseX = (width * (0.15 + (i * 0.18) % 0.7));
					orb.baseY = (height * (0.2 + (i * 0.22) % 0.6));
				});
			}
		};

		const drawStatic = () => {
			ctx.clearRect(0, 0, width, height);
			orbs.forEach((orb) => {
				ctx.beginPath();
				ctx.fillStyle = orbGradient(ctx, orb.baseX, orb.baseY, orb.radius, orb.color);
				ctx.arc(orb.baseX, orb.baseY, orb.radius, 0, Math.PI * 2);
				ctx.fill();
			});
			particles.forEach((p) => {
				ctx.beginPath();
				ctx.fillStyle =
					p.color === 'honey'
						? `rgba(232, 160, 75, ${p.opacity})`
						: `rgba(255, 255, 255, ${p.opacity * 0.85})`;
				ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
				ctx.fill();
			});
		};

		const tick = (now: number) => {
			if (disposed) return;
			raf = requestAnimationFrame(tick);
			const t = (now - start) / 1000;

			mouse.x += (mouse.tx - mouse.x) * 0.08;
			mouse.y += (mouse.ty - mouse.y) * 0.08;

			ctx.clearRect(0, 0, width, height);

			orbs.forEach((orb) => {
				const driftX = Math.sin(t * orb.speed + orb.phase) * orb.ampX;
				const driftY = Math.cos(t * orb.speed * 0.85 + orb.phase) * orb.ampY;
				const dx = mouse.x - orb.baseX;
				const dy = mouse.y - orb.baseY;
				const dist = Math.hypot(dx, dy) || 1;
				const parallax = Math.min(1, 220 / dist) * ORB_PARALLAX;
				orb.x = orb.baseX + driftX - (dx / dist) * parallax * 0.35;
				orb.y = orb.baseY + driftY - (dy / dist) * parallax * 0.35;

				ctx.beginPath();
				ctx.fillStyle = orbGradient(ctx, orb.x, orb.y, orb.radius, orb.color);
				ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
				ctx.fill();
			});

			particles.forEach((p) => {
				const ambientX = Math.sin(t * p.speed + p.phase) * p.amp * 0.02;
				const ambientY = Math.cos(t * p.speed * 0.9 + p.phase) * p.amp * 0.02;
				p.x += p.vx + ambientX;
				p.y += p.vy + ambientY;

				const dx = p.x - mouse.x;
				const dy = p.y - mouse.y;
				const dist = Math.hypot(dx, dy);
				if (dist < REPEL_RADIUS && dist > 0.1) {
					const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
					p.x += (dx / dist) * force * 6;
					p.y += (dy / dist) * force * 6;
				}

				if (p.x < -10) p.x = width + 10;
				if (p.x > width + 10) p.x = -10;
				if (p.y < -10) p.y = height + 10;
				if (p.y > height + 10) p.y = -10;

				ctx.beginPath();
				ctx.fillStyle =
					p.color === 'honey'
						? `rgba(232, 160, 75, ${p.opacity})`
						: `rgba(255, 255, 255, ${p.opacity * 0.85})`;
				ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
				ctx.fill();
			});
		};

		const onPointerMove = (event: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			mouse.tx = event.clientX - rect.left;
			mouse.ty = event.clientY - rect.top;
		};

		const onPointerLeave = () => {
			mouse.tx = -9999;
			mouse.ty = -9999;
		};

		resize();
		window.addEventListener('resize', resize);

		if (reduced) {
			drawStatic();
		} else {
			window.addEventListener('pointermove', onPointerMove, { passive: true });
			window.addEventListener('pointerleave', onPointerLeave);
			raf = requestAnimationFrame(tick);
		}

		return () => {
			disposed = true;
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', resize);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerleave', onPointerLeave);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="join-page__warmth-canvas"
			aria-hidden
		/>
	);
}
