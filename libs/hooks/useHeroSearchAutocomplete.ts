import { useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GET_AGENTS, GET_BOARD_ARTICLES, GET_LISTINGS } from '../../apollo/user/query';
import { Direction } from '../enums/common.enum';
import { ListingType } from '../enums/listing.enum';
import type { BoardArticle } from '../types/board-article/board-article';
import type { Listing } from '../types/listing/listing';
import type { Member } from '../types/member/member';
import { formatterStr } from '../utils';
import { formatArticleCategory, resolveArticleImage } from '../utils/articleCardHelpers';
import { getListingsIndexHref } from '../utils/inboxListingContext';
import { resolveListingImageUrl, resolveMemberImageUrl } from '../utils/mediaUrl';
import { getMemberTypeLabel } from '../utils/memberDisplay';
import { MemberType } from '../enums/member.enum';

const DEBOUNCE_MS = 300;
const PER_GROUP_LIMIT = 4;
const MIN_QUERY_LENGTH = 2;

export type HeroSearchResultType = 'specialist' | 'service' | 'product' | 'article';

export interface HeroSearchResultItem {
	id: string;
	type: HeroSearchResultType;
	title: string;
	subtitle?: string;
	image: string;
	href: string;
}

export interface HeroSearchGroup {
	label: string;
	type: HeroSearchResultType;
	items: HeroSearchResultItem[];
	total: number;
}

const formatSpecialistRole = (memberType?: string): string => {
	if (!memberType || memberType === MemberType.AGENT) return getMemberTypeLabel(MemberType.AGENT);
	return getMemberTypeLabel(memberType);
};

const mapSpecialist = (member: Member): HeroSearchResultItem => ({
	id: member._id,
	type: 'specialist',
	title: member.memberFullName?.trim() || member.memberNick || getMemberTypeLabel(MemberType.AGENT),
	subtitle: formatSpecialistRole(member.memberType),
	image: resolveMemberImageUrl(member.memberImage),
	href: `/specialist/detail?id=${encodeURIComponent(member._id)}`,
});

const formatHeroPrice = (value: number | undefined): string => {
	if (value == null) return '';
	const amount = formatterStr(value);
	return amount ? `₩${amount}` : '';
};

const mapService = (listing: Listing): HeroSearchResultItem => ({
	id: listing._id,
	type: 'service',
	title: listing.listingTitle,
	subtitle: listing.listingPrice != null ? formatHeroPrice(listing.listingPrice) : undefined,
	image: resolveListingImageUrl(listing.listingImages?.[0]),
	href: `/service/detail?id=${encodeURIComponent(listing._id)}`,
});

const mapProduct = (listing: Listing): HeroSearchResultItem => ({
	id: listing._id,
	type: 'product',
	title: listing.listingTitle,
	subtitle: listing.listingPrice != null ? formatHeroPrice(listing.listingPrice) : undefined,
	image: resolveListingImageUrl(listing.listingImages?.[0]),
	href: `/product/detail?id=${encodeURIComponent(listing._id)}`,
});

const mapArticle = (article: BoardArticle): HeroSearchResultItem => ({
	id: article._id,
	type: 'article',
	title: article.articleTitle,
	subtitle: formatArticleCategory(article.articleCategory),
	image: resolveArticleImage(article.articleImage),
	href: `/blog/detail?id=${encodeURIComponent(article._id)}`,
});

