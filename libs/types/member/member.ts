import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';
import type { MeLiked, TotalCounter } from '../common/aggregates';
import { MeFollowed } from '../follow/follow';

export interface Member {
	_id: string;
	memberType: MemberType;
	memberStatus: MemberStatus;
	memberAuthType: MemberAuthType;
	memberPhone: string;
	memberNick: string;
	memberPassword?: string;
	memberFullName?: string;
	memberImage?: string;
	memberAddress?: string;
	memberDesc?: string;
	isPendingSpecialist?: boolean;
	memberListings?: number;
	memberRank: number;
	memberArticles: number;
	memberPoints: number;
	memberLikes: number;
	totalEngagement?: number;
	specialistScore?: number;
	jobsCount?: number;
	articlesCount?: number;
	memberFollowers?: number;
	memberFollowings?: number;
	memberViews: number;
	memberComments: number;
	memberWarnings: number;
	memberBlocks: number;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	// Enable for authentications
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
	accessToken?: string;
}

export interface Members {
	list: Member[];
	metaCounter: TotalCounter[];
}
