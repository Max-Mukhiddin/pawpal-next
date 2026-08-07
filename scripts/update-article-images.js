#!/usr/bin/env node
/**
 * One-off: update articleImage on boardArticles by partial title match.
 * Field in MongoDB is `articleImage` (GraphQL articleImage) — not imageUrl.
 *
 * Usage: node scripts/update-article-images.js
 * Requires MONGO_DEV (or MONGODB_URI) in env — loads ../pawpal/.env if missing locally.
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const COLLECTION = 'boardArticles';
const IMAGE_FIELD = 'articleImage';

const SHIBA_UNSPLASH =
	'https://images.unsplash.com/photo-1596278852720-141ba859bbbf?fm=jpg&q=80&w=2000&auto=format&fit=crop';

/** @type {Array<{ label: string; titlePattern: RegExp; imageUrl: string | null; pending?: boolean }>} */
const TARGETS = [
	{
		label: 'Punishment-based training',
		titlePattern: /Why Punishment-Based Training/i,
		imageUrl: SHIBA_UNSPLASH,
	},
];

function loadEnvFiles() {
	const candidates = [
		path.resolve(__dirname, '../.env.local'),
		path.resolve(__dirname, '../.env'),
		path.resolve(__dirname, '../.env.development'),
		path.resolve(__dirname, '../../pawpal/.env'),
	];

	for (const file of candidates) {
		if (!fs.existsSync(file)) continue;
		const lines = fs.readFileSync(file, 'utf8').split('\n');
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith('#')) continue;
			const eq = trimmed.indexOf('=');
			if (eq === -1) continue;
			const key = trimmed.slice(0, eq).trim();
			let value = trimmed.slice(eq + 1).trim();
			if (
				(value.startsWith('"') && value.endsWith('"')) ||
				(value.startsWith("'") && value.endsWith("'"))
			) {
				value = value.slice(1, -1);
			}
			if (process.env[key] === undefined) {
				process.env[key] = value;
			}
		}
	}
}

function getMongoUri() {
	return (
		process.env.MONGO_DEV ||
		process.env.MONGODB_URI ||
		process.env.MONGO_URI ||
		process.env.MONGO_PROD ||
		null
	);
}

async function main() {
	loadEnvFiles();

	const uri = getMongoUri();
	if (!uri) {
		console.error(
			'❌ No MongoDB URI found. Set MONGO_DEV in .env.local or ../../pawpal/.env',
		);
		process.exit(1);
	}

	const client = new MongoClient(uri);

	try {
		await client.connect();
		const db = client.db();
		const collection = db.collection(COLLECTION);

		console.log(`Connected to database: ${db.databaseName}`);
		console.log(`Collection: ${COLLECTION} · field: ${IMAGE_FIELD}\n`);

		let updated = 0;
		let skipped = 0;
		let failed = 0;

		for (const target of TARGETS) {
			console.log(`── ${target.label} ──`);
			console.log(`   Pattern: ${target.titlePattern}`);

			if (target.pending || !target.imageUrl) {
				console.log('   ⏭  SKIPPED — image URL pending, not updating.\n');
				skipped += 1;
				continue;
			}

			const matches = await collection
				.find({ articleTitle: { $regex: target.titlePattern.source, $options: 'i' } })
				.project({ _id: 1, articleTitle: 1, articleImage: 1 })
				.toArray();

			if (matches.length === 0) {
				console.log('   ❌ FAILED — no article matched this title pattern.\n');
				failed += 1;
				continue;
			}

			if (matches.length > 1) {
				console.log(`   ❌ FAILED — ${matches.length} articles matched (expected exactly 1):`);
				matches.forEach((doc) => console.log(`      · ${doc.articleTitle}`));
				console.log('');
				failed += 1;
				continue;
			}

			const doc = matches[0];
			console.log(`   Matched: "${doc.articleTitle}"`);
			console.log(`   _id: ${doc._id}`);
			console.log(`   Previous ${IMAGE_FIELD}: ${doc.articleImage ?? '(empty)'}`);

			const result = await collection.updateOne(
				{ _id: doc._id },
				{ $set: { [IMAGE_FIELD]: target.imageUrl } },
			);

			if (result.modifiedCount === 1 || result.matchedCount === 1) {
				console.log(`   ✅ Updated ${IMAGE_FIELD} successfully.\n`);
				updated += 1;
			} else {
				console.log('   ❌ FAILED — update did not apply.\n');
				failed += 1;
			}
		}

		console.log('Summary:', { updated, skipped, failed });
		process.exit(failed > 0 ? 1 : 0);
	} finally {
		await client.close();
	}
}

main().catch((err) => {
	console.error('Fatal error:', err);
	process.exit(1);
});
