type LikedEntity = { meLiked?: Array<{ myFavorite?: boolean | null }> } | null | undefined;

export const readWasLiked = (entity: LikedEntity): boolean => Boolean(entity?.meLiked?.[0]?.myFavorite);

export const likeToastMessage = (wasLiked: boolean): string => (wasLiked ? 'Removed' : 'Liked!');
