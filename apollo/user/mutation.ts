import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			accessToken
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
			memberArticles
			memberPoints
			memberLikes
			memberViews
			createdAt
			updatedAt
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			accessToken
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
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
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
			memberArticles
			memberPoints
			memberLikes
			memberViews
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_MEMBER = gql`
	mutation LikeTargetMember($input: String!) {
		likeTargetMember(memberId: $input) {
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
`;

/**************************
 *        LISTING         *
 *************************/

export const CREATE_LISTING = gql`
	mutation CreateListing($input: ListingInput!) {
		createListing(input: $input) {
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
	}
`;

export const UPDATE_LISTING = gql`
	mutation UpdateListing($input: ListingUpdate!) {
		updateListing(input: $input) {
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
	}
`;

export const LIKE_TARGET_LISTING = gql`
	mutation LikeTargetListing($input: String!) {
		likeTargetListing(listingId: $input) {
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
	}
`;

/** @deprecated Use CREATE_LISTING — same document */
export const CREATE_PROPERTY = CREATE_LISTING;
/** @deprecated Use UPDATE_LISTING — same document */
export const UPDATE_PROPERTY = UPDATE_LISTING;
/** @deprecated Use LIKE_TARGET_LISTING — same document */
export const LIKE_TARGET_PROPERTY = LIKE_TARGET_LISTING;

/**************************
 *         INQUIRY        *
 *************************/

export const CREATE_INQUIRY = gql`
	mutation CreateInquiry($input: InquiryInput!) {
		createInquiry(input: $input) {
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
		}
	}
`;

export const UPDATE_INQUIRY_STATUS = gql`
	mutation UpdateInquiryStatus($input: InquiryUpdateStatus!) {
		updateInquiryStatus(input: $input) {
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
		}
	}
`;

/**************************
 *         BOOKING        *
 *************************/

export const CREATE_BOOKING = gql`
	mutation CreateBooking($input: BookingInput!) {
		createBooking(input: $input) {
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
	}
`;

export const UPDATE_BOOKING_STATUS_BY_AGENT = gql`
	mutation UpdateBookingStatusByAgent($input: BookingUpdateStatus!) {
		updateBookingStatusByAgent(input: $input) {
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
	}
`;

export const CANCEL_MY_BOOKING = gql`
	mutation CancelMyBooking($bookingId: String!) {
		cancelMyBooking(bookingId: $bookingId) {
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
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const CREATE_BOARD_ARTICLE = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_BOARD_ARTICLE = gql`
	mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const LIKE_TARGET_BOARD_ARTICLE = gql`
	mutation LikeTargetBoardArticle($input: String!) {
		likeTargetBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followerId
			followingId
			createdAt
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followerId
			followingId
			createdAt
		}
	}
`;
