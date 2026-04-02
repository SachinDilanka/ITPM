import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Tabs,
  Tab,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Badge,
  Tooltip,
  LinearProgress,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
  Collapse,
  ListItemAvatar,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Person,
  Edit,
  Settings,
  Share,
  ThumbUp,
  Comment,
  Visibility,
  TrendingUp,
  Award,
  CalendarToday,
  Mail,
  School,
  Send,
  Close,
  ExpandMore,
  PersonAdd,
  Book,
  Star,
  EmojiEvents,
  Timeline,
  MoreVert,
  Notifications,
  Bookmark,
  Favorite,
  Add,
  Camera,
  Verified,
  Lightbulb,
  QuestionAnswer,
  Poll,
  Share as ShareIcon,
  CheckCircle,
  Delete
} from '@mui/icons-material';
import DeleteNotification, { DeleteConfirmNotification } from '../components/DeleteNotification.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [editDialog, setEditDialog] = useState(false);
  const [settingsMenu, setSettingsMenu] = useState(null);
  const [followed, setFollowed] = useState(false);
  const [savedPosts, setSavedPosts] = useState(12);
  const [sharedQuestions, setSharedQuestions] = useState([]);
  const [loadingShared, setLoadingShared] = useState(false);
  const [commentDialog, setCommentDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [shareMenu, setShareMenu] = useState(null);
  const [friends, setFriends] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || 'Computer Science student passionate about AI and machine learning. Love helping others solve complex problems!',
    semester: user?.semester ? `Semester ${user.semester}` : '1st Year',
    branch: user?.branch || 'Computer Science'
  });
  const [userStats, setUserStats] = useState({
    questionsAsked: 0,
    bestAnswers: 0,
    pollsCreated: 0,
    totalLikes: 0,
    totalShares: 0,
    totalViews: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [userQuestions, setUserQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Enhanced delete notification states
  const [deleteNotification, setDeleteNotification] = useState({ 
    open: false, 
    message: '', 
    itemName: '', 
    severity: 'delete',
    showProgress: true 
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, itemName: '', questionId: null });
  const [deletedSharedItems, setDeletedSharedItems] = useState([]); // For undo functionality

  // Current user ID (this should come from auth context)
  const currentUserId = user?._id;
  const currentUser = { id: currentUserId, name: user?.fullName || user?.username || 'User', avatar: user?.username?.charAt(0).toUpperCase() || 'U' };

  // Show snackbar function
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fetch shared questions when component mounts or tab changes
  useEffect(() => {
    if (activeTab === 2) {
      fetchSharedQuestions();
    } else if (activeTab === 4) {
      fetchFriends();
    } else if (activeTab === 5) {
      fetchFollowers();
    }
  }, [activeTab]); // Only depends on activeTab, not on sharedQuestions

  // Listen for question share events from other components
  useEffect(() => {
    const handleQuestionShared = (event) => {
      const sharedQuestion = event.detail;
      
      console.log('=== SHARE EVENT RECEIVED ===');
      console.log('Shared question data:', sharedQuestion);
      console.log('Shared question ID:', sharedQuestion._id);
      console.log('Shared question title:', sharedQuestion.title);
      console.log('Current shared questions before update:', sharedQuestions.map(q => ({ id: q._id, title: q.title })));
      
      // Add the shared question to the local state if it's not already there
      setSharedQuestions(prev => {
        const exists = prev.find(q => q._id === sharedQuestion._id);
        console.log('Question already exists:', exists);
        
        if (!exists) {
          console.log('Adding new shared question to profile:', sharedQuestion._id);
          const newSharedQuestions = [sharedQuestion, ...prev];
          console.log('New shared questions list:', newSharedQuestions.map(q => ({ id: q._id, title: q.title })));
          return newSharedQuestions;
        }
        
        console.log('Updating existing shared question:', sharedQuestion._id);
        const updatedSharedQuestions = prev.map(q => 
          q._id === sharedQuestion._id 
            ? { ...q, shares: sharedQuestion.shares, sharedBy: sharedQuestion.sharedBy }
            : q
        );
        console.log('Updated shared questions list:', updatedSharedQuestions.map(q => ({ id: q._id, title: q.title })));
        return updatedSharedQuestions;
      });
    };

    window.addEventListener('questionShared', handleQuestionShared);
    
    return () => {
      window.removeEventListener('questionShared', handleQuestionShared);
    };
  }, []);

  const fetchSharedQuestions = async () => {
    try {
      setLoadingShared(true);
      
      console.log('Fetching shared questions for user:', currentUserId);
      
      // Fetch shared questions first
      const response = await axios.get(`http://localhost:5000/api/users/${currentUserId}/shared`);
      
      console.log('Received shared questions from API:', response.data);
      
      // Process questions immediately without waiting for comments
      const questionsWithComments = response.data.map(q => {
        const existingQuestion = sharedQuestions.find(sq => sq._id === q._id);
        return {
          ...q,
          // Fix author information for shared questions
          author: q.author ? {
            ...q.author,
            fullName: q.author._id === currentUserId ? currentUser.name : (q.author.fullName || q.author.username),
            username: q.author.username,
            avatar: q.author._id === currentUserId ? currentUser.avatar : (q.author.avatar || (q.author.fullName ? q.author.fullName.charAt(0).toUpperCase() : 'U'))
          } : null,
          comments: existingQuestion?.comments || q.comments || []
        };
      });
      
      console.log('Processed shared questions:', questionsWithComments.map(q => ({ id: q._id, title: q.title })));
      
      // Merge with existing shared questions to avoid losing locally added questions
      setSharedQuestions(prev => {
        // Create a map of existing questions by ID
        const existingMap = new Map(prev.map(q => [q._id, q]));
        
        // Add new questions, but keep existing ones if they're already there
        const merged = [...questionsWithComments];
        
        // Check if there are any questions in prev that aren't in the API response
        prev.forEach(existingQ => {
          if (!questionsWithComments.find(q => q._id === existingQ._id)) {
            merged.push(existingQ);
          }
        });
        
        console.log('Merged shared questions:', merged.map(q => ({ id: q._id, title: q.title })));
        return merged;
      });
      
      setLoadingShared(false);
      
      // Fetch comments in parallel after questions are displayed
      if (questionsWithComments.length > 0) {
        const commentPromises = questionsWithComments
          .filter(question => !sharedQuestions.find(sq => sq._id === question._id)?.comments?.length)
          .map(async (question) => {
            try {
              const commentsResponse = await axios.get(`http://localhost:5000/api/comments/question/${question._id}`);
              return {
                questionId: question._id,
                comments: commentsResponse.data.map(c => ({
                  id: c._id,
                  author: {
                    id: c.author._id,
                    name: c.author._id === currentUserId ? currentUser.name : (c.author.fullName || c.author.username),
                    avatar: c.author._id === currentUserId ? currentUser.avatar : (c.author.avatar ? c.author.avatar.charAt(0).toUpperCase() : 'U')
                  },
                  text: c.content,
                  timestamp: new Date(c.createdAt).toLocaleString(),
                  likes: c.likes.map(like => like._id || like)
                }))
              };
            } catch (commentError) {
              console.error('Error fetching comments for shared question:', question._id, commentError);
              return { questionId: question._id, comments: [] };
            }
          });

        // Wait for all comments to load in parallel
        const commentResults = await Promise.all(commentPromises);
        
        // Update questions with comments
        setSharedQuestions(prev => prev.map(q => {
          const commentResult = commentResults.find(cr => cr.questionId === q._id);
          return commentResult ? { ...q, comments: commentResult.comments } : q;
        }));
      }
      
    } catch (error) {
      console.error('Error fetching shared questions:', error);
      // Fallback to empty array
      setSharedQuestions([]);
      setLoadingShared(false);
    }
  };

  // Handle like on shared questions
  const handleLike = async (questionId) => {
    try {
      await axios.post(`http://localhost:5000/api/questions/${questionId}/like`, {
        userId: currentUserId
      });
      
      // Update local state
      setSharedQuestions(prev => prev.map(q => {
        if (q._id === questionId) {
          const likes = Array.isArray(q.likes) ? q.likes : [];
          const isLiked = likes.includes(currentUserId);
          return {
            ...q,
            likes: isLiked 
              ? likes.filter(id => id !== currentUserId)
              : [...likes, currentUserId]
          };
        }
        return q;
      }));
    } catch (error) {
      console.error('Error liking question:', error);
    }
  };

  // Handle share on shared questions
  const handleShare = (event, question) => {
    setSelectedQuestion(question);
    setShareMenu(event.currentTarget);
  };

  // Handle delete shared question
  const handleDeleteSharedQuestion = (question) => {
    // Check if user can delete: either they are the original author or it's their profile
    const isOriginalAuthor = question.author?.id === currentUserId;
    
    // Show interactive delete confirmation
    setDeleteConfirm({
      open: true,
      itemName: question.title,
      questionId: question._id
    });
  };

  const confirmDeleteShared = async () => {
    const { questionId, itemName } = deleteConfirm;
    const question = sharedQuestions.find(q => q._id === questionId);
    
    if (!question) {
      console.error('Question not found for deletion:', questionId);
      return;
    }
    
    console.log('Confirming delete shared question:', questionId, 'Question:', question.title);
    console.log('Current shared questions before deletion:', sharedQuestions.map(q => q._id));
    
    // Store the deleted item for potential undo
    setDeletedSharedItems(prev => [...prev, question]);
    
    // Remove from UI IMMEDIATELY for instant feedback - use proper ID comparison
    setSharedQuestions(prev => {
      const filtered = prev.filter(q => {
        console.log('Comparing:', q._id, 'with', questionId, 'result:', q._id !== questionId);
        return q._id !== questionId;
      });
      console.log('Filtered shared questions:', filtered.map(q => q._id));
      return filtered;
    });
    
    // Close confirmation dialog
    setDeleteConfirm({ open: false, itemName: '', questionId: null });
    
    // Show enhanced delete notification with undo option
    setDeleteNotification({
      open: true,
      message: 'Shared question removed from profile!',
      itemName: itemName,
      severity: 'delete',
      showProgress: true
    });
    
    try {
      console.log('Making API call to remove shared question from profile...');
      console.log('Question ID:', questionId);
      console.log('Current user ID:', currentUserId);
      
      // Always use unshare endpoint for profile deletions
      // This removes the question from user's profile but keeps the original question
      console.log('Using unshare endpoint - removing from profile only');
      
      const response = await axios.delete(`http://localhost:5000/api/questions/${questionId}/unshare`, {
        data: { userId: currentUserId }
      });
      
      console.log('Shared question removed from profile successfully:', response.data);
      
      // Update notification to show removal from profile
      setDeleteNotification(prev => ({
        ...prev,
        showProgress: false,
        message: 'Question removed from your profile!'
      }));
      
      // Refetch shared questions to get updated list
      setTimeout(() => {
        fetchSharedQuestions();
      }, 1000);
      
    } catch (error) {
      console.error('=== UNSHARE ERROR DEBUG ===');
      console.error('Error removing shared question:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error stack:', error.stack);
      console.error('========================');
      
      // Don't restore the question if it was just removed from sharedQuestions
      // The user wanted to remove it from their profile, so keep it removed
      // Remove from deleted items since we're keeping it removed
      setDeletedSharedItems(prev => prev.filter(item => item._id !== questionId));
      
      // Show error notification - handle the error message properly
      let errorMessage = 'Failed to remove from profile';
      if (error.response?.data?.message) {
        errorMessage = `Failed to remove from profile: ${error.response.data.message}`;
      } else if (error.message) {
        // Check if it's the "next is not a function" error and provide a better message
        if (error.message.includes('next is not a function')) {
          errorMessage = 'Failed to remove from profile: Server error occurred';
        } else {
          errorMessage = `Failed to remove from profile: ${error.message}`;
        }
      } else {
        errorMessage = 'Failed to remove from profile: Unknown error';
      }
      
      // Show notification
      setDeleteNotification({
        open: true,
        message: errorMessage,
        itemName: itemName,
        severity: 'error',
        showProgress: false
      });
    }
  };

  const undoDeleteShared = () => {
    const lastDeleted = deletedSharedItems[deletedSharedItems.length - 1];
    if (!lastDeleted) return;
    
    // Restore the deleted shared question
    setSharedQuestions(prev => [lastDeleted, ...prev]);
    
    // Remove from deleted items
    setDeletedSharedItems(prev => prev.slice(0, -1));
    
    // Show success notification
    setDeleteNotification({
      open: true,
      message: 'Shared question restored successfully!',
      itemName: lastDeleted.title,
      severity: 'success',
      showProgress: false
    });
  };

  const handleShareToProfile = async (question) => {
    try {
      await axios.post(`http://localhost:5000/api/questions/${question._id}/share`, {
        userId: currentUserId
      });
      
      setSharedQuestions(prev => prev.map(q => 
        q._id === question._id 
          ? { ...q, shares: (q.shares || 0) + 1 }
          : q
      ));
      
      setShareMenu(null);
    } catch (error) {
      console.error('Error sharing question:', error);
    }
  };

  // Handle comment
  const handleComment = (question) => {
    setSelectedQuestion(question);
    setCommentDialog(true);
    setCommentText('');
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !selectedQuestion) {
      console.log('Cannot submit comment: missing text or question');
      return;
    }

    console.log('Submitting comment with text:', commentText);
    console.log('Selected question:', selectedQuestion);

    try {
      // Send comment to backend
      const response = await axios.post('http://localhost:5000/api/comments', {
        content: commentText,
        author: currentUserId,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        question: selectedQuestion._id
      });

      console.log('Backend response:', response.data);

      const newComment = {
        id: response.data._id,
        author: {
          id: response.data.author._id,
          name: response.data.author._id === currentUserId ? currentUser.name : (response.data.author.fullName || response.data.author.username),
          avatar: response.data.author._id === currentUserId ? currentUser.avatar : (response.data.author.avatar ? response.data.author.avatar.charAt(0).toUpperCase() : 'U')
        },
        text: response.data.content,
        timestamp: 'Just now',
        likes: []
      };

      console.log('New comment object:', newComment);

      // Update local state with functional update to ensure persistence
      setSharedQuestions(prev => {
        const updated = prev.map(q => {
          if (q._id === selectedQuestion._id) {
            const currentComments = q.comments || [];
            const updatedComments = [...currentComments, newComment];
            console.log('Question ID:', q._id);
            console.log('Current comments:', currentComments);
            console.log('Adding new comment:', newComment);
            console.log('Updated comments:', updatedComments);
            return { ...q, comments: updatedComments };
          }
          return q;
        });
        console.log('Updated questions state:', updated);
        return updated;
      });

      // Clear form
      setCommentDialog(false);
      setCommentText('');
      
      // Keep the comments expanded for this question
      setExpandedComments(prev => ({
        ...prev,
        [selectedQuestion._id]: true
      }));
    } catch (error) {
      console.error('Error posting comment:', error);
      // Fallback to local state if backend is not available
      const newComment = {
        id: Date.now(),
        author: currentUser,
        text: commentText,
        timestamp: 'Just now',
        likes: []
      };

      console.log('New comment object (fallback):', newComment);

      // Update local state with functional update to ensure persistence
      setSharedQuestions(prev => {
        const updated = prev.map(q => {
          if (q._id === selectedQuestion._id) {
            const currentComments = q.comments || [];
            const updatedComments = [...currentComments, newComment];
            console.log('Question ID:', q._id);
            console.log('Current comments:', currentComments);
            console.log('Adding new comment:', newComment);
            console.log('Updated comments:', updatedComments);
            return { ...q, comments: updatedComments };
          }
          return q;
        });
        console.log('Updated questions state:', updated);
        return updated;
      });

      // Clear form
      setCommentDialog(false);
      setCommentText('');
      
      // Keep the comments expanded for this question
      setExpandedComments(prev => ({
        ...prev,
        [selectedQuestion._id]: true
      }));
    }
  };

  const handleDeleteComment = async (questionId, commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
          data: { userId: currentUserId }
        });
        
        // Update comments in sharedQuestions state
        setSharedQuestions(prev => prev.map(q => {
          if (q._id === questionId) {
            return {
              ...q,
              comments: (q.comments || []).filter(c => c.id !== commentId)
            };
          }
          return q;
        }));
        
        console.log('Comment deleted successfully');
      } catch (error) {
        console.error('Error deleting comment:', error);
        // Fallback to local state if backend is not available
        setSharedQuestions(prev => prev.map(q => {
          if (q._id === questionId) {
            return {
              ...q,
              comments: (q.comments || []).filter(c => c.id !== commentId)
            };
          }
          return q;
        }));
        
        console.log('Comment deleted successfully (offline mode)');
      }
    }
  };

  const toggleComments = (questionId) => {
    setExpandedComments(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleLikeComment = (questionId, commentId) => {
    // Update comment likes in the shared questions state
    setSharedQuestions(prev => prev.map(q => {
      if (q._id === questionId) {
        return {
          ...q,
          comments: (q.comments || []).map(c => {
            if (c.id === commentId) {
              const likes = Array.isArray(c.likes) ? c.likes : [];
              const isLiked = likes.includes(currentUserId);
              return {
                ...c,
                likes: isLiked 
                  ? likes.filter(id => id !== currentUserId)
                  : [...likes, currentUserId]
              };
            }
            return c;
          })
        };
      }
      return q;
    }));
  };

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      // Mock friends data - in real app, this would be an API call
      const mockFriends = [
        { id: 1, name: 'Alice Johnson', username: 'alicej', avatar: 'AJ', mutual: 12 },
        { id: 2, name: 'Bob Smith', username: 'bobsmith', avatar: 'BS', mutual: 8 },
        { id: 3, name: 'Carol White', username: 'carolw', avatar: 'CW', mutual: 15 },
        { id: 4, name: 'David Brown', username: 'davidb', avatar: 'DB', mutual: 6 },
        { id: 5, name: 'Emma Davis', username: 'emmad', avatar: 'ED', mutual: 20 }
      ];
      setFriends(mockFriends);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      setLoadingFollowers(true);
      // Mock followers data - in real app, this would be an API call
      const mockFollowers = [
        { id: 6, name: 'Frank Wilson', username: 'frankw', avatar: 'FW', followedAt: '2 days ago' },
        { id: 7, name: 'Grace Lee', username: 'gracel', avatar: 'GL', followedAt: '1 week ago' },
        { id: 8, name: 'Henry Taylor', username: 'henryt', avatar: 'HT', followedAt: '2 weeks ago' },
        { id: 9, name: 'Ivy Martinez', username: 'ivym', avatar: 'IM', followedAt: '3 weeks ago' },
        { id: 10, name: 'Jack Anderson', username: 'jacka', avatar: 'JA', followedAt: '1 month ago' },
        { id: 11, name: 'Kate Thomas', username: 'katet', avatar: 'KT', followedAt: '2 months ago' }
      ];
      setFollowers(mockFollowers);
    } catch (error) {
      console.error('Error fetching followers:', error);
      setFollowers([]);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const handleFollowUser = (userId) => {
    // In real app, this would call API to follow user
    setFollowers(prev => prev.map(follower => 
      follower.id === userId 
        ? { ...follower, isFollowing: true }
        : follower
    ));
  };
  
  // Fetch user statistics when component mounts
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!currentUserId) {
        console.log('No currentUserId found, user:', user);
        return;
      }
      
      try {
        console.log('Fetching stats for userId:', currentUserId);
        setStatsLoading(true);
        const response = await axios.get(`http://localhost:5000/api/users/${currentUserId}/stats`);
        
        console.log('User stats response:', response.data);
        setUserStats(response.data.stats);
        setRecentActivity(response.data.recentActivity);
        
        // Update userProfile with real data
        userProfile.followers = response.data.followers;
        userProfile.following = response.data.following;
        userProfile.reputation = response.data.reputation;
        userProfile.stats = response.data.stats;
        
      } catch (error) {
        console.error('Error fetching user statistics:', error);
        console.error('Error response:', error.response?.data);
      } finally {
        setStatsLoading(false);
      }
    };

    const fetchUserQuestions = async () => {
      if (!currentUserId) return;
      
      try {
        setQuestionsLoading(true);
        const response = await axios.get(`http://localhost:5000/api/users/${currentUserId}`);
        
        setUserQuestions(response.data.questions || []);
        
      } catch (error) {
        console.error('Error fetching user questions:', error);
        setUserQuestions([]);
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchUserStats();
    fetchUserQuestions();
  }, [currentUserId]);

  // Real user profile data
  const userProfile = {
    id: user?._id || 'currentUserId',
    username: user?.username || 'user',
    email: user?.email || 'user@example.com',
    fullName: user?.fullName || user?.username || 'User',
    avatar: user?.username?.charAt(0).toUpperCase() || 'U',
    bio: user?.bio || 'Computer Science student passionate about AI and machine learning. Love helping others solve complex problems!',
    semester: user?.semester ? `Semester ${user.semester}` : '1st Year',
    branch: user?.branch || 'Computer Science',
    reputation: user?.reputation || 0,
    isVerified: user?.isVerified || false,
    joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '2026 March',
    followers: user?.followers?.length || 0,
    following: user?.following?.length || 0,
    stats: userStats,
    skills: ['JavaScript', 'React', 'Python', 'Machine Learning', 'Data Structures'],
    interests: ['AI', 'Web Development', 'Algorithms', 'Database Design']
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFollow = () => {
    setFollowed(!followed);
  };

  const handleEditProfile = () => {
    setEditFormData({
      fullName: userProfile.fullName,
      username: userProfile.username,
      email: userProfile.email,
      bio: userProfile.bio,
      semester: userProfile.semester,
      branch: userProfile.branch
    });
    setEditDialog(true);
  };

  const handleSaveProfile = () => {
    // Update the userProfile with the new data
    userProfile.fullName = editFormData.fullName;
    userProfile.username = editFormData.username;
    userProfile.email = editFormData.email;
    userProfile.bio = editFormData.bio;
    userProfile.semester = editFormData.semester;
    userProfile.branch = editFormData.branch;
    setEditDialog(false);
  };

  const handleSavePost = (postId) => {
    setSavedPosts(prev => prev + 1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(147, 51, 234, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2 }}>
          <IconButton onClick={(e) => setSettingsMenu(e.currentTarget)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            <MoreVert />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar sx={{ width: 100, height: 100, bgcolor: 'linear-gradient(45deg, #9333ea, #ec4899)', fontSize: '2.5rem', border: '3px solid rgba(147, 51, 234, 0.5)' }}>
              {userProfile.avatar}
            </Avatar>
            <IconButton sx={{ position: 'absolute', bottom: -5, right: -5, bgcolor: '#9333ea', color: '#fff', '&:hover': { bgcolor: '#7c3aed' } }}>
              <Camera fontSize="small" />
            </IconButton>
          </Box>
          
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#fff' }}>
                {userProfile.fullName}
              </Typography>
              {userProfile.isVerified && (
                <Verified sx={{ color: '#4caf50', fontSize: 28 }} />
              )}
            </Box>
            
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
              @{userProfile.username}
            </Typography>
            
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
              {userProfile.bio}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip icon={<School />} label={userProfile.semester} size="small" sx={{ background: 'rgba(147, 51, 234, 0.2)', color: '#9333ea' }} />
              <Chip icon={<Book />} label={userProfile.branch} size="small" sx={{ background: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }} />
              <Chip icon={<CalendarToday />} label={userProfile.joinDate} size="small" sx={{ background: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' }} />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>{userProfile.followers}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Followers</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>{userProfile.following}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Following</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>{userProfile.reputation}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Reputation</Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant={followed ? "outlined" : "contained"}
                onClick={handleFollow}
                startIcon={followed ? <Person /> : <PersonAdd />}
                sx={{
                  borderColor: 'rgba(147, 51, 234, 0.5)',
                  color: followed ? '#9333ea' : '#fff',
                  background: followed ? 'transparent' : 'linear-gradient(45deg, #9333ea, #ec4899)',
                  '&:hover': {
                background: followed ? 'rgba(147, 51, 234, 0.1)' : 'linear-gradient(45deg, #7c3aed, #db2777)'
              }
                }}
              >
                {followed ? 'Following' : 'Follow'}
              </Button>
              <Button 
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleShare}
                sx={{
                  borderColor: 'rgba(147, 51, 234, 0.5)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                borderColor: '#9333ea',
                color: '#9333ea'
              }
                }}
              >
                Share Profile
              </Button>
              <Button 
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEditProfile}
                sx={{
                  borderColor: 'rgba(147, 51, 234, 0.5)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                borderColor: '#9333ea',
                color: '#9333ea'
              }
                }}
              >
                Edit Profile
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            textAlign: 'center',
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            '&:hover': { transform: 'translateY(-2px)', transition: 'all 0.3s ease' }
          }}>
            <QuestionAnswer sx={{ fontSize: 40, color: '#9333ea', mb: 1 }} />
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold' }}>
              {statsLoading ? '...' : userProfile.stats.questionsAsked}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Questions Asked</Typography>
          </Paper>
        </Grid>
        
        <Grid xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            textAlign: 'center',
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            '&:hover': { transform: 'translateY(-2px)', transition: 'all 0.3s ease' }
          }}>
            <ThumbUp sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold' }}>
              {statsLoading ? '...' : userProfile.stats.totalLikes}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Total Likes</Typography>
          </Paper>
        </Grid>
        
        <Grid xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            textAlign: 'center',
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            '&:hover': { transform: 'translateY(-2px)', transition: 'all 0.3s ease' }
          }}>
            <Poll sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold' }}>
              {statsLoading ? '...' : userProfile.stats.pollsCreated}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Polls Created</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Paper sx={{ 
        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px solid rgba(147, 51, 234, 0.3)'
      }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            borderBottom: '1px solid rgba(147, 51, 234, 0.3)',
            '& .MuiTab-root': { 
              color: 'rgba(255, 255, 255, 0.7)',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#9333ea',
                backgroundColor: 'rgba(147, 51, 234, 0.05)'
              }
            },
            '& .Mui-selected': { 
              color: '#9333ea',
              backgroundColor: 'rgba(147, 51, 234, 0.1)',
              fontWeight: 'bold'
            },
            '& .MuiTabs-indicator': { 
              backgroundColor: '#9333ea',
              height: '3px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            },
            '& .MuiTabs-flexContainer': {
              transition: 'all 0.3s ease'
            }
          }}
          TabIndicatorProps={{
            sx: {
              background: 'linear-gradient(90deg, #9333ea, #ec4899)',
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab icon={<Timeline />} label="Activity" />
          <Tab icon={<QuestionAnswer />} label="Questions" />
          <Tab icon={<ShareIcon />} label="Shared" />
          <Tab icon={<PersonAdd />} label="Friends" />
          <Tab icon={<PersonAdd />} label="Followers" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ 
          p: 3,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box
            sx={{
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'translateX(0)',
              opacity: 1
            }}
          >
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>Recent Activity</Typography>
              {statsLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading activity...</Typography>
                </Box>
              ) : recentActivity.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>No recent activity</Typography>
                </Box>
              ) : (
                <List>
                  {recentActivity.map((activity) => (
                    <React.Fragment key={activity.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {activity.type === 'question' && <QuestionAnswer sx={{ fontSize: 20, color: '#9333ea' }} />}
                              {activity.type === 'answer' && <Comment sx={{ fontSize: 20, color: '#ec4899' }} />}
                              {activity.type === 'poll' && <Poll sx={{ fontSize: 20, color: '#ff9800' }} />}
                              <Typography variant="body1" component="span" sx={{ color: '#fff', fontWeight: 'medium' }}>
                                {activity.title}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                <Typography variant="caption" component="span" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                  {activity.timestamp}
                                </Typography>
                                {activity.points && (
                                  <Chip label={activity.points} size="small" sx={{ background: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' }} />
                                )}
                                {activity.bestAnswer && (
                                  <Chip label="Best Answer" size="small" sx={{ background: 'rgba(255, 193, 7, 0.2)', color: '#ffc107' }} />
                                )}
                              </Box>
                            {activity.likes && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ThumbUp sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)' }} />
                                <Typography variant="caption" component="span" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                  {activity.likes}
                                </Typography>
                              </Box>
                            )}
                            {activity.comments && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Comment sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)' }} />
                                <Typography variant="caption" component="span" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                  {activity.comments}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                    <Divider sx={{ borderColor: 'rgba(147, 51, 234, 0.2)' }} />
                  </React.Fragment>
                ))}
              </List>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>My Questions</Typography>
              {questionsLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading questions...</Typography>
                </Box>
              ) : userQuestions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>No questions asked yet</Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/questions')}
                  >
                    Ask Your First Question
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {userQuestions.map((question) => (
                    <Grid size={{ xs: 12 }} key={question._id}>
                      <Paper sx={{ 
                        p: 2, 
                        background: 'rgba(147, 51, 234, 0.1)',
                        border: '1px solid rgba(147, 51, 234, 0.3)',
                        '&:hover': { background: 'rgba(147, 51, 234, 0.2)' }
                      }}>
                        <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>{question.title}</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
                          {question.content || question.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ThumbUp sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)' }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              {question.likes?.length || 0}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Comment sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)' }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              {question.comments?.length || 0}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Visibility sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)' }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              {question.views || 0}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            {new Date(question.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        {question.tags && question.tags.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                            {question.tags.map((tag, index) => (
                              <Chip 
                                key={index} 
                                label={tag} 
                                size="small" 
                                sx={{ 
                                  background: 'rgba(147, 51, 234, 0.2)', 
                                  color: '#9333ea',
                                  fontSize: '0.7rem'
                                }} 
                              />
                            ))}
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>Shared Questions</Typography>
              {sharedQuestions.length > 0 ? (
                <Grid container spacing={2}>
                  {sharedQuestions.map((question) => (
                    <Grid size={{ xs: 12 }} key={question._id}>
                      <Paper sx={{ 
                        p: 2, 
                        background: 'rgba(147, 51, 234, 0.1)',
                        border: '1px solid rgba(147, 51, 234, 0.3)',
                        '&:hover': { background: 'rgba(147, 51, 234, 0.2)' }
                      }}>
                        <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>{question.title}</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
                          {question.description}
                        </Typography>
                        
                        {/* Question Metadata */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '12px', bgcolor: '#9333ea' }}>
                              {question.author?.avatar || 'U'}
                            </Avatar>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              {question.author?.name || 'Unknown'}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            {question.timestamp || 'Recently'}
                          </Typography>
                          {question.subject && (
                            <Chip 
                              label={question.subject} 
                              size="small" 
                              sx={{ 
                                background: 'rgba(76, 175, 80, 0.2)', 
                                color: '#4caf50',
                                fontSize: '10px',
                                height: 20
                              }} 
                            />
                          )}
                        </Box>

                        {/* Interactive Buttons */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleLike(question._id)}
                            sx={{
                              color: Array.isArray(question.likes) && question.likes.includes(currentUserId) ? '#9333ea' : 'rgba(255, 255, 255, 0.5)',
                              '&:hover': { color: '#9333ea' }
                            }}
                          >
                            <ThumbUp fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center' }}>
                            {Array.isArray(question.likes) ? question.likes.length : 0}
                          </Typography>
                          
                          <IconButton
                            size="small"
                            onClick={() => handleComment(question)}
                            sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: '#ec4899' } }}
                          >
                            <Comment fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center' }}>
                            {Array.isArray(question.comments) ? question.comments.length : 0}
                          </Typography>
                          
                          <IconButton
                            size="small"
                            onClick={(event) => handleShare(event, question)}
                            sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: '#4caf50' } }}
                          >
                            <Share fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center' }}>
                            {question.shares || 0}
                          </Typography>

                          {/* Delete Button - Show for original author or profile owner */}
                          {(question.author?.id === currentUserId || true) && (
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteSharedQuestion(question)}
                              sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: '#f44336' } }}
                              title="Remove shared question"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </Box>

                        {/* Comments Section */}
                        <Box>
                          <Button
                            size="small"
                            onClick={() => toggleComments(question._id)}
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.7)', 
                              '&:hover': { 
                                color: '#9333ea',
                                backgroundColor: 'rgba(147, 51, 234, 0.1)'
                              },
                              borderRadius: 2,
                              px: 2,
                              py: 1,
                              transition: 'all 0.3s ease',
                              border: '1px solid rgba(147, 51, 234, 0.2)',
                              textTransform: 'none',
                              fontSize: '14px'
                            }}
                            startIcon={
                              <ExpandMore 
                                sx={{ 
                                  transition: 'transform 0.3s ease',
                                  transform: expandedComments[question._id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                  fontSize: '20px'
                                }} 
                              />
                            }
                          >
                            {expandedComments[question._id] ? 'Hide Comments' : 'Show Comments'}
                            <Chip 
                              label={Array.isArray(question.comments) ? question.comments.length : 0}
                              size="small"
                              sx={{ 
                                ml: 1, 
                                height: 20, 
                                fontSize: '11px',
                                background: 'rgba(147, 51, 234, 0.2)',
                                color: '#9333ea',
                                border: '1px solid rgba(147, 51, 234, 0.3)'
                              }} 
                            />
                          </Button>
                        </Box>

                        <Collapse in={expandedComments[question._id]} timeout="auto" unmountOnExit>
                          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(147, 51, 234, 0.2)' }}>
                            {Array.isArray(question.comments) && question.comments.length > 0 ? (
                              <List dense>
                                {question.comments.map((comment) => (
                                  <ListItem key={comment.id} sx={{ px: 0 }}>
                                    <ListItemAvatar>
                                      <Avatar sx={{ width: 32, height: 32, bgcolor: comment.author.id === currentUserId ? '#9333ea' : '#2196f3' }}>
                                        {comment.author.id === currentUserId ? currentUser.avatar : comment.author.avatar}
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={
                                        <Box display="flex" alignItems="center" gap={1}>
                                          <Typography variant="subtitle2" component="span" sx={{ color: '#fff', fontWeight: 'bold' }}>
                                            {comment.author.id === currentUserId ? currentUser.name : comment.author.name}
                                          </Typography>
                                          <Typography variant="caption" component="span" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                            {comment.timestamp}
                                          </Typography>
                                        </Box>
                                      }
                                      secondary={
                                        <Box>
                                          <Typography variant="body2" component="div" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                                            {comment.text}
                                          </Typography>
                                          <Box display="flex" alignItems="center" gap={1}>
                                            <IconButton
                                              size="small"
                                              onClick={() => handleLikeComment(question._id, comment.id)}
                                              sx={{
                                                color: Array.isArray(comment.likes) && comment.likes.includes(currentUserId) ? '#9333ea' : 'rgba(255, 255, 255, 0.5)',
                                                '&:hover': { color: '#9333ea' }
                                              }}
                                            >
                                              <ThumbUp fontSize="small" sx={{ fontSize: 16 }} />
                                            </IconButton>
                                            <Typography variant="caption" component="span" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                              {Array.isArray(comment.likes) ? comment.likes.length : 0}
                                            </Typography>
                                            {comment.author.id === currentUserId && (
                                              <IconButton
                                                size="small"
                                                onClick={() => handleDeleteComment(question._id, comment.id)}
                                                sx={{
                                                  color: 'rgba(255, 255, 255, 0.5)',
                                                  '&:hover': { color: '#f44336' }
                                                }}
                                              >
                                                <Delete fontSize="small" sx={{ fontSize: 16 }} />
                                              </IconButton>
                                            )}
                                          </Box>
                                        </Box>
                                      }
                                      secondaryTypographyProps={{ component: 'div' }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', py: 2 }}>
                                No comments yet. Be the first to comment!
                              </Typography>
                            )}
                          </Box>
                        </Collapse>

                        {/* Question Meta Info */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Visibility sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)' }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              {question.views || 0}
                            </Typography>
                          </Box>
                          {question.author && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Avatar sx={{ width: 20, height: 20, fontSize: 12, bgcolor: '#1976d2' }}>
                                {question.author.fullName ? question.author.fullName.charAt(0).toUpperCase() : (question.author.username ? question.author.username.charAt(0).toUpperCase() : 'U')}
                              </Avatar>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                {question.author.fullName || question.author.username}
                              </Typography>
                            </Box>
                          )}
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', ml: 'auto' }}>
                            {new Date(question.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', py: 4 }}>
                  You haven't shared any questions yet. Share questions from the main page to see them here!
                </Typography>
              )}
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>Friends</Typography>
              {loadingFriends ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Loading friends...
                  </Typography>
                </Box>
              ) : friends.length > 0 ? (
                <Grid container spacing={2}>
                  {friends.map((friend) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={friend.id}>
                      <Paper sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        background: 'rgba(147, 51, 234, 0.1)',
                        border: '1px solid rgba(147, 51, 234, 0.3)',
                        '&:hover': { background: 'rgba(147, 51, 234, 0.2)' }
                      }}>
                        <Avatar sx={{ 
                          width: 60, 
                          height: 60, 
                          mx: 'auto', 
                          mb: 2, 
                          bgcolor: '#1976d2',
                          fontSize: 24
                        }}>
                          {friend.avatar}
                        </Avatar>
                        <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                          {friend.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                          @{friend.username}
                        </Typography>
                        {friend.mutual && (
                          <Chip 
                            label={`${friend.mutual} mutual friends`} 
                            size="small" 
                            sx={{ 
                              background: 'rgba(76, 175, 80, 0.2)', 
                              color: '#4caf50',
                              border: '1px solid rgba(76, 175, 80, 0.3)'
                            }} 
                          />
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ 
                            mt: 2,
                            borderColor: 'rgba(147, 51, 234, 0.5)',
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&:hover': {
                              borderColor: '#9333ea',
                              background: 'rgba(147, 51, 234, 0.1)'
                            }
                          }}
                        >
                          View Profile
                        </Button>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', py: 4 }}>
                  No friends yet. Start connecting with other users!
                </Typography>
              )}
            </Box>
          )}

          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>Followers</Typography>
              {loadingFollowers ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Loading followers...
                  </Typography>
                </Box>
              ) : followers.length > 0 ? (
                <List>
                  {followers.map((follower) => (
                    <React.Fragment key={follower.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#2196f3' }}>
                            {follower.avatar}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1" component="span" sx={{ color: '#fff', fontWeight: 'bold' }}>
                                {follower.name}
                              </Typography>
                              <Typography variant="caption" component="span" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                @{follower.username}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                <Typography variant="caption" component="span" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                  Started following {follower.followedAt}
                                </Typography>
                              </Box>
                              <Box sx={{ mt: 1 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleFollowUser(follower.id)}
                                  disabled={follower.isFollowing}
                                  sx={{ 
                                    borderColor: 'rgba(147, 51, 234, 0.5)',
                                    color: follower.isFollowing ? '#4caf50' : 'rgba(255, 255, 255, 0.7)',
                                    '&:hover': {
                                      borderColor: follower.isFollowing ? '#4caf50' : '#9333ea',
                                      background: follower.isFollowing ? 'rgba(76, 175, 80, 0.1)' : 'rgba(147, 51, 234, 0.1)'
                                    }
                                  }}
                                >
                                  {follower.isFollowing ? 'Following' : 'Follow Back'}
                                </Button>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider sx={{ borderColor: 'rgba(147, 51, 234, 0.2)' }} />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', py: 4 }}>
                  No followers yet. Share great content to attract followers!
                </Typography>
              )}
            </Box>
          )}

          </Box>
        </Box>
      </Paper>

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsMenu}
        open={Boolean(settingsMenu)}
        onClose={() => setSettingsMenu(null)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            color: '#fff'
          }
        }}
      >
        <MenuItem sx={{ color: 'rgba(255, 255, 255, 0.8)', '&:hover': { background: 'rgba(147, 51, 234, 0.1)' } }}>
          <Settings sx={{ mr: 1 }} /> Settings
        </MenuItem>
        <MenuItem sx={{ color: 'rgba(255, 255, 255, 0.8)', '&:hover': { background: 'rgba(147, 51, 234, 0.1)' } }}>
          <Notifications sx={{ mr: 1 }} /> Notifications
        </MenuItem>
      </Menu>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={editDialog} 
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            color: '#fff'
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Full Name"
            value={editFormData.fullName}
            onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
            sx={{ mb: 2 }}
            InputProps={{
              sx: { color: '#fff' }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
          <TextField
            fullWidth
            label="Username"
            value={editFormData.username}
            onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
            sx={{ mb: 2 }}
            InputProps={{
              sx: { color: '#fff' }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
          <TextField
            fullWidth
            label="Email"
            value={editFormData.email}
            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
            sx={{ mb: 2 }}
            InputProps={{
              sx: { color: '#fff' }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
          <TextField
            fullWidth
            label="Bio"
            multiline
            rows={3}
            value={editFormData.bio}
            onChange={(e) => setEditFormData({...editFormData, bio: e.target.value})}
            sx={{ mb: 2 }}
            InputProps={{
              sx: { color: '#fff' }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
          <TextField
            fullWidth
            label="Semester"
            value={editFormData.semester}
            onChange={(e) => setEditFormData({...editFormData, semester: e.target.value})}
            sx={{ mb: 2 }}
            InputProps={{
              sx: { color: '#fff' }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
          <TextField
            fullWidth
            label="Branch"
            value={editFormData.branch}
            onChange={(e) => setEditFormData({...editFormData, branch: e.target.value})}
            sx={{ mb: 2 }}
            InputProps={{
              sx: { color: '#fff' }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProfile}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #9333ea, #ec4899)',
              color: '#fff'
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog 
        open={commentDialog} 
        onClose={() => setCommentDialog(false)}
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            color: '#fff'
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(147, 51, 234, 0.3)' }}>
          Add Comment
          <IconButton
            aria-label="close"
            onClick={() => setCommentDialog(false)}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: 8,
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: '#fff'
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ color: '#fff' }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Write your comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(147, 51, 234, 0.3)'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(147, 51, 234, 0.5)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9333ea'
              },
              '& .MuiInputBase-input': {
                color: '#fff'
              }
            }}
          />
        </DialogContent>
        
        <DialogActions sx={{ borderTop: '1px solid rgba(147, 51, 234, 0.3)' }}>
          <Button 
            onClick={() => setCommentDialog(false)}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitComment}
            variant="contained"
            startIcon={<Send />}
            sx={{
              background: 'linear-gradient(45deg, #9333ea, #ec4899)',
              '&:hover': {
                background: 'linear-gradient(45deg, #7c3aed, #db2777)'
              }
            }}
          >
            Post Comment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Menu */}
      <Menu
        anchorEl={shareMenu}
        open={Boolean(shareMenu)}
        onClose={() => setShareMenu(null)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            color: '#fff',
            mt: 1
          }
        }}
      >
        <MenuItem 
          onClick={() => selectedQuestion && handleShareToProfile(selectedQuestion)}
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { 
              background: 'rgba(147, 51, 234, 0.1)',
              color: '#fff'
            }
          }}
        >
          <Share sx={{ mr: 1, fontSize: 20 }} />
          Share to Profile
        </MenuItem>
        <MenuItem 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { 
              background: 'rgba(147, 51, 234, 0.1)',
              color: '#fff'
            }
          }}
        >
          <PersonAdd sx={{ mr: 1, fontSize: 20 }} />
          Share with Friends
        </MenuItem>
        <MenuItem 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { 
              background: 'rgba(147, 51, 234, 0.1)',
              color: '#fff'
            }
          }}
        >
          <Notifications sx={{ mr: 1, fontSize: 20 }} />
          Send Notification
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ 
            background: snackbar.severity === 'success' ? 'linear-gradient(45deg, #4caf50, #8bc34a)' :
                       snackbar.severity === 'error' ? 'linear-gradient(45deg, #f44336, #e91e63)' :
                       'linear-gradient(45deg, #9333ea, #ec4899)',
            color: '#fff',
            fontWeight: 'bold'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Enhanced Delete Notification */}
      <DeleteNotification
        open={deleteNotification.open}
        onClose={() => setDeleteNotification(prev => ({ ...prev, open: false }))}
        message={deleteNotification.message}
        itemName={deleteNotification.itemName}
        severity={deleteNotification.severity}
        undo={deleteNotification.severity === 'delete' ? undoDeleteShared : null}
        autoHideDuration={deleteNotification.showProgress ? 6000 : 3000}
        showProgress={deleteNotification.showProgress}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmNotification
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, itemName: '', questionId: null })}
        itemName={deleteConfirm.itemName}
        onConfirm={confirmDeleteShared}
        onCancel={() => setDeleteConfirm({ open: false, itemName: '', questionId: null })}
      />
    </Container>
  );
};

export default Profile;
