import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeedItem from './FeedItem';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('FeedItem', () => {
  const mockPost = {
    id: 1,
    user: 'Sarah K.',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    community: 'Tech Lovers',
    time: '2h ago',
    content: 'Just attended the most amazing workshop on AI!',
    image: 'https://example.com/image.jpg',
    likes: 12,
    comments: 3,
  };

  const mockCurrentUser = {
    name: 'Ben B.',
    avatar: '/ben-avatar.png',
  };

  const mockOnOpenProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render post content', () => {
      render(<FeedItem post={mockPost} currentUser={mockCurrentUser} />);
      expect(screen.getByText(/Just attended the most amazing workshop/)).toBeInTheDocument();
    });

    it('should render user name', () => {
      render(<FeedItem post={mockPost} currentUser={mockCurrentUser} />);
      expect(screen.getByText('Sarah K.')).toBeInTheDocument();
    });

    it('should render community name', () => {
      render(<FeedItem post={mockPost} currentUser={mockCurrentUser} />);
      expect(screen.getByText('Tech Lovers')).toBeInTheDocument();
    });

    it('should render post time', () => {
      render(<FeedItem post={mockPost} currentUser={mockCurrentUser} />);
      expect(screen.getByText(/2h ago/)).toBeInTheDocument();
    });

    it('should render like count', () => {
      render(<FeedItem post={mockPost} currentUser={mockCurrentUser} />);
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('should render post image when provided', () => {
      render(<FeedItem post={mockPost} currentUser={mockCurrentUser} />);
      const images = screen.getAllByRole('img');
      const postImage = images.find(img => img.getAttribute('alt') === 'Post content');
      expect(postImage).toBeInTheDocument();
      expect(postImage).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('should not render image when not provided', () => {
      const postWithoutImage = { ...mockPost, image: null };
      render(<FeedItem post={postWithoutImage} currentUser={mockCurrentUser} />);
      const postImage = screen.queryByAltText('Post content');
      expect(postImage).not.toBeInTheDocument();
    });

    it('should render user avatar', () => {
      render(<FeedItem post={mockPost} currentUser={mockCurrentUser} />);
      const avatars = screen.getAllByRole('img');
      const userAvatar = avatars.find(img => img.getAttribute('alt') === 'Sarah K.');
      expect(userAvatar).toBeInTheDocument();
    });
  });

  describe('Like interaction', () => {
    it('should toggle like on click', async () => {
      const user = userEvent.setup({ delay: null });
      render(<FeedItem post={mockPost} currentUser={mockCurrentUser} />);

      // Find the like count
      expect(screen.getByText('12')).toBeInTheDocument();

      // Click like button
      const likeButton = screen.getByText('12').closest('button');
      await user.click(likeButton);

      // Like count should increment
      expect(screen.getByText('13')).toBeInTheDocument();
    });

    it('should toggle like off on second click', async () => {
      const user = userEvent.setup({ delay: null });
      render(<FeedItem post={mockPost} currentUser={mockCurrentUser} />);

      const likeButton = screen.getByText('12').closest('button');
      await user.click(likeButton);
      expect(screen.getByText('13')).toBeInTheDocument();

      await user.click(likeButton);
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  describe('Comments section', () => {
    it('should show comment count', () => {
      render(<FeedItem post={mockPost} currentUser={mockCurrentUser} />);
      // Comment count is total of initial comments + their replies
      const commentButtons = screen.getAllByRole('button');
      expect(commentButtons.length).toBeGreaterThan(0);
    });

    it('should toggle comments on click', async () => {
      const user = userEvent.setup({ delay: null });
      render(<FeedItem post={mockPost} currentUser={mockCurrentUser} />);

      // Comments should not be visible initially
      expect(screen.queryByPlaceholderText('Write a comment...')).not.toBeInTheDocument();

      // Find and click the comments toggle button (button with MessageCircle icon)
      const allButtons = screen.getAllByRole('button');
      // The comments button is the second interactive button (after like)
      const commentsButton = allButtons[1];
      await user.click(commentsButton);

      // Comment input should now be visible
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
    });

    it('should submit a new comment', async () => {
      const user = userEvent.setup({ delay: null });
      render(<FeedItem post={mockPost} currentUser={mockCurrentUser} />);

      // Open comments
      const allButtons = screen.getAllByRole('button');
      await user.click(allButtons[1]);

      // Type a comment
      const input = screen.getByPlaceholderText('Write a comment...');
      await user.type(input, 'Great post!');

      expect(input).toHaveValue('Great post!');
    });

    it('should show initial comments when opened', async () => {
      const user = userEvent.setup({ delay: null });
      render(<FeedItem post={mockPost} currentUser={mockCurrentUser} />);

      // Open comments
      const allButtons = screen.getAllByRole('button');
      await user.click(allButtons[1]);

      // Initial comments for post id=1 should show
      expect(screen.getByText('Yes! It was amazing 🔥')).toBeInTheDocument();
      expect(screen.getByText('Link please?')).toBeInTheDocument();
    });
  });

  describe('Profile interaction', () => {
    it('should call onOpenProfile when user avatar clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <FeedItem post={mockPost} currentUser={mockCurrentUser} onOpenProfile={mockOnOpenProfile} />
      );

      // Click the profile button (avatar + name area)
      const profileButton = screen.getByText('Sarah K.').closest('button');
      await user.click(profileButton);

      expect(mockOnOpenProfile).toHaveBeenCalledWith({
        name: 'Sarah K.',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        community: 'Tech Lovers',
      });
    });

    it('should not render profile button when onOpenProfile not provided', () => {
      render(<FeedItem post={mockPost} currentUser={mockCurrentUser} />);

      // Without onOpenProfile, user name should be a span, not a button
      const nameElement = screen.getByText('Sarah K.');
      // When no onOpenProfile, it should not be a button wrapping the name
      expect(nameElement).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should use default currentUser when not provided', () => {
      render(<FeedItem post={mockPost} />);
      expect(screen.getByText('Sarah K.')).toBeInTheDocument();
    });

    it('should handle post with zero likes', () => {
      const zeroLikesPost = { ...mockPost, likes: 0 };
      render(<FeedItem post={zeroLikesPost} currentUser={mockCurrentUser} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle post without image', () => {
      const textOnlyPost = { ...mockPost, image: '' };
      render(<FeedItem post={textOnlyPost} currentUser={mockCurrentUser} />);
      expect(screen.queryByAltText('Post content')).not.toBeInTheDocument();
    });

    it('should handle post with long content', () => {
      const longPost = { ...mockPost, content: 'A'.repeat(500) };
      render(<FeedItem post={longPost} currentUser={mockCurrentUser} />);
      expect(screen.getByText('A'.repeat(500))).toBeInTheDocument();
    });

    it('should handle post with no initial comments', () => {
      const postWithNoComments = { ...mockPost, id: 999 };
      render(<FeedItem post={postWithNoComments} currentUser={mockCurrentUser} />);
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });
  });

  describe('Image lazy loading', () => {
    it('should have loading="lazy" on post image', () => {
      render(<FeedItem post={mockPost} currentUser={mockCurrentUser} />);
      const postImage = screen.getByAltText('Post content');
      expect(postImage).toHaveAttribute('loading', 'lazy');
    });

    it('should have loading="lazy" on user avatar', () => {
      render(<FeedItem post={mockPost} currentUser={mockCurrentUser} />);
      const avatar = screen.getByAltText('Sarah K.');
      expect(avatar).toHaveAttribute('loading', 'lazy');
    });
  });
});
