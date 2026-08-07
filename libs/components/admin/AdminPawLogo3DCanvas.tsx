import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Props = {
	onReady?: () => void;
	onFail?: () => void;
};

/** Isolated vanilla Three.js paw — decorative sidebar mark only */
export default function AdminPawLogo3DCanvas({ onReady, onFail }: Props) {
	const mountRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const mount = mountRef.current;
		if (!mount) return;

		let raf = 0;
		let disposed = false;
		const disposables: Array<{ dispose?: () => void }> = [];

		try {
			const size = 48;
			const scene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
			camera.position.set(0, 0.1, 3.6);

			const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
			renderer.setSize(size, size);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
			mount.appendChild(renderer.domElement);
			disposables.push(renderer);

			const material = new THREE.MeshStandardMaterial({
				color: 0xe8a04b,
				metalness: 0.25,
				roughness: 0.42,
			});

			const group = new THREE.Group();
			const pad = new THREE.Mesh(new THREE.SphereGeometry(0.52, 20, 20), material);
			pad.scale.set(1.15, 0.72, 0.45);
			pad.position.y = -0.08;
			group.add(pad);
			disposables.push(pad.geometry);

			const toeGeo = new THREE.SphereGeometry(0.19, 14, 14);
			disposables.push(toeGeo);
			[
				[-0.34, 0.48, 0.05],
				[-0.11, 0.62, 0.05],
				[0.11, 0.62, 0.05],
				[0.34, 0.48, 0.05],
			].forEach(([x, y, z]) => {
				const toe = new THREE.Mesh(toeGeo, material);
				toe.position.set(x, y, z);
				group.add(toe);
			});

			scene.add(group);
			const key = new THREE.DirectionalLight(0xffffff, 1.15);
			key.position.set(2.5, 3, 4);
			scene.add(key);
			scene.add(new THREE.AmbientLight(0xfff8ee, 0.55));

			const start = performance.now();
			const animate = (now: number) => {
				if (disposed) return;
				raf = requestAnimationFrame(animate);
				group.rotation.y = ((now - start) / 1000) * ((Math.PI * 2) / 18);
				renderer.render(scene, camera);
			};

			raf = requestAnimationFrame(animate);
			onReady?.();
		} catch {
			onFail?.();
		}

		return () => {
			disposed = true;
			cancelAnimationFrame(raf);
			disposables.forEach((item) => item.dispose?.());
			if (mount.firstChild) mount.removeChild(mount.firstChild);
		};
	}, [onReady, onFail]);

	return <div ref={mountRef} className="admin-paw-logo__canvas" aria-hidden />;
}