export function useHeroSearchAutocomplete(query: string) {
	const client = useApolloClient();
	const [debouncedQuery, setDebouncedQuery] = useState('');
	const [groups, setGroups] = useState<HeroSearchGroup[]>([]);
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const requestIdRef = useRef(0);

	useEffect(() => {
		const trimmed = query.trim();
		if (trimmed.length < MIN_QUERY_LENGTH) {
			setDebouncedQuery('');
			setGroups([]);
			setLoading(false);
			setOpen(false);
			return;
		}

		setOpen(true);
		const timer = window.setTimeout(() => setDebouncedQuery(trimmed), DEBOUNCE_MS);
		return () => window.clearTimeout(timer);
	}, [query]);

	useEffect(() => {
		const text = debouncedQuery.trim();
		if (!text) {
			setGroups([]);
			setLoading(false);
			return;
		}

		const requestId = ++requestIdRef.current;
		setLoading(true);

		const baseListingInput = {
			page: 1,
			limit: PER_GROUP_LIMIT,
			sort: 'createdAt',
			direction: Direction.DESC,
			search: { text },
		};

		void (async () => {
			try {
				const [agentsRes, servicesRes, productsRes, articlesRes] = await Promise.all([
					client.query({
						query: GET_AGENTS,
						variables: {
							input: {
								page: 1,
								limit: PER_GROUP_LIMIT,
								sort: 'createdAt',
								direction: Direction.DESC,
								search: { text },
							},
						},
						fetchPolicy: 'network-only',
					}),
					client.query({
						query: GET_LISTINGS,
						variables: {
							input: {
								...baseListingInput,
								search: { text, typeList: [ListingType.SERVICE] },
							},
						},
						fetchPolicy: 'network-only',
					}),
					client.query({
						query: GET_LISTINGS,
						variables: {
							input: {
								...baseListingInput,
								search: { text, typeList: [ListingType.PRODUCT] },
							},
						},
						fetchPolicy: 'network-only',
					}),
					client.query({
						query: GET_BOARD_ARTICLES,
						variables: {
							input: {
								page: 1,
								limit: PER_GROUP_LIMIT,
								sort: 'createdAt',
								direction: Direction.DESC,
								search: { text },
							},
						},
						fetchPolicy: 'network-only',
					}),
				]);

				if (requestId !== requestIdRef.current) return;

				const nextGroups: HeroSearchGroup[] = [];

				const specialists = (agentsRes.data?.getAgents?.list ?? []) as Member[];
				const specialistTotal = agentsRes.data?.getAgents?.metaCounter?.[0]?.total ?? specialists.length;
				if (specialists.length > 0) {
					nextGroups.push({
						label: 'Specialists',
						type: 'specialist',
						items: specialists.map(mapSpecialist),
						total: specialistTotal,
					});
				}

				const services = (servicesRes.data?.getListings?.list ?? []) as Listing[];
				const serviceTotal = servicesRes.data?.getListings?.metaCounter?.[0]?.total ?? services.length;
				if (services.length > 0) {
					nextGroups.push({
						label: 'Services',
						type: 'service',
						items: services.map(mapService),
						total: serviceTotal,
					});
				}

				const products = (productsRes.data?.getListings?.list ?? []) as Listing[];
				const productTotal = productsRes.data?.getListings?.metaCounter?.[0]?.total ?? products.length;
				if (products.length > 0) {
					nextGroups.push({
						label: 'Products',
						type: 'product',
						items: products.map(mapProduct),
						total: productTotal,
					});
				}

				const articles = (articlesRes.data?.getBoardArticles?.list ?? []) as BoardArticle[];
				const articleTotal = articlesRes.data?.getBoardArticles?.metaCounter?.[0]?.total ?? articles.length;
				if (articles.length > 0) {
					nextGroups.push({
						label: 'Articles',
						type: 'article',
						items: articles.map(mapArticle),
						total: articleTotal,
					});
				}

				setGroups(nextGroups);
			} catch {
				if (requestId !== requestIdRef.current) return;
				setGroups([]);
			} finally {
				if (requestId === requestIdRef.current) {
					setLoading(false);
				}
			}
		})();
	}, [client, debouncedQuery]);

	const flatItems = useMemo(
		() => groups.flatMap((group) => group.items),
		[groups],
	);

	const hasMore = useMemo(
		() => groups.some((group) => group.total > group.items.length),
		[groups],
	);

	const seeAllHref = useMemo(() => {
		const text = debouncedQuery.trim();
		if (!text) return '/service';
		const listingOverflow = groups.some(
			(g) => (g.type === 'service' || g.type === 'product') && g.total > g.items.length,
		);
		if (listingOverflow) {
			return getListingsIndexHref({
				page: 1,
				limit: 12,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: { text },
			});
		}
		if (groups.some((g) => g.type === 'specialist' && g.total > g.items.length)) {
			return '/specialist';
		}
		return '/blog';
	}, [debouncedQuery, groups]);

	const close = useCallback(() => setOpen(false), []);

	const trimmedQuery = query.trim();
	const showDropdown = open && trimmedQuery.length >= MIN_QUERY_LENGTH;

	return {
		groups,
		flatItems,
		loading,
		showDropdown,
		hasMore,
		seeAllHref,
		debouncedQuery,
		close,
		setOpen,
	};
}
