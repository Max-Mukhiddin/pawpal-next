import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
	query GetAllBoardArticlesByAdmin($input: AllBoardArticlesInquiry!) {
		getAllBoardArticlesByAdmin(input: $input) {
			list {
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
