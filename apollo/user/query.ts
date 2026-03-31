import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_AGENTS = gql`
	query GetAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberAddress
				memberDesc
				memberListings
				memberFollowers
				memberRank
				memberPoints
				memberLikes
				memberViews
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER = gql(`
query GetMember($input: String!) {
    getMember(memberId: $input) {
        _id
        memberType
        memberStatus
        memberPhone
        memberNick
        memberFullName
        memberImage
        memberAddress
        memberDesc
        memberListings
        memberArticles
        memberPoints
        memberLikes
        memberViews
        memberFollowings
				memberFollowers
        memberRank
        createdAt
        updatedAt
        meFollowed {
					followingId
					followerId
					myFollowing
				}
    }
}
`);

/**************************
 *        LISTING         *
 *************************/

export const GET_LISTING = gql`
	query GetListing($input: String!) {
		getListing(listingId: $input) {
			_id
			listingType
			listingStatus
			listingLocation
			listingAddress
			listingTitle
			listingPrice
			listingViews
			listingLikes
			listingComments
			listingRank
			listingImages
			listingDesc
			durationMinutes
			memberId
			createdAt
			updatedAt
			memberData {
				_id
				memberType
				memberStatus
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberAddress
				memberDesc
				memberListings
				memberArticles
				memberFollowers
				memberFollowings
				memberComments
				memberRank
				memberPoints
				memberLikes
				memberViews
				createdAt
				updatedAt
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_LISTINGS = gql`
	query GetListings($input: ListingsInquiry!) {
		getListings(input: $input) {
			list {
				_id
				listingType
				listingStatus
				listingLocation
				listingAddress
				listingTitle
				listingPrice
				listingViews
				listingLikes
				listingComments
				listingRank
				listingImages
				listingDesc
				durationMinutes
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberListings
					memberArticles
					memberFollowers
					memberFollowings
					memberComments
					memberRank
					memberPoints
					memberLikes
					memberViews
					createdAt
					updatedAt
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_LISTINGS = gql`
	query GetAgentListings($input: AgentListingsInquiry!) {
		getAgentListings(input: $input) {
			list {
				_id
				listingType
				listingStatus
				listingLocation
				listingAddress
				listingTitle
				listingPrice
				listingViews
				listingLikes
				listingComments
				listingRank
				listingImages
				listingDesc
				durationMinutes
				memberId
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
			list {
				_id
				listingType
				listingStatus
				listingLocation
				listingAddress
				listingTitle
				listingPrice
				listingViews
				listingLikes
				listingComments
				listingRank
				listingImages
				listingDesc
				durationMinutes
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberListings
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
			list {
				_id
				listingType
				listingStatus
				listingLocation
				listingAddress
				listingTitle
				listingPrice
				listingViews
				listingLikes
				listingComments
				listingRank
				listingImages
				listingDesc
				durationMinutes
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberListings
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/** @deprecated Use GET_LISTING — same document; remove after call sites migrate */
export const GET_PROPERTY = GET_LISTING;
/** @deprecated Use GET_LISTINGS — same document */
export const GET_PROPERTIES = GET_LISTINGS;
/** @deprecated Use GET_AGENT_LISTINGS — same document */
export const GET_AGENT_PROPERTIES = GET_AGENT_LISTINGS;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
			memberId
			createdAt
			updatedAt
			memberData {
				_id
				memberType
				memberStatus
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberAddress
				memberDesc
				memberListings
				memberRank
				memberPoints
				memberLikes
				memberViews
				createdAt
				updatedAt
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
					_id
					memberType
					memberStatus
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberListings
					memberRank
					memberPoints
					memberLikes
					memberViews
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberStatus
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberListings
					memberRank
					memberPoints
					memberLikes
					memberViews
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         INQUIRY        *
 *************************/

export const GET_MY_INQUIRIES = gql`
	query GetMyInquiries($input: InquiriesInquiry!) {
		getMyInquiries(input: $input) {
			list {
				_id
				listingId
				agentId
				customerId
				name
				phone
				email
				message
				inquiryStatus
				createdAt
				updatedAt
				listingData {
					_id
					listingTitle
					listingType
					listingLocation
				}
				agentData {
					_id
					memberNick
					memberPhone
					memberImage
				}
				customerData {
					_id
					memberNick
					memberPhone
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_INQUIRIES = gql`
	query GetAgentInquiries($input: InquiriesInquiry!) {
		getAgentInquiries(input: $input) {
			list {
				_id
				listingId
				agentId
				customerId
				name
				phone
				email
				message
				inquiryStatus
				createdAt
				updatedAt
				listingData {
					_id
					listingTitle
					listingType
					listingLocation
				}
				agentData {
					_id
					memberNick
					memberPhone
					memberImage
				}
				customerData {
					_id
					memberNick
					memberPhone
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         BOOKING        *
 *************************/

export const GET_MY_BOOKINGS = gql`
	query GetMyBookings($input: BookingsInquiry!) {
		getMyBookings(input: $input) {
			list {
				_id
				listingId
				agentId
				customerId
				dateTime
				note
				bookingStatus
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_BOOKINGS = gql`
	query GetAgentBookings($input: BookingsInquiry!) {
		getAgentBookings(input: $input) {
			list {
				_id
				listingId
				agentId
				customerId
				dateTime
				note
				bookingStatus
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/
export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				followerData {
					_id
					memberType
					memberStatus
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberListings
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
					_id
					memberType
					memberStatus
					memberPhone
					memberNick
					memberFullName
					memberImage
					memberAddress
					memberDesc
					memberListings
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					createdAt
					updatedAt
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;
