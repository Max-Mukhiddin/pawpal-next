import React, { ChangeEvent } from 'react';
import { Button, Stack, Typography, Pagination as MuiPagination } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import moment from 'moment';
import type { Service } from '../../types/services/service';
import type { Comment } from '../../types/comment/comment';
import type { CommentsInquiry, CommentInput } from '../../types/comment/comment.input';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr } from '../../utils';
import { T } from '../../types/common';
import RelatedServiceCard from './RelatedServiceCard';
import ServiceReviewCard from './ServiceReviewCard';
import ServiceDetailInquirySidebar from '../inquiry/ServiceDetailInquirySidebar';

export interface ServiceDetailMobileProps {
	service: Service | null;
	user: T;
	slideImage: string;
	onSlideImageChange: (image: string) => void;
	onLike: (user: T, id: string) => Promise<void>;
	relatedServices: Service[];
	serviceComments: Comment[];
	commentTotal: number;
	commentInquiry: CommentsInquiry;
	onCommentPageChange: (event: ChangeEvent<unknown>, value: number) => void;
	insertCommentData: CommentInput;
	onCommentTextChange: (value: string) => void;
	onSubmitComment: () => void;
}

/** Stacked service detail for small screens; same data/actions as desktop. */
function ServiceDetailMobile({
	service,
	user,
	slideImage,
	onSlideImageChange,
	onLike,
	relatedServices,
	serviceComments,
	commentTotal,
	commentInquiry,
	onCommentPageChange,
	insertCommentData,
	onCommentTextChange,
	onSubmitComment,
}: ServiceDetailMobileProps) {
	return (
	<div id="service-detail-page" className="service-detail-mobile">
		<div className="container">
			<Stack spacing={2} sx={{ py: 2, px: { xs: 1, sm: 0 } }}>
				<Stack className="images">
					<Stack className="main-image" sx={{ borderRadius: 2, overflow: 'hidden' }}>
						<img
							src={slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/img/property/bigImage.png'}
							alt=""
							style={{ width: '100%', display: 'block', maxHeight: 280, objectFit: 'cover' }}
						/>
					</Stack>
					<Stack direction="row" className="sub-images" sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
						{service?.listingImages?.map((subImg: string) => (
							<Stack
								className="sub-img-box"
								key={subImg}
								onClick={() => onSlideImageChange(subImg)}
								sx={{ width: 64, height: 64, borderRadius: 1, overflow: 'hidden', cursor: 'pointer' }}
							>
								<img
									src={`${REACT_APP_API_URL}/${subImg}`}
									alt=""
									style={{ width: '100%', height: '100%', objectFit: 'cover' }}
								/>
							</Stack>
						))}
					</Stack>
				</Stack>

				<Stack spacing={1}>
					<Typography className="title-main" sx={{ fontSize: 22, fontWeight: 700 }}>
						{service?.listingTitle}
					</Typography>
					<Typography className="city" sx={{ color: '#717171', fontSize: 14 }}>
						{service?.listingLocation}
					</Typography>
					<Stack direction="row" alignItems="center" spacing={2}>
						<Typography sx={{ fontSize: 24, fontWeight: 700 }}>From ${formatterStr(service?.listingPrice)}</Typography>
						<Stack direction="row" alignItems="center" spacing={0.5}>
							<RemoveRedEyeIcon fontSize="small" />
							<Typography variant="body2">{service?.listingViews}</Typography>
						</Stack>
						<Stack direction="row" alignItems="center" spacing={0.5}>
							{service?.meLiked && service?.meLiked[0]?.myFavorite ? (
								<FavoriteIcon color="primary" onClick={() => onLike(user, service?._id as string)} sx={{ cursor: 'pointer' }} />
							) : (
								<FavoriteBorderIcon onClick={() => onLike(user, service?._id as string)} sx={{ cursor: 'pointer' }} />
							)}
							<Typography variant="body2">{service?.listingLikes}</Typography>
						</Stack>
					</Stack>
					<Stack direction="row" flexWrap="wrap" gap={1}>
						<Typography variant="caption">Steps {service?.listingBeds}</Typography>
						<Typography variant="caption">Sessions {service?.listingRooms}</Typography>
						<Typography variant="caption">Score {service?.listingSquare}</Typography>
					</Stack>
				</Stack>

				<Stack spacing={2}>
					<Stack direction="row" flexWrap="wrap" gap={2}>
						<Stack>
							<Typography variant="caption" color="text.secondary">
								Care steps
							</Typography>
							<Typography>{service?.listingBeds}</Typography>
						</Stack>
						<Stack>
							<Typography variant="caption" color="text.secondary">
								Sessions
							</Typography>
							<Typography>{service?.listingRooms}</Typography>
						</Stack>
						<Stack>
							<Typography variant="caption" color="text.secondary">
								Since
							</Typography>
							<Typography>{moment(service?.createdAt).format('YYYY')}</Typography>
						</Stack>
					</Stack>

					<Stack className="prop-desc-config">
						<Typography className="title">About this service</Typography>
						<Typography className="desc" sx={{ mt: 1 }}>
							{service?.listingDesc ?? 'No service description yet.'}
						</Typography>
					</Stack>

					<Stack>
						<Typography className="title" sx={{ fontWeight: 600 }}>
							Service details
						</Typography>
						<Stack spacing={0.5} sx={{ mt: 1 }}>
							<Typography variant="body2">Starting price: ${formatterStr(service?.listingPrice)}</Typography>
							<Typography variant="body2">Type: {service?.listingType}</Typography>
						</Stack>
					</Stack>

					<Stack className="service-process-config">
						<Typography className="title">How this service works</Typography>
						<Stack spacing={1} sx={{ mt: 1 }}>
							<Typography className="service-process-config__step">1. Share your pet profile and preferred schedule.</Typography>
							<Typography className="service-process-config__step">2. Match with a specialist and confirm session details.</Typography>
							<Typography className="service-process-config__step">3. Receive updates and follow-up care tips.</Typography>
						</Stack>
					</Stack>

					<Stack className="address-config">
						<Typography className="title">Service coverage</Typography>
						<Stack className="map-box" sx={{ minHeight: 200, borderRadius: 2, overflow: 'hidden', mt: 1 }}>
							<iframe
								src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25867.098915951767!2d128.68632810247993!3d35.86402299180927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35660bba427bf179%3A0x1fc02da732b9072f!2sGeumhogangbyeon-ro%2C%20Dong-gu%2C%20Daegu!5e0!3m2!1suz!2skr!4v1695537640704!5m2!1suz!2skr"
								width="100%"
								height="100%"
								style={{ border: 0, minHeight: 200 }}
								allowFullScreen
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
								title="Service coverage map"
							/>
						</Stack>
					</Stack>
				</Stack>

				{commentTotal !== 0 && (
					<Stack className="service-reviews-config">
						<Typography sx={{ fontWeight: 600, mb: 1 }}>{commentTotal} reviews</Typography>
						<Stack spacing={1}>
							{serviceComments?.map((comment: Comment) => (
								<ServiceReviewCard comment={comment} key={comment?._id} />
							))}
							<div className="pagination-box">
								<MuiPagination
									page={commentInquiry.page}
									count={Math.ceil(commentTotal / commentInquiry.limit) || 1}
									onChange={onCommentPageChange}
									shape="circular"
									color="primary"
									size="small"
								/>
							</div>
						</Stack>
					</Stack>
				)}

				<Stack className="leave-review-config">
					<Typography className="main-title">Leave a review</Typography>
					<Typography className="review-title">Review</Typography>
					<textarea
						onChange={({ target: { value } }: React.ChangeEvent<HTMLTextAreaElement>) => onCommentTextChange(value)}
						value={insertCommentData.commentContent}
					/>
					<div className="submit-btn">
						<Button
							className="submit-review"
							disabled={!insertCommentData.commentContent || !user?._id}
							onClick={onSubmitComment}
						>
							<Typography className="title">Submit review</Typography>
						</Button>
					</div>
				</Stack>

				<ServiceDetailInquirySidebar
					service={service}
					user={user}
					mainTitle="Get service consultation"
					profileLinkLabel="View specialist profile"
				/>

				{relatedServices.length > 0 && (
					<Stack className="related-services-config" spacing={1}>
						<Typography className="main-title">Related services</Typography>
						<Stack
							direction="row"
							className="cards-box"
							sx={{ overflowX: 'auto', gap: 2, pb: 1, flexWrap: 'nowrap' }}
						>
							{relatedServices.map((relatedService: Service) => (
								<div key={relatedService._id} style={{ flex: '0 0 260px', minWidth: 260 }}>
									<RelatedServiceCard service={relatedService} onLike={onLike} />
								</div>
							))}
						</Stack>
					</Stack>
				)}
			</Stack>
		</div>
	</div>
	);
}

export default ServiceDetailMobile;
