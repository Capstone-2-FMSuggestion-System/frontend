import React, { useState } from 'react';
import styled from 'styled-components';
import { FaStar, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { voteReview } from '../../../services/productService';

const ReviewCard = styled.div`
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f0f0f0;
  margin-right: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #555;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Username = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
`;

const ReviewDate = styled.div`
  font-size: 0.8rem;
  color: #999;
`;

const RatingStars = styled.div`
  display: flex;
  margin-bottom: 10px;
  
  svg {
    color: #FFD700;
    margin-right: 2px;
  }
`;

const ReviewText = styled.div`
  margin-bottom: 15px;
  color: #333;
  line-height: 1.5;
`;

const ReviewImages = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const ReviewImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  padding: 5px 10px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 15px;
  color: #555;
  cursor: pointer;
  
  svg {
    margin-right: 5px;
  }
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &.active {
    color: ${props => props.active === 'like' ? '#4CAF50' : '#d32f2f'};
    border-color: ${props => props.active === 'like' ? '#4CAF50' : '#d32f2f'};
  }
`;

const VoteCount = styled.span`
  margin-left: 3px;
`;

const ReviewItem = ({ review, productId }) => {
  const [liked, setLiked] = useState(review.user_voted === 'like');
  const [disliked, setDisliked] = useState(review.user_voted === 'dislike');
  const [likeCount, setLikeCount] = useState(review.like_count || 0);
  const [dislikeCount, setDislikeCount] = useState(review.dislike_count || 0);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLike = async () => {
    try {
      if (liked) {
        // Bỏ like
        await voteReview(productId, review.review_id, 'remove');
        setLiked(false);
        setLikeCount(likeCount - 1);
      } else {
        // Thêm like
        await voteReview(productId, review.review_id, 'like');
        setLiked(true);
        setLikeCount(likeCount + 1);

        // Nếu đã dislike trước đó, bỏ dislike
        if (disliked) {
          setDisliked(false);
          setDislikeCount(dislikeCount - 1);
        }
      }
    } catch (error) {
      console.error('Failed to vote review:', error);
    }
  };

  const handleDislike = async () => {
    try {
      if (disliked) {
        // Bỏ dislike
        await voteReview(productId, review.review_id, 'remove');
        setDisliked(false);
        setDislikeCount(dislikeCount - 1);
      } else {
        // Thêm dislike
        await voteReview(productId, review.review_id, 'dislike');
        setDisliked(true);
        setDislikeCount(dislikeCount + 1);

        // Nếu đã like trước đó, bỏ like
        if (liked) {
          setLiked(false);
          setLikeCount(likeCount - 1);
        }
      }
    } catch (error) {
      console.error('Failed to vote review:', error);
    }
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <ReviewCard>
      <UserInfo>
        <Avatar>
          {review.avatar_url ?
            <img src={review.avatar_url} alt={review.username || 'User'} /> :
            getInitials(review.username)
          }
        </Avatar>
        <UserDetails>
          <Username>{review.username || 'Anonymous'}</Username>
          <ReviewDate>{formatDate(review.created_at)}</ReviewDate>
        </UserDetails>
      </UserInfo>

      <RatingStars>
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} color={i < review.rating ? "#FFD700" : "#e4e5e9"} />
        ))}
      </RatingStars>

      <ReviewText>{review.content}</ReviewText>

      {review.images && review.images.length > 0 && (
        <ReviewImages>
          {review.images.map((image, index) => (
            <ReviewImage key={index}>
              <img src={image.image_url} alt={`Review image ${index + 1}`} />
            </ReviewImage>
          ))}
        </ReviewImages>
      )}

      <Actions>
        <ActionButton
          className={liked ? 'active' : ''}
          active={liked ? 'like' : ''}
          onClick={handleLike}
        >
          <FaThumbsUp /> Hữu ích <VoteCount>({likeCount})</VoteCount>
        </ActionButton>

        <ActionButton
          className={disliked ? 'active' : ''}
          active={disliked ? 'dislike' : ''}
          onClick={handleDislike}
        >
          <FaThumbsDown /> <VoteCount>({dislikeCount})</VoteCount>
        </ActionButton>
      </Actions>
    </ReviewCard>
  );
};

export default ReviewItem; 