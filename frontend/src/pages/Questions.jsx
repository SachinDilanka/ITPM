import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  Add,
  Search,
  FilterList,
  ThumbUp,
  Visibility,
  Edit,
  Delete,
  Close,
  Send,
  Tag,
  School,
  Book,
  Lightbulb,
  ExpandMore,
  CalendarToday,
  Share,
  Comment,
  PersonAdd,
  Notifications,
  TrendingUp,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { InputAdornment } from '@mui/material';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Chip,
  IconButton,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Alert,
  Snackbar,
  Divider,
  Avatar,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  Fade,
  Collapse
} from '@mui/material';
import axios from 'axios';
import DeleteNotification, { DeleteConfirmNotification } from '../components/DeleteNotification.jsx';

const Questions = () => {
  // Current user (using actual logged-in user info)
  const currentUser = { id: '69c10289169fd1d0114d657d', name: 'Shenali Rodrigo', avatar: 'SR' };
  
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Enhanced delete notification states
  const [deleteNotification, setDeleteNotification] = useState({ 
    open: false, 
    message: '', 
    itemName: '', 
    severity: 'delete',
    showProgress: true 
  });

  // Comment delete notification state
  const [commentDeleteNotification, setCommentDeleteNotification] = useState({ 
    open: false, 
    message: '', 
    itemName: '', 
    severity: 'delete',
    showProgress: false 
  });

  // Comment delete confirmation dialog state
  const [commentDeleteConfirm, setCommentDeleteConfirm] = useState({ 
    open: false, 
    commentId: null, 
    questionId: null, 
    comment: null 
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, itemName: '', questionId: null });
  const [deletedItems, setDeletedItems] = useState([]); // For undo functionality
  
  // Comment and sharing states
  const [commentDialog, setCommentDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [shareMenu, setShareMenu] = useState(null);
  
  // Refs for comment inputs
  const commentInputRefs = useRef({});
  
  // Shared questions state
  const [sharedQuestions, setSharedQuestions] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    year: '',
    semester: '',
    subject: '',
    module: ''
  });

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return timestamp;
    }
  };
  const subjects = ['Introduction to Programming', 'Network Design and Management', 'Database Systems', 'Programming Applications and Frameworks'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const semesters = ['1st Semester', '2nd Semester'];

  // Memoized CommentItem component to prevent unnecessary re-renders
  const CommentItem = memo(({ comment, questionId, questionAuthorId, currentUser, onLikeComment, onDeleteComment, formatTimestamp }) => {
    // Check if user can delete this comment - both comment author and question author can delete
    const isCommentAuthor = comment.author?.id === currentUser.id;
    const isQuestionOwner = questionAuthorId === currentUser.id;
    const canDeleteComment = isCommentAuthor || isQuestionOwner;
    
    console.log('=== COMMENT ITEM DEBUG ===');
    console.log('Comment:', comment);
    console.log('Question Author ID:', questionAuthorId);
    console.log('Current User ID:', currentUser.id);
    console.log('Comment Author ID:', comment.author?.id);
    console.log('Is Comment Author:', isCommentAuthor);
    console.log('Is Question Owner:', isQuestionOwner);
    console.log('Can Delete Comment:', canDeleteComment);
    console.log('========================');
    
    return (
      <Box sx={{ mb: 2 }}>
        <Box 
          sx={{ 
            p: 2,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(147, 51, 234, 0.2)'
          }}
        >
          <Box display="flex" alignItems="flex-start" gap={2}>
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: comment.author?.id === currentUser.id ? '#9333ea' : '#2196f3',
                fontSize: '14px',
                fontWeight: 'bold',
                flexShrink: 0
              }}
            >
              {comment.author?.id === currentUser.id ? currentUser.avatar : 
               (comment.author?.avatar || 
                (comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 'U'))}
            </Avatar>
            <Box flex={1}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography 
                    variant="subtitle2" 
                    component="span" 
                    sx={{ 
                      color: '#fff', 
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    {comment.author?.id === currentUser.id ? currentUser.name : (comment.author?.fullName || comment.author?.name || 'Unknown User')}
                  </Typography>
                  {comment.author?.id === currentUser.id && (
                    <Chip 
                      label="You" 
                      size="small" 
                      sx={{ 
                        height: 20, 
                        fontSize: '10px',
                        background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                        color: '#fff',
                        ml: 1
                      }} 
                    />
                  )}
                </Box>
                <Typography 
                  variant="caption" 
                  component="span" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '11px'
                  }}
                >
                  {formatTimestamp(comment.timestamp)}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '14px',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                  mb: 1.5
                }}
              >
                {comment.text}
              </Typography>
              <Box 
                display="flex" 
                alignItems="center" 
                gap={1}
              >
                <IconButton
                  size="small"
                  onClick={() => onLikeComment(questionId, comment.id)}
                  sx={{
                    color: Array.isArray(comment.likes) && comment.likes.includes(currentUser.id) ? '#9333ea' : 'rgba(255, 255, 255, 0.5)',
                    '&:hover': { color: '#9333ea' },
                    fontSize: '12px',
                    p: 0.5
                  }}
                >
                  <ThumbUp sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography 
                  variant="caption" 
                  component="span" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '12px',
                    minWidth: '20px'
                  }}
                >
                  {Array.isArray(comment.likes) ? comment.likes.length : 0}
                </Typography>
                {canDeleteComment && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      console.log('=== COMMENT DELETE BUTTON CLICKED ===');
                      console.log('Question ID:', questionId);
                      console.log('Comment ID:', comment.id);
                      console.log('Can Delete:', canDeleteComment);
                      console.log('Calling onDeleteComment...');
                      
                      // Double-check authorization before allowing deletion
                      if (canDeleteComment) {
                        onDeleteComment(questionId, comment.id);
                      } else {
                        console.error('Unauthorized delete attempt');
                      }
                    }}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      '&:hover': { color: '#f44336' },
                      fontSize: '12px',
                      p: 0.5,
                      ml: 'auto'
                    }}
                    title={isCommentAuthor ? "Delete your comment" : "Delete comment from your question"}
                  >
                    <Delete sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  });

  // Helper function to normalize question data
  const normalizeQuestion = (question, includeYear = null) => ({
    ...question,
    tags: Array.isArray(question.tags) ? question.tags : (question.tags ? question.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []),
    sharedBy: Array.isArray(question.sharedBy) ? question.sharedBy : (question.sharedBy ? [question.sharedBy] : []),
    likes: Array.isArray(question.likes) ? question.likes : (question.likes ? [question.likes] : []),
    comments: Array.isArray(question.comments) ? question.comments : (question.comments ? question.comments : []),
    shares: question.shares || 0,
    views: question.views || 0,
    // Convert semester number back to display format
    semester: question.semester === 1 ? '1st Semester' : question.semester === 2 ? '2nd Semester' : question.semester,
    // Include year if provided (for new questions)
    year: includeYear || question.year,
    // Format author object if it's populated
    author: question.author && typeof question.author === 'object' ? question.author : { id: question.author, name: 'Unknown', avatar: 'U' }
  });

  const applyFilters = useCallback(() => {
    let filtered = questions.map(q => normalizeQuestion(q));
    
    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterSubject && filterSubject.trim()) {
      filtered = filtered.filter(q => q.subject === filterSubject);
    }
    
    if (filterYear && filterYear.trim()) {
      filtered = filtered.filter(q => q.year === filterYear);
    }
    
    if (filterSemester && filterSemester.trim()) {
      filtered = filtered.filter(q => q.semester === filterSemester);
    }

    setFilteredQuestions(filtered);
    setTotalPages(1);
  }, [questions, searchTerm, filterSubject, filterYear, filterSemester]);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchQuestions = useCallback(async () => {
    try {
      console.log('Fetching questions from backend...');
      const response = await axios.get('http://localhost:5000/api/questions');
      console.log('Successfully fetched questions:', response.data.questions?.length || 0, 'questions');
      
      // Preserve existing comments when updating questions
      const normalizedQuestions = response.data.questions.map(q => {
        const existingQuestion = questions.find(eq => eq._id === q._id);
        const existingFilteredQuestion = filteredQuestions.find(fq => fq._id === q._id);
        return normalizeQuestion({
          ...q,
          comments: existingQuestion?.comments || existingFilteredQuestion?.comments || []
        }, existingQuestion?.year || existingFilteredQuestion?.year || '2nd Year'); // Default year for existing questions
      });
      setQuestions(normalizedQuestions);
      setFilteredQuestions(normalizedQuestions);

      // Fetch comments for all questions (simplified approach)
      const commentsPromises = normalizedQuestions.map(async (question) => {
        try {
          const commentsResponse = await axios.get(`http://localhost:5000/api/comments/question/${question._id}`);
          return {
            questionId: question._id,
            comments: commentsResponse.data.map(c => ({
              id: c._id,
              author: {
                id: c.author._id,
                name: c.author._id === currentUser.id ? currentUser.name : (c.author.fullName || c.author.username || 'Unknown User'),
                avatar: c.author.avatar ? c.author.avatar.charAt(0).toUpperCase() : 'U'
              },
              text: c.content,
              timestamp: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
              likes: c.likes ? c.likes.map(like => like._id || like) : []
            }))
          };
        } catch (error) {
          console.error('Error fetching comments for question:', question._id, error);
          return { questionId: question._id, comments: [] };
        }
      });

      const commentsResults = await Promise.all(commentsPromises);
      
      // Update all questions with their comments at once
      setQuestions(prev => prev.map(q => {
        const commentResult = commentsResults.find(cr => cr.questionId === q._id);
        return commentResult ? { ...q, comments: commentResult.comments } : q;
      }));

      setFilteredQuestions(prev => prev.map(q => {
        const commentResult = commentsResults.find(cr => cr.questionId === q._id);
        return commentResult ? { ...q, comments: commentResult.comments } : q;
      }));

    } catch (error) {
      console.error('Error fetching questions from backend:', error);
      // Only fallback to mock data if we have no data at all
      if (questions.length === 0 && filteredQuestions.length === 0) {
        console.log('Falling back to mock data...');
        const mockQuestions = [
          {
            _id: 1,
            title: "How to solve differential equations?",
            description: "I'm struggling with understanding the method for solving first-order differential equations.",
            year: "2nd Year",
            semester: "1st Semester",
            subject: "Mathematics",
            module: "Calculus II",
            tags: ["differential-equations", "calculus", "math"],
            author: { id: 'user1', name: "John Doe", avatar: "JD" },
            likes: ['user2', 'user3'],
            views: 45,
            aiHighlighted: true,
            comments: [
              { id: 1, author: { id: 'user2', name: "Jane Smith", avatar: "JS" }, text: "Have you tried separation of variables method?", timestamp: "2 hours ago", likes: [] },
              { id: 2, author: { id: 'user3', name: "Mike Johnson", avatar: "MJ" }, text: "Check out Khan Academy's videos on this topic", timestamp: "1 hour ago", likes: ['user2'] }
            ],
            shares: 3,
            sharedBy: ['user4', 'user5'],
            createdAt: "3 hours ago"
          },
          {
            _id: 2,
            title: "Physics lab report help needed",
            description: "Need help with writing the conclusion section for my pendulum experiment.",
            year: "1st Year",
            semester: "2nd Semester",
            subject: "Physics",
            module: "Mechanics",
            tags: ["physics", "lab-report", "pendulum"],
            author: { id: 'user2', name: "Jane Smith", avatar: "JS" },
            likes: ['user1'],
            views: 23,
            aiHighlighted: false,
            comments: [
              { id: 3, author: { id: 'user1', name: "John Doe", avatar: "JD" }, text: "Make sure to include error analysis", timestamp: "30 minutes ago", likes: [] }
            ],
            shares: 1,
            sharedBy: ['user3'],
            createdAt: "5 hours ago"
          }
        ];
        const normalizedMockQuestions = mockQuestions.map(q => normalizeQuestion(q));
        setQuestions(normalizedMockQuestions);
        setFilteredQuestions(normalizedMockQuestions);
        showSnackbar('Running in demo mode - backend not available', 'info');
      } else {
        showSnackbar('Backend temporarily unavailable - showing cached data', 'warning');
      }
    }
  }, [questions, filteredQuestions, showSnackbar]);

  useEffect(() => {
    fetchQuestions();
  }, []); // Only fetch on mount

  useEffect(() => {
    // Apply filters whenever filter dependencies change
    applyFilters();
  }, [applyFilters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.title.trim() || !formData.description.trim() || !formData.subject.trim() || !formData.year.trim() || !formData.semester.trim()) {
        showSnackbar('Please fill in all required fields (title, description, subject, year, semester)', 'error');
        return;
      }

      const questionData = {
        title: formData.title,
        description: formData.description,
        tags: formData.tags,
        semester: formData.semester === '1st Semester' ? 1 : 2,
        subject: formData.subject,
        module: formData.module,
        author: currentUser.id
      };

      if (editingQuestion) {
        // Update existing question
        console.log('Updating question:', editingQuestion._id, questionData);
        try {
          const response = await axios.put(`http://localhost:5000/api/questions/${editingQuestion._id}`, questionData);
          console.log('Update response:', response.data);
          
          const updatedQuestion = normalizeQuestion(response.data, formData.year);
          console.log('Normalized updated question:', updatedQuestion);
          
          setQuestions(prev => prev.map(q => 
            q._id === editingQuestion._id ? updatedQuestion : q
          ));
          setFilteredQuestions(prev => prev.map(q => 
            q._id === editingQuestion._id ? updatedQuestion : q
          ));
          showSnackbar('Question updated successfully', 'success');
        } catch (updateError) {
          console.error('Error updating question:', updateError);
          showSnackbar('Failed to update question: ' + (updateError.response?.data?.message || updateError.message), 'error');
          return;
        }
      } else {
        // Create new question
        const response = await axios.post('http://localhost:5000/api/questions', questionData);
        const newQuestion = normalizeQuestion(response.data, formData.year);
        setQuestions(prev => [newQuestion, ...prev]);
        setFilteredQuestions(prev => [newQuestion, ...prev]);
        showSnackbar('Question posted successfully', 'success');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving question:', error);
      // Fallback to local state if backend is not available
      const questionData = normalizeQuestion({
        ...formData,
        tags: Array.isArray(formData.tags) ? formData.tags : formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        _id: Date.now(), // Mock ID
        author: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar },
        likes: [],
        views: 0,
        aiHighlighted: false,
        comments: [],
        shares: 0,
        sharedBy: [],
        createdAt: new Date().toISOString()
      }, formData.year);

      if (editingQuestion) {
        setQuestions(prev => prev.map(q => 
          q._id === editingQuestion._id ? { ...questionData } : q
        ));
        setFilteredQuestions(prev => prev.map(q => 
          q._id === editingQuestion._id ? { ...questionData } : q
        ));
        showSnackbar('Question updated successfully (offline mode)', 'success');
      } else {
        setQuestions(prev => [questionData, ...prev]);
        setFilteredQuestions(prev => [questionData, ...prev]);
        showSnackbar('Question posted successfully (offline mode)', 'success');
      }
      handleCloseDialog();
    }
  };

  const handleDelete = (questionId) => {
    const question = [...questions, ...filteredQuestions].find(q => q._id === questionId);
    if (!question) {
      console.error('Question not found for ID:', questionId);
      return;
    }
    
    // Check if user is the question author
    if (!isQuestionAuthor(question)) {
      showSnackbar('You can only delete your own questions', 'error');
      return;
    }
    
    console.log('Attempting to delete question:', questionId, question.title);
    
    // Show interactive delete confirmation
    setDeleteConfirm({
      open: true,
      itemName: question.title,
      questionId: questionId
    });
  };

  const confirmDelete = async () => {
    const { questionId, itemName } = deleteConfirm;
    
    console.log('Confirming delete for question:', questionId, 'User:', currentUser.id);
    
    // Store the deleted item for potential undo
    console.log('=== CONFIRM DELETE DEBUG ===');
    console.log('Looking for question ID:', questionId);
    console.log('Questions array:', questions.map(q => ({ _id: q._id, title: q.title })));
    console.log('Filtered questions array:', filteredQuestions.map(q => ({ _id: q._id, title: q.title })));
    
    const allQuestions = [...questions, ...filteredQuestions];
    const deletedItem = allQuestions.find(q => q._id === questionId);
    
    console.log('Deleted item found:', deletedItem);
    console.log('============================');
    
    if (!deletedItem) {
      console.error('Question not found during confirm delete:', questionId);
      return;
    }
    
    // Validate user ID
    if (!currentUser.id) {
      console.error('No current user ID found');
      setDeleteNotification({
        open: true,
        message: 'User not authenticated',
        itemName: itemName,
        severity: 'error',
        showProgress: false
      });
      return;
    }
    
    setDeletedItems(prev => {
      console.log('Previous deleted items:', prev.length);
      const updated = [...prev, deletedItem];
      console.log('Updated deleted items:', updated.length);
      console.log('Added item:', deletedItem.title);
      return updated;
    });
    
    // Remove from UI IMMEDIATELY for instant feedback
    setQuestions(prev => prev.filter(q => q._id !== questionId));
    setFilteredQuestions(prev => prev.filter(q => q._id !== questionId));
    
    // Close confirmation dialog
    setDeleteConfirm({ open: false, itemName: '', questionId: null });
    
    // Check if this is mock data (string ID) or real data (ObjectId)
    const isMockData = typeof questionId === 'number' || (typeof questionId === 'string' && questionId.length < 24);
    
    if (isMockData) {
      // Handle mock data locally
      setDeleteNotification({
        open: true,
        message: 'Question deleted successfully!',
        itemName: itemName,
        severity: 'delete',
        showProgress: false
      });
      return;
    }
    
    // Show enhanced delete notification with undo option
    setDeleteNotification({
      open: true,
      message: 'Question deleted successfully!',
      itemName: itemName,
      severity: 'delete',
      showProgress: true
    });
    
    try {
      console.log('Making API call to delete question...');
      console.log('Question ID:', questionId);
      console.log('User ID:', currentUser.id);
      console.log('Request URL:', `http://localhost:5000/api/questions/${questionId}`);
      
      // Call backend API
      const response = await axios.delete(`http://localhost:5000/api/questions/${questionId}`, {
        data: { userId: currentUser.id }
      });
      
      console.log('Delete API Response:', response);
      console.log('Question deleted successfully:', response.data);
      
      // Update notification to show success
      setDeleteNotification(prev => ({
        ...prev,
        showProgress: false,
        message: 'Question deleted permanently!'
      }));
      
    } catch (error) {
      console.error('=== DELETE ERROR DEBUG ===');
      console.error('Error deleting question:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      console.error('Full error object:', error);
      console.error('========================');
      
      // If backend fails, put the question back and show error
      setQuestions(prev => [deletedItem, ...prev]);
      setFilteredQuestions(prev => [deletedItem, ...prev]);
      setDeletedItems(prev => prev.filter(item => item._id !== questionId));
      
      // Show error notification
      setDeleteNotification({
        open: true,
        message: `Delete failed: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        itemName: itemName,
        severity: 'error',
        showProgress: false
      });
    }
  };

  const undoDelete = () => {
    console.log('=== UNDO DELETE CALLED ===');
    console.log('Deleted items:', deletedItems);
    
    const lastDeleted = deletedItems[deletedItems.length - 1];
    if (!lastDeleted) {
      console.log('No deleted items to restore');
      return;
    }
    
    console.log('Restoring question:', lastDeleted);
    
    // Restore the deleted question to both states
    setQuestions(prev => {
      console.log('Previous questions:', prev.length);
      const updated = [lastDeleted, ...prev];
      console.log('Updated questions:', updated.length);
      return updated;
    });
    
    setFilteredQuestions(prev => {
      console.log('Previous filtered questions:', prev.length);
      const updated = [lastDeleted, ...prev];
      console.log('Updated filtered questions:', updated.length);
      return updated;
    });
    
    // Remove from deleted items
    setDeletedItems(prev => {
      const updated = prev.slice(0, -1);
      console.log('Remaining deleted items:', updated.length);
      return updated;
    });
    
    // Show success notification
    setDeleteNotification({
      open: true,
      message: 'Question restored successfully!',
      itemName: lastDeleted.title,
      severity: 'success',
      showProgress: false
    });
    
    console.log('=== UNDO DELETE COMPLETED ===');
  };

  const handleLike = async (questionId) => {
    // Check if this is mock data (string ID) or real data (ObjectId)
    const isMockData = typeof questionId === 'number' || (typeof questionId === 'string' && questionId.length < 24);
    
    if (isMockData) {
      // Handle mock data locally
      const updateLikes = (questions) => questions.map(q => {
        if (q._id === questionId) {
          const likes = Array.isArray(q.likes) ? q.likes : [];
          const isLiked = likes.includes(currentUser.id);
          return {
            ...q,
            likes: isLiked 
              ? likes.filter(id => id !== currentUser.id)
              : [...likes, currentUser.id]
          };
        }
        return q;
      });

      setQuestions(prev => updateLikes(prev));
      setFilteredQuestions(prev => updateLikes(prev));
      showSnackbar('Like updated (demo mode)', 'info');
      return;
    }

    // Handle real data with API call
    try {
      await axios.post(`http://localhost:5000/api/questions/${questionId}/like`, {
        userId: currentUser.id
      });
      
      // Update local state to preserve comments in both questions and filteredQuestions
      const updateLikes = (questions) => questions.map(q => {
        if (q._id === questionId) {
          const likes = Array.isArray(q.likes) ? q.likes : [];
          const isLiked = likes.includes(currentUser.id);
          return {
            ...q,
            likes: isLiked 
              ? likes.filter(id => id !== currentUser.id)
              : [...likes, currentUser.id]
          };
        }
        return q;
      });

      setQuestions(prev => updateLikes(prev));
      setFilteredQuestions(prev => updateLikes(prev));
    } catch (error) {
      console.error('Error liking question:', error);
      // Fallback to local state if backend is not available
      const updateLikes = (questions) => questions.map(q => {
        if (q._id === questionId) {
          const likes = Array.isArray(q.likes) ? q.likes : [];
          const isLiked = likes.includes(currentUser.id);
          return {
            ...q,
            likes: isLiked 
              ? likes.filter(id => id !== currentUser.id)
              : [...likes, currentUser.id]
          };
        }
        return q;
      });

      setQuestions(prev => updateLikes(prev));
      setFilteredQuestions(prev => updateLikes(prev));
      showSnackbar('Like updated (offline mode)', 'info');
    }
  };

  // New handlers for sharing and commenting
  const handleShare = (event, question) => {
    setSelectedQuestion(question);
    setShareMenu(event.currentTarget);
  };

  const handleShareToProfile = async (question) => {
    console.log('=== SHARING QUESTION ===');
    console.log('Question to share:', question);
    console.log('Current user:', currentUser);
    
    // Check if this is mock data (string ID) or real data (ObjectId)
    const isMockData = typeof question._id === 'number' || (typeof question._id === 'string' && question._id.length < 24);
    
    try {
      if (!isMockData) {
        console.log('Making API call to share question...');
        
        // Call backend to increment share count
        const response = await axios.post(`http://localhost:5000/api/questions/${question._id}/share`, {
          userId: currentUser.id
        });
        
        console.log('Share API response:', response.data);
      }
      
      // Update local state to reflect the share
      setQuestions(prev => prev.map(q => 
        q._id === question._id 
          ? { 
              ...q, 
              shares: (q.shares || 0) + 1, 
              sharedBy: Array.isArray(q.sharedBy) ? [...q.sharedBy, currentUser.id] : [currentUser.id]
            }
          : q
      ));
      
      setFilteredQuestions(prev => prev.map(q => 
        q._id === question._id 
          ? { 
              ...q, 
              shares: (q.shares || 0) + 1, 
              sharedBy: Array.isArray(q.sharedBy) ? [...q.sharedBy, currentUser.id] : [currentUser.id]
            }
          : q
      ));
      
      setShareMenu(null);
      showSnackbar(isMockData ? 'Question shared to your profile! (demo mode)' : 'Question shared to your profile!', 'success');
      
      // Prepare the shared question data for the event
      const sharedQuestionData = {
        ...question, 
        shares: (question.shares || 0) + 1, 
        sharedBy: Array.isArray(question.sharedBy) ? [...question.sharedBy, currentUser.id] : [currentUser.id]
      };
      
      console.log('Dispatching questionShared event with data:', sharedQuestionData);
      
      // Also update the Profile component's shared questions by triggering a storage event
      window.dispatchEvent(new CustomEvent('questionShared', { 
        detail: sharedQuestionData
      }));
      
      console.log('questionShared event dispatched successfully');
      
    } catch (error) {
      console.error('Error sharing question:', error);
      // Fallback to local state if backend is not available
      setQuestions(prev => prev.map(q => 
        q._id === question._id 
          ? { 
              ...q, 
              shares: (q.shares || 0) + 1, 
              sharedBy: Array.isArray(q.sharedBy) ? [...q.sharedBy, currentUser.id] : [currentUser.id]
            }
          : q
      ));
      
      setFilteredQuestions(prev => prev.map(q => 
        q._id === question._id 
          ? { 
              ...q, 
              shares: (q.shares || 0) + 1, 
              sharedBy: Array.isArray(q.sharedBy) ? [...q.sharedBy, currentUser.id] : [currentUser.id]
            }
          : q
      ));
      
      setShareMenu(null);
      showSnackbar('Question shared to your profile! (offline mode)', 'success');
      
      // Prepare the shared question data for the event
      const sharedQuestionData = {
        ...question, 
        shares: (question.shares || 0) + 1, 
        sharedBy: Array.isArray(question.sharedBy) ? [...question.sharedBy, currentUser.id] : [currentUser.id]
      };
      
      console.log('Dispatching questionShared event (offline mode) with data:', sharedQuestionData);
      
      // Also update the Profile component's shared questions in offline mode
      window.dispatchEvent(new CustomEvent('questionShared', { 
        detail: sharedQuestionData
      }));
      
      console.log('questionShared event dispatched successfully (offline mode)');
    }
  };

  const handleComment = (question) => {
    setSelectedQuestion(question);
    setCommentText('');
    // Auto-expand comments if they're not already expanded
    if (!expandedComments[question._id]) {
      toggleComments(question._id);
    }
    // Focus on the comment input after a short delay to ensure it's rendered
    setTimeout(() => {
      if (commentInputRefs.current[question._id]) {
        commentInputRefs.current[question._id].focus();
      }
    }, 100);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !selectedQuestion) {
      console.log('Cannot submit comment: missing text or question');
      return;
    }

    // Check if this is mock data (string ID) or real data (ObjectId)
    const isMockData = typeof selectedQuestion._id === 'number' || (typeof selectedQuestion._id === 'string' && selectedQuestion._id.length < 24);

    const commentData = {
      content: commentText.trim(),
      author: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      question: selectedQuestion._id
    };

    try {
      if (!isMockData) {
        // Send comment to backend
        const response = await axios.post('http://localhost:5000/api/comments', commentData);

        const newComment = {
          id: response.data._id,
          author: {
            id: response.data.author._id,
            name: response.data.author.fullName || response.data.author.username || 'Unknown User',
            avatar: response.data.author.avatar ? response.data.author.avatar.charAt(0).toUpperCase() : currentUser.avatar || 'U'
          },
          text: response.data.content,
          timestamp: response.data.createdAt || new Date().toISOString(),
          likes: []
        };

        // Update comments in both questions and filteredQuestions states
        const updateComments = (questions) => questions.map(q => 
          q._id === selectedQuestion._id 
            ? { ...q, comments: [...(q.comments || []), newComment] }
            : q
        );

        setQuestions(prev => updateComments(prev));
        setFilteredQuestions(prev => updateComments(prev));

        // Clear comment input and show success message
        setCommentText('');
        setSelectedQuestion(null);
        showSnackbar('Comment posted successfully!', 'success');
      } else {
        // Handle mock data locally
        const newComment = {
          id: Date.now(),
          author: {
            id: currentUser.id,
            name: currentUser.name || 'Unknown User',
            avatar: currentUser.avatar || 'U'
          },
          text: commentText.trim(),
          timestamp: new Date().toISOString(),
          likes: []
        };

        const updateComments = (questions) => questions.map(q => 
          q._id === selectedQuestion._id 
            ? { ...q, comments: [...(q.comments || []), newComment] }
            : q
        );

        setQuestions(prev => updateComments(prev));
        setFilteredQuestions(prev => updateComments(prev));

        // Clear comment input and show success message
        setCommentText('');
        setSelectedQuestion(null);
        showSnackbar('Comment posted successfully! (demo mode)', 'info');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      
      // Fallback to local state if backend is not available
      const newComment = {
        id: Date.now(),
        author: {
          id: currentUser.id,
          name: currentUser.name || 'Unknown User',
          avatar: currentUser.avatar || 'U'
        },
        text: commentText.trim(),
        timestamp: new Date().toISOString(),
        likes: []
      };

      const updateComments = (questions) => questions.map(q => 
        q._id === selectedQuestion._id 
          ? { ...q, comments: [...(q.comments || []), newComment] }
          : q
      );

      setQuestions(prev => updateComments(prev));
      setFilteredQuestions(prev => updateComments(prev));

      // Clear comment input and show success message
      setCommentText('');
      setSelectedQuestion(null);
      showSnackbar('Comment posted successfully! (offline mode)', 'info');
    }
  };

  const handleLikeComment = (questionId, commentId) => {
    // Update comment likes in both questions and filteredQuestions states
    const updateCommentLikes = (questions) => questions.map(q => {
      if (q._id === questionId) {
        return {
          ...q,
          comments: (q.comments || []).map(c => {
            if (c.id === commentId) {
              const likes = Array.isArray(c.likes) ? c.likes : [];
              const isLiked = likes.includes(currentUser.id);
              return {
                ...c,
                likes: isLiked 
                  ? likes.filter(id => id !== currentUser.id)
                  : [...likes, currentUser.id]
              };
            }
            return c;
          })
        };
      }
      return q;
    });

    setQuestions(prev => updateCommentLikes(prev));
    setFilteredQuestions(prev => updateCommentLikes(prev));
  };

  const handleDeleteComment = async (questionId, commentId) => {
    console.log('=== HANDLE DELETE COMMENT CALLED ===');
    console.log('Question ID:', questionId);
    console.log('Comment ID:', commentId);
    console.log('Current User:', currentUser);
    
    // Find the comment and question to check permissions
    const question = [...questions, ...filteredQuestions].find(q => q._id === questionId);
    const comment = question?.comments?.find(c => c.id === commentId);
    
    console.log('Found Question:', question);
    console.log('Found Comment:', comment);
    
    if (!comment || !question) {
      console.error('Comment or question not found');
      showSnackbar('Comment or question not found', 'error');
      return;
    }
    
    // Check if user can delete the comment:
    // 1. User is the author of the comment, OR
    // 2. User is the owner of the question
    const isCommentAuthor = comment.author?.id === currentUser.id;
    const isQuestionOwner = question.author?.id === currentUser.id;
    
    console.log('Is Comment Author:', isCommentAuthor);
    console.log('Is Question Owner:', isQuestionOwner);
    console.log('Comment Author ID:', comment.author?.id);
    console.log('Question Author ID:', question.author?.id);
    console.log('Current User ID:', currentUser.id);
    
    if (!isCommentAuthor && !isQuestionOwner) {
      console.error('User not authorized to delete comment');
      showSnackbar('You can only delete your own comments or comments on your own questions', 'error');
      return;
    }
    
    console.log('User authorized, showing confirmation dialog...');
    
    // Show attractive confirmation dialog
    setCommentDeleteConfirm({
      open: true,
      commentId,
      questionId,
      comment
    });
    
    console.log('=== HANDLE DELETE COMMENT COMPLETE ===');
  };

  const confirmDeleteComment = async () => {
    const { commentId, questionId, comment } = commentDeleteConfirm;
    
    console.log('=== CONFIRM DELETE COMMENT DEBUG ===');
    console.log('Comment ID:', commentId);
    console.log('Question ID:', questionId);
    console.log('Comment:', comment);
    console.log('Current User ID:', currentUser.id);
    console.log('====================================');
    
    // Check if this is mock data (string ID) or real data (ObjectId)
    const isMockData = typeof commentId === 'number' || (typeof commentId === 'string' && commentId.length < 24);
    
    // Remove comment from UI immediately for instant feedback
    const updateComments = (questions) => questions.map(q => {
      if (q._id === questionId) {
        return {
          ...q,
          comments: (q.comments || []).filter(c => c.id !== commentId)
        };
      }
      return q;
    });

    setQuestions(prev => updateComments(prev));
    setFilteredQuestions(prev => updateComments(prev));
    
    // Close confirmation dialog
    setCommentDeleteConfirm({ open: false, commentId: null, questionId: null, comment: null });
    
    // Show success notification
    setCommentDeleteNotification({
      open: true,
      message: 'Comment removed successfully! 🗑️',
      itemName: '', // Remove author name
      severity: 'success',
      showProgress: false
    });
    
    if (isMockData) {
      console.log('Handling mock data deletion - no API call needed');
      return;
    }
    
    try {
      console.log('Making API call to delete comment...');
      console.log('URL:', `http://localhost:5000/api/comments/${commentId}`);
      console.log('Data:', { userId: currentUser.id });
      
      const response = await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
        data: { userId: currentUser.id }
      });
      
      console.log('Delete API Response:', response.data);
      
      // Update notification to show permanent deletion
      setTimeout(() => {
        setCommentDeleteNotification(prev => ({
          ...prev,
          message: 'Comment permanently deleted! ',
          showProgress: false
        }));
      }, 1000);
      
    } catch (error) {
      console.error('=== DELETE COMMENT ERROR ===');
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('============================');
      
      // Restore the comment if backend fails
      const restoreComment = (questions) => questions.map(q => {
        if (q._id === questionId) {
          return {
            ...q,
            comments: [...(q.comments || []), comment]
          };
        }
        return q;
      });

      setQuestions(prev => restoreComment(prev));
      setFilteredQuestions(prev => restoreComment(prev));
      
      // Show error notification
      setCommentDeleteNotification({
        open: true,
        message: `Failed to delete comment: ${error.response?.data?.message || error.message || 'Unknown error'}`,
        itemName: '', // Remove author name
        severity: 'error',
        showProgress: false
      });
    }
  };

  const toggleComments = (questionId) => {
    setExpandedComments(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const isQuestionAuthor = (question) => {
  console.log('=== Author Check Debug ===');
  console.log('Question author:', question.author);
  console.log('Question author._id:', question.author?._id);
  console.log('Question author.id:', question.author?.id);
  console.log('Current user:', currentUser);
  console.log('Current user.id:', currentUser.id);
  console.log('==========================');
  
  // Handle different author ID formats (ObjectId vs string)
  const authorId = question.author?._id?.toString() || question.author?.id;
  console.log('Final authorId:', authorId);
  console.log('Is author?', authorId === currentUser.id);
  console.log('==========================');
  
  return authorId === currentUser.id;
};

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      title: question.title,
      description: question.description,
      tags: Array.isArray(question.tags) ? question.tags.join(', ') : (question.tags || ''),
      year: question.year,
      semester: question.semester,
      subject: question.subject,
      module: question.module
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuestion(null);
    setFormData({
      title: '',
      description: '',
      tags: '',
      year: '',
      semester: '',
      subject: '',
      module: ''
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4} textAlign="center">
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #9333ea, #ec4899)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Questions & Answers
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Get help from your academic community
        </Typography>
      </Box>

      {/* Interactive Academic Filters */}
      <Paper
        sx={{
          mb: 4,
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(147, 51, 234, 0.3)',
          p: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 3,
          position: 'relative'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#fff', 
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              animation: 'pulse 2s infinite'
            }}
          >
            <FilterList sx={{ 
              mr: 1,
              color: '#9333ea',
              animation: 'spin 3s linear infinite'
            }} />
            Academic Filters
            <Chip 
              label={`${(filterYear || filterSemester || filterSubject) ? 'Active' : 'All'} Filters`}
              size="small"
              sx={{
                ml: 2,
                background: (filterYear || filterSemester || filterSubject) 
                  ? 'linear-gradient(45deg, #4caf50, #45a049)' 
                  : 'rgba(147, 51, 234, 0.2)',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '11px',
                height: 24
              }}
            />
          </Typography>
          
          {/* Quick Filter Stats */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip 
              icon={<School />}
              label={`${filteredQuestions.length} Results`}
              size="small"
              sx={{
                background: 'rgba(76, 175, 80, 0.2)',
                color: '#4caf50',
                border: '1px solid rgba(76, 175, 80, 0.3)'
              }}
            />
            <Chip 
              icon={<TrendingUp />}
              label={`${Math.round((filteredQuestions.length / questions.length) * 100)}% Match`}
              size="small"
              sx={{
                background: 'rgba(236, 72, 153, 0.2)',
                color: '#ec4899',
                border: '1px solid rgba(236, 72, 153, 0.3)'
              }}
            />
          </Box>
        </Box>

        {/* Enhanced Year Selection */}
        <Box mb={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <School sx={{ 
                mr: 1, 
                verticalAlign: 'middle',
                color: '#9333ea',
                fontSize: 20
              }} />
              Academic Year
              {filterYear && (
                <Chip 
                  label={filterYear}
                  size="small"
                  onDelete={() => setFilterYear('')}
                  sx={{
                    ml: 2,
                    background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                    color: '#fff',
                    '& .MuiChip-deleteIcon': {
                      color: '#fff'
                    }
                  }}
                />
              )}
            </Typography>
          </Box>
          
          <ToggleButtonGroup
            value={filterYear}
            exclusive
            onChange={(e, newValue) => setFilterYear(newValue || '')}
            sx={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              '& .MuiToggleButtonGroup-root': {
                borderRadius: 2
              }
            }}
          >
            {years.map((year, index) => (
              <ToggleButton
                key={year}
                value={year}
                sx={{
                  px: 3,
                  py: 1.5,
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(147, 51, 234, 0.3)',
                  borderRadius: 2,
                  m: 0.5,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: -100,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                    transition: 'left 0.3s ease',
                    zIndex: 0
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                    color: '#fff',
                    borderColor: '#9333ea',
                    '&:before': {
                      left: 0
                    },
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                      transform: 'translateX(0%)',
                      transition: 'transform 0.6s ease',
                      zIndex: 1
                    }
                  },
                  '&:hover': {
                    borderColor: '#9333ea',
                    background: 'rgba(147, 51, 234, 0.1)',
                    '&:before': {
                      left: 0
                    }
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 2 }}>
                  {year}
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Enhanced Semester Selection */}
        <Box mb={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <CalendarToday sx={{ 
                mr: 1, 
                verticalAlign: 'middle',
                color: '#ec4899',
                fontSize: 20
              }} />
              Semester
              {filterSemester && (
                <Chip 
                  label={filterSemester}
                  size="small"
                  onDelete={() => setFilterSemester('')}
                  sx={{
                    ml: 2,
                    background: 'linear-gradient(45deg, #ec4899, #db2777)',
                    color: '#fff',
                    '& .MuiChip-deleteIcon': {
                      color: '#fff'
                    }
                  }}
                />
              )}
            </Typography>
          </Box>
          
          <ToggleButtonGroup
            value={filterSemester}
            exclusive
            onChange={(e, newValue) => setFilterSemester(newValue || '')}
            sx={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              '& .MuiToggleButtonGroup-root': {
                borderRadius: 2
              }
            }}
          >
            {semesters.map((semester, index) => (
              <ToggleButton
                key={semester}
                value={semester}
                sx={{
                  px: 3,
                  py: 1.5,
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(236, 72, 153, 0.3)',
                  borderRadius: 2,
                  m: 0.5,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: -100,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(45deg, #ec4899, #db2777)',
                    transition: 'left 0.3s ease',
                    zIndex: 0
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(45deg, #ec4899, #db2777)',
                    color: '#fff',
                    borderColor: '#ec4899',
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)',
                    '&:before': {
                      left: 0
                    }
                  },
                  '&:hover': {
                    borderColor: '#ec4899',
                    background: 'rgba(236, 72, 153, 0.1)',
                    transform: 'scale(1.02)',
                    '&:before': {
                      left: 0
                    }
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  {semester}
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Interactive Subject Selection */}
        <Box mb={3}>
          <Typography variant="subtitle1" sx={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Book sx={{ color: '#9333ea', fontSize: 20 }} />
            Filter by Subject
            {filterSubject && (
              <Chip 
                label={filterSubject}
                size="small" 
                onDelete={() => setFilterSubject('')}
                sx={{ 
                  ml: 2,
                  background: 'linear-gradient(45deg, #4caf50, #45a049)',
                  color: '#fff',
                  fontSize: '11px',
                  height: '20px'
                }} 
              />
            )}
          </Typography>
          
          {/* Interactive Subject Dropdown */}
              <FormControl fullWidth variant="outlined">
                <Select
                  value={filterSubject}
                  onChange={(e) => {
                    console.log('Filter subject changed to:', e.target.value);
                    setFilterSubject(e.target.value);
                  }}
                  displayEmpty
                  sx={{
                    color: '#fff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: filterSubject ? '#9333ea' : 'rgba(147, 51, 234, 0.3)',
                      borderWidth: '2px',
                      transition: 'border-color 0.3s ease'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9333ea',
                      boxShadow: '0 0 0 1px rgba(147, 51, 234, 0.2)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#9333ea',
                      boxShadow: '0 0 0 2px rgba(147, 51, 234, 0.2)'
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#9333ea',
                      fontSize: '24px'
                    }
                  }}
                  renderValue={(selected) => {
                    if (!selected) {
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>📚</span>
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            All subjects
                          </Typography>
                        </Box>
                      );
                    }
                    
                    const subjectIcons = {
                      'Introduction to Programming': '💻',
                      'Network Design and Management': '🌐',
                      'Database Systems': '🗄️',
                      'Programming Applications and Frameworks': '⚙️'
                    };
                    
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: '16px' }}>
                          {subjectIcons[selected] || '📖'}
                        </span>
                        <Typography sx={{ color: '#fff', fontWeight: 'medium' }}>
                          {selected}
                        </Typography>
                      </Box>
                    );
                  }}
                >
                  <MenuItem value="">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>📚</span>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        All subjects
                      </Typography>
                    </Box>
                  </MenuItem>
                  {subjects.map((subject) => {
                    const subjectIcons = {
                      'Introduction to Programming': '💻',
                      'Network Design and Management': '🌐',
                      'Database Systems': '🗄️',
                      'Programming Applications and Frameworks': '⚙️'
                    };
                    
                    return (
                      <MenuItem 
                        key={subject} 
                        value={subject}
                        sx={{ 
                          py: 1,
                          px: 2,
                          '&:hover': {
                            background: 'rgba(147, 51, 234, 0.1)',
                            transform: 'translateX(4px)',
                            transition: 'all 0.2s ease'
                          },
                          '&.Mui-selected': {
                            background: 'rgba(147, 51, 234, 0.15)',
                            borderLeft: '3px solid #9333ea'
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2,
                          width: '100%'
                        }}>
                          <Box sx={{ 
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            background: 'rgba(147, 51, 234, 0.1)',
                            borderRadius: '6px'
                          }}>
                            {subjectIcons[subject] || '📖'}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ 
                              color: '#fff', 
                              fontWeight: 'medium',
                              fontSize: '14px'
                            }}>
                              {subject}
                            </Typography>
                          </Box>
                          {filterSubject === subject && (
                            <Box sx={{
                              width: '20px',
                              height: '20px',
                              background: 'linear-gradient(45deg, #4caf50, #45a049)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Typography sx={{ color: '#fff', fontSize: '12px' }}>
                                ✓
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
          
          {/* Subject Preview */}
          {filterSubject && (
            <Box sx={{ 
              mt: 2,
              p: 2,
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
              borderRadius: 2,
              border: '1px solid rgba(147, 51, 234, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Box sx={{
                fontSize: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                borderRadius: '12px'
              }}>
                {filterSubject === 'Introduction to Programming' && '💻'}
                {filterSubject === 'Network Design and Management' && '🌐'}
                {filterSubject === 'Database Systems' && '🗄️'}
                {filterSubject === 'Programming Applications and Frameworks' && '⚙️'}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ 
                  color: '#fff', 
                  fontWeight: 'bold',
                  fontSize: '16px',
                  mb: 0.5
                }}>
                  Filtering by {filterSubject}
                </Typography>
                <Typography sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '13px'
                }}>
                  Showing questions related to {filterSubject}. Click the chip above to clear filter.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Enhanced Search Bar */}
        <Box mb={3}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Search sx={{ 
              mr: 1, 
              verticalAlign: 'middle',
              color: '#ff9800',
              fontSize: 20
            }} />
            Search Questions
            {searchTerm && (
              <Chip 
                label={searchTerm}
                size="small"
                onDelete={() => setSearchTerm('')}
                sx={{
                  ml: 2,
                  background: 'linear-gradient(45deg, #ff9800, #f57c00)',
                  color: '#fff',
                  '& .MuiChip-deleteIcon': {
                    color: '#fff'
                  }
                }}
              />
            )}
          </Typography>
        </Box>

        {/* Search and Quick Filters */}
        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="🔍 Search questions, topics, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ 
                      mr: 1, 
                      color: searchTerm ? '#9333ea' : 'rgba(255, 255, 255, 0.5)',
                      transition: 'color 0.3s ease'
                    }} />
                  </InputAdornment>
                ),
                sx: {
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: searchTerm ? '#9333ea' : 'rgba(147, 51, 234, 0.3)',
                    transition: 'border-color 0.3s ease'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#9333ea'
                  }
                }
              }}
              sx={{
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(147, 51, 234, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#9333ea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#9333ea',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#fff',
                }
              }}
            />
          </Grid>
        </Grid>

        {/* Enhanced Clear Filters Section */}
        {(filterYear || filterSemester || filterSubject || searchTerm) && (
          <Box 
            sx={{ 
              mt: 3,
              p: 2,
              background: 'rgba(147, 51, 234, 0.1)',
              borderRadius: 2,
              border: '1px solid rgba(147, 51, 234, 0.3)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <FilterList sx={{ fontSize: 16 }} />
                Active Filters Applied
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setFilterYear('');
                  setFilterSemester('');
                  setFilterSubject('');
                  setSearchTerm('');
                }}
                sx={{
                  borderColor: 'rgba(147, 51, 234, 0.5)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    borderColor: '#9333ea',
                    background: 'rgba(147, 51, 234, 0.1)',
                    color: '#fff'
                  },
                  transition: 'all 0.3s ease'
                }}
                startIcon={<Close />}
              >
                Clear All
              </Button>
            </Box>
            
            {/* Filter Summary */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {filterYear && (
                <Chip 
                  icon={<School />}
                  label={`Year: ${filterYear}`}
                  size="small"
                  sx={{
                    background: 'rgba(147, 51, 234, 0.2)',
                    color: '#9333ea',
                    border: '1px solid rgba(147, 51, 234, 0.3)'
                  }}
                />
              )}
              {filterSemester && (
                <Chip 
                  icon={<CalendarToday />}
                  label={`Semester: ${filterSemester}`}
                  size="small"
                  sx={{
                    background: 'rgba(236, 72, 153, 0.2)',
                    color: '#ec4899',
                    border: '1px solid rgba(236, 72, 153, 0.3)'
                  }}
                />
              )}
              {filterSubject && (
                <Chip 
                  icon={<Book />}
                  label={`Subject: ${filterSubject}`}
                  size="small"
                  sx={{
                    background: 'rgba(76, 175, 80, 0.2)',
                    color: '#4caf50',
                    border: '1px solid rgba(76, 175, 80, 0.3)'
                  }}
                />
              )}
              {searchTerm && (
                <Chip 
                  icon={<Search />}
                  label={`Search: "${searchTerm}"`}
                  size="small"
                  sx={{
                    background: 'rgba(255, 152, 0, 0.2)',
                    color: '#ff9800',
                    border: '1px solid rgba(255, 152, 0, 0.3)'
                  }}
                />
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Questions List - Vertical Layout */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {filteredQuestions.map((question) => (
          <Card 
            key={question._id}
            id={`question-${question._id}`}
            sx={{ 
              '&:hover': { 
                boxShadow: '0 10px 30px rgba(147, 51, 234, 0.3)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }} 
            style={{
              background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={() => {
              console.log('Question clicked:', question._id);
              showSnackbar(`Opening question: ${question.title}`, 'info');
            }}
          >
              <CardContent>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                  <Box flex={1}>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 'bold',
                        color: '#fff'
                      }}
                    >
                      {question.title}
                    </Typography>
                    <Typography variant="body1" color="rgba(255, 255, 255, 0.7)" paragraph>
                      {question.description}
                    </Typography>
                    
                    {/* Beautiful Year and Semester Display */}
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      {question.year && (
                        <Chip
                          icon={<School fontSize="small" />}
                          label={question.year}
                          size="small"
                          sx={{
                            background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                            color: '#fff',
                            border: 'none',
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                      {question.semester && (
                        <Chip
                          icon={<CalendarToday fontSize="small" />}
                          label={question.semester}
                          size="small"
                          sx={{
                            background: 'rgba(236, 72, 153, 0.2)',
                            color: '#ec4899',
                            border: '1px solid rgba(236, 72, 153, 0.3)',
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                      {question.subject && (
                        <Chip
                          icon={<Book fontSize="small" />}
                          label={question.subject}
                          size="small"
                          sx={{
                            background: 'rgba(76, 175, 80, 0.2)',
                            color: '#4caf50',
                            border: '1px solid rgba(76, 175, 80, 0.3)',
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                      {question.module && (
                        <Chip
                          label={question.module}
                          size="small"
                          sx={{
                            background: 'rgba(33, 150, 243, 0.2)',
                            color: '#2196f3',
                            border: '1px solid rgba(33, 150, 243, 0.3)',
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                      {question.aiHighlighted && (
                        <Chip
                          icon={<Lightbulb fontSize="small" />}
                          label="AI Highlighted"
                          size="small"
                          sx={{
                            background: 'linear-gradient(45deg, #ff9800, #ff5722)',
                            color: '#fff',
                            border: 'none',
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                    </Box>

                    {/* Tags */}
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      {question.tags && question.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          icon={<Tag fontSize="small" />}
                          sx={{
                            background: 'rgba(147, 51, 234, 0.1)',
                            color: '#9333ea',
                            border: '1px solid rgba(147, 51, 234, 0.3)'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box ml={2}>
                    <Avatar sx={{ bgcolor: '#1976d2' }}>
                      {question.author?.name?.charAt(0) || 'U'}
                    </Avatar>
                  </Box>
                </Box>
              </CardContent>
              
              <Divider />
              
              <CardActions sx={{ px: 2, py: 1 }}>
                {/* Like Button */}
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(question._id);
                    }}
                    sx={{
                      color: Array.isArray(question.likes) && question.likes.includes(currentUser.id) ? '#9333ea' : 'rgba(255, 255, 255, 0.5)',
                      '&:hover': { color: '#9333ea' }
                    }}
                  >
                    <ThumbUp fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {Array.isArray(question.likes) ? question.likes.length : 0}
                  </Typography>
                </Box>

                {/* Comment Button */}
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleComment(question);
                    }}
                    sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: '#ec4899' } }}
                  >
                    <Comment fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {Array.isArray(question.comments) ? question.comments.length : 0}
                  </Typography>
                </Box>

                {/* Share Button */}
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleShare(event, question);
                    }}
                    sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: '#4caf50' } }}
                  >
                    <Share fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {question.shares || 0}
                  </Typography>
                </Box>

                <Box flexGrow={1} />

                {/* Delete Button - Show for all users but check permissions */}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(question._id);
                  }}
                  sx={{ 
                    color: isQuestionAuthor(question) 
                      ? 'rgba(255, 255, 255, 0.5)' 
                      : 'rgba(255, 255, 255, 0.2)', 
                    '&:hover': { 
                      color: isQuestionAuthor(question) 
                        ? '#f44336' 
                        : 'rgba(255, 255, 255, 0.3)' 
                    },
                    mr: 1,
                    opacity: isQuestionAuthor(question) ? 1 : 0.6
                  }}
                  title={isQuestionAuthor(question) ? "Delete your question" : "Only authors can delete questions"}
                >
                  <Delete fontSize="small" />
                </IconButton>

                {/* Action Buttons - Only show for question author */}
                {isQuestionAuthor(question) && (
                  <Box>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(question);
                      }}
                      sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#fff' } }}
                    >
                      Edit
                    </Button>
                  </Box>
                )}

                {/* Show Comments Toggle */}
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComments(question._id);
                  }}
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
              </CardActions>

              {/* Comments Section - Fixed Height Container */}
              <Box sx={{ 
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Collapse 
                  in={expandedComments[question._id]} 
                  timeout="auto" 
                  unmountOnExit
                  sx={{
                    '& .MuiCollapse-wrapper': {
                      transition: 'all 0.3s ease-in-out'
                    },
                    '& .MuiCollapse-wrapperInner': {
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}
                >
                  <Box sx={{ 
                    px: 3, 
                    py: 2, 
                    borderTop: '1px solid rgba(147, 51, 234, 0.2)',
                    background: 'rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease-in-out'
                  }}>
                  {/* Add Comment Input */}
                  <Box mb={2}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Add a comment..."
                      inputRef={(el) => {
                        if (el) {
                          commentInputRefs.current[question._id] = el;
                        }
                      }}
                      value={selectedQuestion?._id === question._id ? commentText : ''}
                      onChange={(e) => {
                        setSelectedQuestion(question);
                        setCommentText(e.target.value);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitComment();
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedQuestion(question);
                              handleSubmitComment();
                            }}
                            disabled={!commentText.trim()}
                            sx={{ 
                              color: commentText.trim() ? '#9333ea' : 'rgba(255, 255, 255, 0.3)',
                              '&:hover': { color: '#9333ea' }
                            }}
                          >
                            <Send fontSize="small" />
                          </IconButton>
                        ),
                        sx: {
                          color: '#fff',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(147, 51, 234, 0.3)'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(147, 51, 234, 0.5)'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#9333ea'
                          }
                        }
                      }}
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)'
                        },
                        '& .MuiInputBase-input': {
                          color: '#fff'
                        }
                      }}
                    />
                  </Box>

                  {/* Comments List */}
                  {Array.isArray(question.comments) && question.comments.length > 0 ? (
                    <Box>
                      {question.comments.map((comment) => (
                        <CommentItem 
                          key={comment.id}
                          comment={comment}
                          questionId={question._id}
                          questionAuthorId={question.author?.id}
                          currentUser={currentUser}
                          onLikeComment={handleLikeComment}
                          onDeleteComment={handleDeleteComment}
                          formatTimestamp={formatTimestamp}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Box 
                      display="flex" 
                      flexDirection="column" 
                      alignItems="center" 
                      py={4}
                      px={2}
                    >
                      <Comment sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.5)', 
                          textAlign: 'center',
                          fontSize: '14px'
                        }}
                      >
                        No comments yet. Be the first to comment!
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Collapse>
              </Box>
            </Card>
        ))}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, value) => setCurrentPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setOpenDialog(true)}
      >
        <Add />
      </Fab>

      {/* Add/Edit Question Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            color: '#fff',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(147, 51, 234, 0.3)' }}>
          {editingQuestion ? 'Edit Question' : 'Ask a Question'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
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
        
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ 
            color: '#fff',
            maxHeight: 'calc(90vh - 120px)',
            overflowY: 'auto'
          }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Question Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  helperText="Be specific and imagine you're asking a question to another person"
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
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    },
                    '& .MuiInputBase-input': {
                      color: '#fff'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  helperText="Include all the information someone would need to answer your question"
                />
              </Grid>

              {/* Interactive Year Selection */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                  <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Select Year
                </Typography>
                <ToggleButtonGroup
                  value={formData.year}
                  exclusive
                  onChange={(e, newValue) => setFormData({ ...formData, year: newValue || '' })}
                  sx={{ mb: 2 }}
                >
                  {years.map((year) => (
                    <ToggleButton
                      key={year}
                      value={year}
                      required
                      onClick={() => setFormData({ ...formData, year: year })}
                      sx={{
                        px: 3,
                        py: 1,
                        color: 'rgba(255, 255, 255, 0.7)',
                        borderColor: 'rgba(147, 51, 234, 0.3)',
                        '&.Mui-selected': {
                          background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                          color: '#fff',
                          borderColor: '#9333ea'
                        },
                        '&:hover': {
                          borderColor: '#9333ea',
                          background: 'rgba(147, 51, 234, 0.1)'
                        }
                      }}
                    >
                      {year}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Grid>

              {/* Interactive Semester Selection */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                  <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Select Semester
                </Typography>
                <ToggleButtonGroup
                  value={formData.semester}
                  exclusive
                  onChange={(e, newValue) => setFormData({ ...formData, semester: newValue || '' })}
                  sx={{ mb: 2 }}
                >
                  {semesters.map((semester) => (
                    <ToggleButton
                      key={semester}
                      value={semester}
                      required
                      sx={{
                        px: 3,
                        py: 1,
                        color: 'rgba(255, 255, 255, 0.7)',
                        borderColor: 'rgba(236, 72, 153, 0.3)',
                        '&.Mui-selected': {
                          background: 'linear-gradient(45deg, #ec4899, #db2777)',
                          color: '#fff',
                          borderColor: '#ec4899'
                        },
                        '&:hover': {
                          borderColor: '#ec4899',
                          background: 'rgba(236, 72, 153, 0.1)'
                        }
                      }}
                    >
                      {semester}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Grid>

              {/* Interactive Subject Selection */}
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Book sx={{ color: '#9333ea', fontSize: 20 }} />
                    Select Subject
                    {formData.subject && (
                      <Chip 
                        label="Selected"
                        size="small" 
                        sx={{ 
                          ml: 2,
                          background: 'linear-gradient(45deg, #4caf50, #45a049)',
                          color: '#fff',
                          fontSize: '11px',
                          height: '20px'
                        }} 
                      />
                    )}
                  </Typography>
                  
                  {/* Interactive Subject Selection */}
                  <Grid item xs={12}>
                    <Box sx={{ mb: 3 }}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&.Mui-focused': {
                              color: '#9333ea'
                            }
                          }}
                        >
                          Choose your subject
                        </InputLabel>
                        <Select
                          value={formData.subject}
                          onChange={(e) => {
                            const selectedSubject = e.target.value;
                            setFormData({ ...formData, subject: selectedSubject });
                          }}
                          label="Choose your subject"
                          sx={{
                            color: '#fff',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: formData.subject ? '#9333ea' : 'rgba(147, 51, 234, 0.3)',
                              borderWidth: '2px'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#9333ea',
                              boxShadow: '0 0 0 1px rgba(147, 51, 234, 0.2)'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#9333ea',
                              boxShadow: '0 0 0 2px rgba(147, 51, 234, 0.2)'
                            },
                            '& .MuiSvgIcon-root': {
                              color: '#9333ea',
                              fontSize: '24px'
                            },
                            '& .MuiSelect-select': {
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }
                          }}
                          renderValue={(selected) => {
                            const subjectIcons = {
                              'Introduction to Programming': '💻',
                              'Network Design and Management': '🌐',
                              'Database Systems': '🗄️',
                              'Programming Applications and Frameworks': '⚙️'
                            };
                            
                            return (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span style={{ fontSize: '18px' }}>
                                  {subjectIcons[selected] || '📖'}
                                </span>
                                <Typography sx={{ color: '#fff', fontWeight: 'medium' }}>
                                  {selected}
                                </Typography>
                              </Box>
                            );
                          }}
                        >
                          <MenuItem value="" sx={{ 
                            '&:hover': {
                              background: 'rgba(147, 51, 234, 0.1)'
                            }
                          }}>
                            <em style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>📚</span>
                                Select a subject...
                              </Box>
                            </em>
                          </MenuItem>
                          {subjects.map((subject) => {
                            const subjectIcons = {
                              'Introduction to Programming': '💻',
                              'Network Design and Management': '🌐',
                              'Database Systems': '🗄️',
                              'Programming Applications and Frameworks': '⚙️'
                            };
                            
                            return (
                              <MenuItem 
                                key={subject} 
                                value={subject}
                                sx={{ 
                                  py: 1.5,
                                  px: 2,
                                  '&:hover': {
                                    background: 'rgba(147, 51, 234, 0.1)',
                                    transform: 'translateX(4px)',
                                    transition: 'all 0.2s ease'
                                  },
                                  '&.Mui-selected': {
                                    background: 'rgba(147, 51, 234, 0.15)',
                                    borderLeft: '3px solid #9333ea'
                                  }
                                }}
                              >
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 2,
                                  width: '100%'
                                }}>
                                  <Box sx={{ 
                                    fontSize: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    background: 'rgba(147, 51, 234, 0.1)',
                                    borderRadius: '8px'
                                  }}>
                                    {subjectIcons[subject] || '📖'}
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ 
                                      color: '#fff', 
                                      fontWeight: 'medium',
                                      fontSize: '14px'
                                    }}>
                                      {subject}
                                    </Typography>
                                    <Typography sx={{ 
                                      color: 'rgba(255, 255, 255, 0.6)',
                                      fontSize: '12px'
                                    }}>
                                      {subject === 'Introduction to Programming' && 'Programming fundamentals, algorithms, and problem solving'}
                                      {subject === 'Network Design and Management' && 'Network architecture, protocols, and administration'}
                                      {subject === 'Database Systems' && 'Database design, SQL, and data management'}
                                      {subject === 'Programming Applications and Frameworks' && 'Software development, frameworks, and applications'}
                                    </Typography>
                                  </Box>
                                  {formData.subject === subject && (
                                    <Box sx={{
                                      width: '24px',
                                      height: '24px',
                                      background: 'linear-gradient(45deg, #4caf50, #45a049)',
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <Typography sx={{ color: '#fff', fontSize: '14px' }}>
                                        ✓
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                      
                      {/* Interactive Subject Preview */}
                      {formData.subject && (
                        <Box sx={{ 
                          mt: 2,
                          p: 2,
                          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                          borderRadius: 2,
                          border: '1px solid rgba(147, 51, 234, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2
                        }}>
                          <Box sx={{
                            fontSize: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                            borderRadius: '12px'
                          }}>
                            {formData.subject === 'Introduction to Programming' && '💻'}
                            {formData.subject === 'Network Design and Management' && '🌐'}
                            {formData.subject === 'Database Systems' && '🗄️'}
                            {formData.subject === 'Programming Applications and Frameworks' && '⚙️'}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ 
                              color: '#fff', 
                              fontWeight: 'bold',
                              fontSize: '16px',
                              mb: 0.5
                            }}>
                              {formData.subject} Selected
                            </Typography>
                            <Typography sx={{ 
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '13px'
                            }}>
                              Great choice! Your question will be categorized under {formData.subject}.
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                  
                  {/* Quick Selection Helper */}
                  {!formData.subject && (
                    <Box sx={{ 
                      mt: 2,
                      p: 2,
                      background: 'rgba(147, 51, 234, 0.1)',
                      borderRadius: 2,
                      border: '1px dashed rgba(147, 51, 234, 0.3)',
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        <span style={{ fontSize: '16px', marginRight: '8px' }}>👆</span>
                        Click on any subject card to select it for your question
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Module Field */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Module"
                  value={formData.module}
                  onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                  required
                  helperText="Specify the module or topic (e.g., Calculus II, Mechanics, Organic Chemistry)"
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
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    },
                    '& .MuiInputBase-input': {
                      color: '#fff'
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'rgba(255, 255, 255, 0.5)'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  helperText="Add tags to help others find your question (e.g., calculus, physics, exam)"
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
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    },
                    '& .MuiInputBase-input': {
                      color: '#fff'
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'rgba(255, 255, 255, 0.5)'
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ borderTop: '1px solid rgba(147, 51, 234, 0.3)' }}>
            <Button 
              onClick={handleCloseDialog}
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
              type="submit" 
              variant="contained" 
              startIcon={<Send />}
              sx={{
                background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7c3aed, #db2777)'
                }
              }}
            >
              {editingQuestion ? 'Update Question' : 'Post Question'}
            </Button>
          </DialogActions>
        </form>
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
            onClick={(e) => {
              e.stopPropagation();
              handleSubmitComment();
            }}
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
        TransitionComponent={Fade}
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
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
        undo={deletedItems.length > 0 ? undoDelete : null}
        autoHideDuration={deleteNotification.showProgress ? 6000 : 3000}
        showProgress={deleteNotification.showProgress}
      />

      {/* Comment Delete Notification - Attractive Design */}
      <Snackbar 
        open={commentDeleteNotification.open}
        autoHideDuration={4000}
        onClose={() => setCommentDeleteNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiSnackbar-root': {
            bottom: 24,
            right: 24
          }
        }}
      >
        <Alert 
          severity="success" 
          onClose={() => setCommentDeleteNotification(prev => ({ ...prev, open: false }))}
          iconMapping={{
            success: <CheckCircle sx={{ fontSize: 28, color: '#fff' }} />
          }}
          sx={{ 
            background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
            color: '#fff',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(255, 107, 107, 0.4)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            minWidth: '360px',
            maxWidth: '400px',
            animation: 'slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            '@keyframes slideInRight': {
              '0%': { 
                transform: 'translateX(120%) rotate(-5deg)', 
                opacity: 0 
              },
              '100%': { 
                transform: 'translateX(0) rotate(0deg)', 
                opacity: 1 
              }
            },
            '& .MuiAlert-icon': { 
              color: '#fff',
              fontSize: 28,
              animation: 'bounce 1s infinite',
              '@keyframes bounce': {
                '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                '40%': { transform: 'translateY(-10px)' },
                '60%': { transform: 'translateY(-5px)' }
              }
            },
            '& .MuiAlert-message': {
              color: '#fff',
              fontWeight: 600,
              fontSize: '15px'
            },
            '& .MuiAlert-action': {
              color: '#fff',
              '& .MuiSvgIcon-root': {
                fontSize: 22,
                '&:hover': {
                  color: 'rgba(255, 255, 255, 0.9)',
                  transform: 'rotate(90deg) scale(1.2)',
                  transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                }
              }
            }
          }}
        >
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 'bold', 
                fontSize: '15px',
                lineHeight: 1.5,
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              🎯 {commentDeleteNotification.message}
            </Typography>
            {commentDeleteNotification.itemName && (
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  opacity: 0.95,
                  fontSize: '13px',
                  fontStyle: 'italic',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                👤 {commentDeleteNotification.itemName}
              </Typography>
            )}
          </Box>
        </Alert>
      </Snackbar>

      {/* Comment Delete Confirmation Dialog - Interactive & Clean */}
      <Dialog
        open={commentDeleteConfirm.open}
        onClose={() => setCommentDeleteConfirm({ open: false, commentId: null, questionId: null, comment: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            color: '#fff',
            borderRadius: '20px',
            boxShadow: '0 25px 70px rgba(238, 90, 36, 0.4)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
            animation: 'slideIn 0.3s ease-out',
            '@keyframes slideIn': {
              '0%': { 
                transform: 'scale(0.8) translateY(-20px)',
                opacity: 0 
              },
              '100%': { 
                transform: 'scale(1) translateY(0)',
                opacity: 1 
              }
            }
          }
        }}
      >
        {/* Header with Icon */}
        <Box sx={{ 
          textAlign: 'center', 
          py: 3,
          background: 'rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Box sx={{ mb: 2 }}>
            <Delete sx={{ 
              fontSize: 64, 
              color: '#fff',
              animation: 'pulse 2s infinite',
              filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' }
              }
            }} />
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: '24px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              mb: 1
            }}
          >
            Delete Comment?
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.9,
              fontSize: '14px',
              px: 2
            }}
          >
            This action cannot be undone. The comment will be permanently removed.
          </Typography>
        </Box>
        
        <DialogContent sx={{ pt: 3, pb: 2, textAlign: 'center' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            mb: 3
          }}>
            <Box sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              animation: 'rotate 2s linear infinite',
              '@keyframes rotate': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}>
              <Warning sx={{ fontSize: 30, color: '#fff' }} />
            </Box>
          </Box>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              mb: 2,
              fontSize: '18px'
            }}
          >
            Are you absolutely sure?
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.8,
              fontSize: '13px',
              lineHeight: 1.5
            }}
          >
            Clicking "Delete" will permanently remove this comment from the discussion.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          gap: 2,
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.1)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Button
            variant="outlined"
            onClick={() => {
              console.log('=== CANCEL BUTTON CLICKED ===');
              console.log('Closing comment delete confirmation dialog');
              console.log('==============================');
              setCommentDeleteConfirm({ open: false, commentId: null, questionId: null, comment: null });
            }}
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '14px',
              minWidth: '120px',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.3)',
                borderColor: 'rgba(255, 255, 255, 0.8)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Cancel
          </Button>
          
          <Button
            variant="contained"
            onClick={() => {
              console.log('=== DELETE COMMENT BUTTON CLICKED ===');
              console.log('Calling confirmDeleteComment function');
              console.log('====================================');
              confirmDeleteComment();
            }}
            sx={{
              background: 'linear-gradient(45deg, #fff, #f0f0f0)',
              color: '#ee5a24',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '14px',
              minWidth: '120px',
              '&:hover': {
                background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                transform: 'translateY(-2px) scale(1.05)',
                boxShadow: '0 8px 25px rgba(255, 255, 255, 0.4)',
                transition: 'all 0.3s ease'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmNotification
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, itemName: '', questionId: null })}
        itemName={deleteConfirm.itemName}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, itemName: '', questionId: null })}
      />
    </Container>
  );
};

export default Questions;
