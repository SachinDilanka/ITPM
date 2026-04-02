import React, { useState, useEffect } from 'react';
import { DeleteConfirmNotification } from '../components/DeleteNotification';
import { ActionConfirmDialog } from '../components/ActionConfirmDialog';
import BeautifulPollCreator from '../components/BeautifulPollCreator';
import AICorrectionButton from '../components/AICorrectionButton';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Avatar,
  LinearProgress,
  Chip,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControlLabel,
  Switch,
  Collapse,
  InputAdornment,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  CircularProgress,
  FormHelperText,
  Alert,
  Select,
  MenuItem,
  ButtonGroup,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Plus,
  BarChart,
  Clock,
  Search,
  TrendingUp,
  Calendar,
  Zap,
  PieChart,
  Activity,
  ChevronDown,
  ChevronUp,
  Star,
  Flame,
  Trash2,
  Minus,
  HelpCircle,
  Info,
  Check,
  BookOpen,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Atom,
  Beaker,
  Monitor,
  PenTool,
  Server,
  Globe,
  GitBranch,
  HardDrive,
  Network,
  Package,
  Brain,
  Cloud,
  Shield,
  Bot,
  Layers,
  Link,
  Radio,
  MoreHorizontal,
  FileText,
  Edit3,
  Settings,
  CheckSquare,
  CheckCircle,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, Pie, Tooltip as RechartsTooltip, BarChart as RechartsBarChart, Bar, XAxis, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext.jsx';

export const Polls = () => {
  const { user } = useAuth();
  // Current user information (logged-in user)
  const currentUser = { name: user?.fullName || user?.username || 'User', avatar: user?.username?.charAt(0).toUpperCase() || 'U', id: user?._id };
  
  console.log('Current user:', currentUser);
  console.log('Auth user:', user);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState(0);
  const [sortBy, setSortBy] = useState('latest');
  const [expandedPoll, setExpandedPoll] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [animatingVotes, setAnimatingVotes] = useState(new Set());
  const [animatingRipples, setAnimatingRipples] = useState(new Set());
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pollToDelete, setPollToDelete] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [animationDirection, setAnimationDirection] = useState('forward');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const steps = [
    { number: 1, title: 'Basic Info', icon: <Edit3 size={16} /> },
    { number: 2, title: 'Academic Details', icon: <BookOpen size={16} /> },
    { number: 3, title: 'Poll Options', icon: <CheckSquare size={16} /> },
    { number: 4, title: 'Settings', icon: <Settings size={16} /> }
  ];
  
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Computer Science', 
    'Biology', 'English', 'History', 'Geography', 'Economics',
    'Psychology', 'Literature', 'Philosophy', 'Art', 'Music',
    'Sports Science', 'Engineering', 'Medicine', 'Business',
    'Political Science', 'Sociology'
  ];
  
  const nextStep = () => {
    if (currentStep < 4) {
      setAnimationDirection('forward');
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setAnimationDirection('backward');
      setCurrentStep(currentStep - 1);
    }
  };

  // API functions
  const fetchPolls = async (retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      // Only set loading to true for initial fetch or manual refresh
      if (retryCount === 0) {
        setLoading(true);
      }
      
      const response = await fetch('http://localhost:5000/api/polls');
      
      // Add timeout handling
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });
      
      const data = await Promise.race([response.json(), timeoutPromise]);
      
      if (response.ok) {
        // Ensure we have valid data structure
        const pollsData = data && data.polls ? data.polls : [];
        console.log('Raw polls data:', pollsData);
        
        // Process polls to ensure they have the correct structure
        const processedPolls = pollsData.map(poll => {
          const totalVotes = poll.options ? poll.options.reduce((sum, option) => {
            const voteCount = Array.isArray(option.votes) ? option.votes.length : (option.votes || 0);
            return sum + voteCount;
          }, 0) : 0;
          
          // Check if current user has voted in this poll
          const userId = currentUser.id; // Use consistent user ID
          const userVotes = [];
          let hasVoted = false;
          
          if (poll.options) {
            poll.options.forEach((option, index) => {
              if (Array.isArray(option.votes) && option.votes.includes(userId)) {
                userVotes.push(index);
                hasVoted = true;
              }
            });
          }
          
          return {
            ...poll,
            isActive: poll.isActive !== undefined ? poll.isActive : true, // Default to active if not specified
            isMultipleChoice: poll.isMultipleChoice !== undefined ? poll.isMultipleChoice : false, // Default to single choice
            options: (poll.options || []).map((option, index) => ({
              ...option,
              votes: Array.isArray(option.votes) ? option.votes.length : (option.votes || 0),
              percentage: totalVotes > 0 ? Math.round((Array.isArray(option.votes) ? option.votes.length : (option.votes || 0)) / totalVotes * 100) : 0,
              selected: userVotes.includes(index), // Mark the actual options the user voted for
              // Store original votes array for backend updates
              originalVotes: Array.isArray(option.votes) ? option.votes : []
            })),
            totalVotes: totalVotes,
            hasVoted: hasVoted,
            userVotes: userVotes
          };
        });
        
        console.log('Processed polls with isActive status:', processedPolls.map(p => ({ id: p._id, isActive: p.isActive, title: p.title })));
        
        setPolls(processedPolls);
        console.log('Successfully fetched and processed', processedPolls.length, 'polls');
      } else {
        console.error('Failed to fetch polls:', response.status, response.statusText);
        
        // Set empty polls array on persistent failure
        setPolls([]);
      }
    } catch (error) {
      console.error('Backend not available, using offline mode:', error);
      
      // Add some mock poll data for demonstration
      const mockPolls = [
        {
          _id: 'mock-1',
          title: 'What is your favorite programming language?',
          description: 'Choose your preferred programming language for web development',
          subject: 'Introduction to Programming',
          year: 1,
          semester: 1,
          isMultipleChoice: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          options: [
            { text: 'JavaScript', votes: 5, percentage: 50, selected: false, originalVotes: [] },
            { text: 'Python', votes: 3, percentage: 30, selected: false, originalVotes: [] },
            { text: 'Java', votes: 2, percentage: 20, selected: false, originalVotes: [] }
          ],
          totalVotes: 10,
          hasVoted: false,
          userVotes: [],
          author: { name: 'Demo User', avatar: 'D' }
        },
        {
          _id: 'mock-2',
          title: 'Which database do you prefer?',
          description: 'Select your preferred database system',
          subject: 'Database Systems',
          year: 2,
          semester: 1,
          isMultipleChoice: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          options: [
            { text: 'MySQL', votes: 4, percentage: 40, selected: false, originalVotes: [] },
            { text: 'PostgreSQL', votes: 3, percentage: 30, selected: false, originalVotes: [] },
            { text: 'MongoDB', votes: 3, percentage: 30, selected: false, originalVotes: [] }
          ],
          totalVotes: 10,
          hasVoted: false,
          userVotes: [],
          author: { name: 'Demo User', avatar: 'D' }
        }
      ];
      
      setPolls(mockPolls);
      // You could also show a toast notification here
    } finally {
      // Only set loading to false for the final attempt
      if (retryCount === 0) {
        setLoading(false);
      }
    }
  };

  const createPoll = async (pollData) => {
    try {
      // Try backend first
      const response = await fetch('http://localhost:5000/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pollData),
      });
      
      if (response.ok) {
        const newPoll = await response.json();
        // Process the new poll to match our expected structure
        const processedPoll = {
          ...newPoll,
          options: (newPoll.options || []).map(option => ({
            ...option,
            votes: Array.isArray(option.votes) ? option.votes.length : (option.votes || 0),
            percentage: 0,
            selected: false,
            originalVotes: Array.isArray(option.votes) ? option.votes : []
          })),
          totalVotes: 0,
          hasVoted: false,
          userVotes: []
        };
        setPolls(prev => [processedPoll, ...prev]);
        return true;
      } else {
        // Fallback to offline mode if backend fails
        console.log('Backend not available, creating poll offline');
        const offlinePoll = {
          ...pollData,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          options: pollData.options.map(option => ({
            text: option,
            votes: [],
            percentage: 0,
            selected: false,
            originalVotes: []
          })),
          totalVotes: 0,
          hasVoted: false,
          userVotes: [],
          author: currentUser
        };
        setPolls(prev => [offlinePoll, ...prev]);
        return true;
      }
    } catch (error) {
      console.error('Backend not available, creating poll offline:', error);
      // Fallback to offline mode
      const offlinePoll = {
        ...pollData,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        options: pollData.options.map(option => ({
          text: option,
          votes: [],
          percentage: 0,
          selected: false,
          originalVotes: []
        })),
        totalVotes: 0,
        hasVoted: false,
        userVotes: [],
        author: currentUser
      };
      setPolls(prev => [offlinePoll, ...prev]);
      return true;
    }
  };

  const deletePollApi = async (pollId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/polls/${pollId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id // Use consistent user ID
        }),
      });
      
      if (response.ok) {
        // Remove from local state immediately for better UX
        setPolls(prev => prev.filter(poll => poll._id !== pollId));
        return true;
      } else {
        const errorData = await response.json();
        console.error('Delete poll failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Error deleting poll:', error);
      return false;
    }
  };

  const endPollApi = async (pollId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/polls/${pollId}/end`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id // Use consistent user ID
        }),
      });
      
      if (response.ok) {
        const updatedPoll = await response.json();
        // Update poll in local state
        setPolls(prevPolls => 
          prevPolls.map(poll => {
            if (poll._id === pollId) {
              return {
                ...updatedPoll,
                isActive: false, // Set by backend
                isEnded: true,  // Set by backend
                options: (updatedPoll.options || []).map((option, index) => ({
                  ...option,
                  votes: Array.isArray(option.votes) ? option.votes.length : (option.votes || 0),
                  percentage: updatedPoll.totalVotes > 0 ? Math.round((Array.isArray(option.votes) ? option.votes.length : (option.votes || 0)) / updatedPoll.totalVotes * 100) : 0,
                  selected: poll.userVotes && poll.userVotes.includes(index),
                  originalVotes: Array.isArray(option.votes) ? option.votes : []
                })),
                totalVotes: updatedPoll.totalVotes,
                hasVoted: poll.hasVoted,
                userVotes: poll.userVotes
              };
            }
            return poll;
          })
        );
        return true;
      } else {
        const errorData = await response.json();
        console.error('End poll failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Error ending poll:', error);
      return false;
    }
  };

  // Fetch polls on component mount
  useEffect(() => {
    const fetchInitialPolls = async () => {
      try {
        await fetchPolls();
      } catch (error) {
        console.error('Initial fetch failed:', error);
        // Ensure loading is set to false even if fetch fails
        setLoading(false);
      }
    };

    fetchInitialPolls();
    
    // Also set up an interval to refresh polls every 30 seconds
    const interval = setInterval(async () => {
      try {
        // Use retryCount = 1 to avoid setting loading state during interval refreshes
        await fetchPolls(1);
      } catch (error) {
        console.error('Interval refresh failed:', error);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    year: '',
    semester: '',
    subject: '',
    isMultipleChoice: false,
    options: ['', '', '', '']
  });

  // Debug newPoll state changes
  useEffect(() => {
    console.log('newPoll state changed:', newPoll);
  }, [newPoll]);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const voteInPoll = async (pollId, optionIndex) => {
    try {
      const response = await fetch(`http://localhost:5000/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id, // Use consistent user ID
          optionIndex: optionIndex
        }),
      });
      
      if (response.ok) {
        const updatedPoll = await response.json();
        // Update the poll in local state with the backend response
        setPolls(prevPolls => 
          prevPolls.map(poll => {
            if (poll._id === pollId) {
              const totalVotes = updatedPoll.totalVotes || 0;
              return {
                ...updatedPoll,
                options: (updatedPoll.options || []).map((option, index) => ({
                  ...option,
                  selected: index === optionIndex, // Mark the voted option as selected
                  percentage: totalVotes > 0 ? Math.round((Array.isArray(option.votes) ? option.votes.length : (option.votes || 0)) / totalVotes * 100) : 0,
                  votes: Array.isArray(option.votes) ? option.votes.length : (option.votes || 0),
                  originalVotes: Array.isArray(option.votes) ? option.votes : []
                })),
                hasVoted: true,
                userVotes: [optionIndex],
                totalVotes: totalVotes
              };
            }
            return poll;
          })
        );
        // Force update to ensure pie chart re-renders
        setForceUpdate(prev => prev + 1);
        return true;
      } else {
        const errorData = await response.json();
        console.error('Vote failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Error voting:', error);
      return false;
    }
  };

  const handleVote = (pollId, optionIndex) => {
    console.log('handleVote called with:', { pollId, optionIndex });
    
    // Check if user is authenticated
    if (!currentUser || !currentUser.id) {
      console.error('User not authenticated or missing ID:', currentUser);
      return;
    }
    
    // Prevent voting if poll is not active
    const poll = polls.find(p => p._id === pollId);
    console.log('Found poll:', poll);
    
    if (!poll) {
      console.error('Poll not found:', pollId);
      return;
    }
    
    if (!poll.isActive) {
      console.warn('Poll is not active:', pollId);
      return;
    }

    // For single choice polls, prevent voting if already voted
    if (!poll.isMultipleChoice && poll.hasVoted) {
      // Allow changing selection for single choice polls
      // But prevent multiple selections
      const currentSelection = poll.userVotes && poll.userVotes[0];
      if (currentSelection !== undefined && currentSelection !== optionIndex) {
        // User is trying to select a different option after already voting
        // This should not be allowed, but we'll allow it for now with a warning
        console.warn('User already voted but is trying to change selection');
      }
    }

    // Add animation for vote
    setAnimatingVotes(prev => new Set(prev).add(`${pollId}-${optionIndex}`));
    
    // Create ripple effect
    const rippleId = `ripple-${pollId}-${optionIndex}-${Date.now()}`;
    setAnimatingRipples(prev => new Set(prev).add(rippleId));
    
    setTimeout(() => {
      setAnimatingVotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${pollId}-${optionIndex}`);
        return newSet;
      });
    }, 600);
    
    setTimeout(() => {
      setAnimatingRipples(prev => {
        const newSet = new Set(prev);
        newSet.delete(rippleId);
        return newSet;
      });
    }, 1000);

    // Update local state immediately for instant UI feedback
    setPolls(prevPolls => 
      prevPolls.map(poll => {
        if (poll._id === pollId) {
          let updatedOptions;
          let updatedUserVotes = [...(poll.userVotes || [])];
          let totalVotes = poll.totalVotes || 0;

          if (poll.isMultipleChoice) {
            // Multiple choice: toggle selection
            updatedOptions = (poll.options || []).map((option, index) => {
              if (index === optionIndex) {
                const wasSelected = option.selected;
                const isSelected = !wasSelected;
                const currentVotes = Array.isArray(option.originalVotes) ? option.originalVotes.length : (option.votes || 0);
                
                return {
                  ...option,
                  selected: isSelected,
                  votes: isSelected ? currentVotes + 1 : Math.max(0, currentVotes - 1),
                  // Update originalVotes to reflect the change
                  originalVotes: isSelected ? 
                    [...(option.originalVotes || []), currentUser.id] : 
                    (option.originalVotes || []).filter(v => v !== currentUser.id)
                };
              }
              return option;
            });

            // Update user votes
            if (updatedOptions[optionIndex].selected) {
              if (!updatedUserVotes.includes(optionIndex)) {
                updatedUserVotes.push(optionIndex);
                totalVotes += 1;
              }
            } else {
              updatedUserVotes = updatedUserVotes.filter(vote => vote !== optionIndex);
              totalVotes = Math.max(0, totalVotes - 1);
            }
          } else {
            // Single choice: select one option (clear previous selection)
            const previousSelection = poll.userVotes && poll.userVotes[0];
            
            updatedOptions = (poll.options || []).map((option, index) => {
              const isSelected = index === optionIndex;
              const wasSelected = index === previousSelection;
              const currentVotes = Array.isArray(option.originalVotes) ? option.originalVotes.length : (option.votes || 0);
              
              // If this was previously selected, remove the vote
              if (wasSelected && !isSelected) {
                return {
                  ...option,
                  selected: false,
                  votes: Math.max(0, currentVotes - 1),
                  originalVotes: (option.originalVotes || []).filter(v => v !== currentUser.id)
                };
              }
              // If this is now selected, add the vote
              if (isSelected && !wasSelected) {
                return {
                  ...option,
                  selected: true,
                  votes: currentVotes + 1,
                  originalVotes: [...(option.originalVotes || []), currentUser.id]
                };
              }
              // No change
              return {
                ...option,
                selected: isSelected,
                votes: currentVotes,
                originalVotes: option.originalVotes || []
              };
            });
            
            // Update user votes for single choice (only one selection allowed)
            updatedUserVotes = [optionIndex];
            // Recalculate total votes based on updated options
            totalVotes = updatedOptions.reduce((sum, opt) => sum + (opt.votes || 0), 0);
          }

          // Recalculate percentages
          updatedOptions = updatedOptions.map(option => ({
            ...option,
            percentage: totalVotes > 0 ? Math.round((option.votes || 0) / totalVotes * 100) : 0,
            originalVotes: option.originalVotes || []
          }));

          return {
            ...poll,
            options: updatedOptions,
            totalVotes: totalVotes,
            hasVoted: updatedUserVotes.length > 0,
            userVotes: updatedUserVotes
          };
        }
        
        return poll;
      })
    );

    // Force update to ensure pie chart re-renders immediately
    setForceUpdate(prev => prev + 1);

    // Try to vote via backend (this won't block UI update)
    voteInPoll(pollId, optionIndex).catch(() => {
      console.log('Backend vote failed, but local state was updated');
    });
  };

  const handleCreatePoll = async (pollDataFromCreator) => {
    setIsSubmitting(true);
    
    try {
      const validOptions = pollDataFromCreator.options.filter(option => option.trim() !== '');
      
      const pollData = {
        title: pollDataFromCreator.title.trim(),
        description: pollDataFromCreator.description.trim(),
        options: validOptions,
        subject: pollDataFromCreator.subject.trim(),
        year: parseInt(pollDataFromCreator.year) || 1,
        semester: parseInt(pollDataFromCreator.semester) || 1,
        isMultipleChoice: pollDataFromCreator.isMultipleChoice || false,
        author: currentUser.id // Use consistent user ID
      };

      const success = await createPoll(pollData);
      
      if (success) {
        resetForm();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      setFormErrors({ submit: 'Failed to create poll. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewPollChange = (field, value) => {
    // Convert year and semester to numbers if they're not empty, otherwise keep as empty string
    const processedValue = (field === 'year' || field === 'semester') && value !== '' 
      ? parseInt(value, 10) 
      : value;
    
    setNewPoll(prev => ({
      ...prev,
      [field]: processedValue
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!newPoll.title.trim()) {
      errors.title = 'Poll title is required';
    } else if (newPoll.title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters';
    }
    
    if (!newPoll.description.trim()) {
      errors.description = 'Description is required';
    } else if (newPoll.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    if (!newPoll.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!newPoll.year || newPoll.year < 1 || newPoll.year > 4) {
      errors.year = 'Year must be between 1 and 4';
    }
    
    if (!newPoll.semester || newPoll.semester < 1 || newPoll.semester > 2) {
      errors.semester = 'Semester must be between 1 and 2';
    }
    
    const validOptions = newPoll.options.filter(option => option.trim() !== '');
    if (validOptions.length < 4) {
      errors.options = 'At least 4 valid options are required';
    } else if (validOptions.length > 10) {
      errors.options = 'Maximum 10 options allowed';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addPollOption = () => {
    if (newPoll.options.length < 10) {
      setNewPoll(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removePollOption = (index) => {
    if (newPoll.options.length > 4) {
      setNewPoll(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const resetForm = () => {
    setNewPoll({
      title: '',
      description: '',
      subject: '',
      year: '',
      semester: '',
      isMultipleChoice: false,
      options: ['', '', '', '']
    });
    setFormErrors({});
    setCurrentStep(1);
    setAnimationDirection('forward');
  };

  // Debug expandedPoll changes
  React.useEffect(() => {
    console.log('expandedPoll changed to:', expandedPoll);
  }, [expandedPoll]);

  // Filter and sort polls
  const filteredPolls = React.useMemo(() => {
    let filtered = polls;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(poll => 
        (poll.title && poll.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (poll.description && poll.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (poll.subject && poll.subject.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Tab filter
    if (filterTab === 1) { // Active only
      filtered = filtered.filter(poll => {
        const isActive = poll.isActive === true || poll.isActive === 'true';
        return isActive;
      });
      console.log('Active polls after filter:', filtered.length);
    }
    // For "All" tab (filterTab === 0), show both active and ended polls
    
    // Sort
    if (sortBy === 'latest') {
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'popular') {
      filtered = [...filtered].sort((a, b) => b.totalVotes - a.totalVotes);
    } else if (sortBy === 'ending') {
      filtered = [...filtered].sort((a, b) => {
        // Simple sort by creation date as placeholder (in real app, use actual endsAt)
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
    }
    
    console.log('Final filtered polls count:', filtered.length, 'for tab:', filterTab);
    return filtered;
  }, [polls, searchTerm, filterTab, sortBy]);

  // Separate active and ended polls
  const activePolls = React.useMemo(() => {
    return polls.filter(poll => poll.isActive === true || poll.isActive === 'true')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [polls]);

  const endedPolls = React.useMemo(() => {
    return polls.filter(poll => poll.isActive === false || poll.isActive === 'false')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [polls]);

  const handleOptionChange = (index, value) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const togglePollExpansion = (pollId) => {
    console.log('togglePollExpansion called with pollId:', pollId, 'current expandedPoll:', expandedPoll);
    const newExpandedPoll = expandedPoll === pollId ? null : pollId;
    console.log('Setting expandedPoll to:', newExpandedPoll);
    setExpandedPoll(newExpandedPoll);
  };

  const deletePoll = (poll) => {
    setPollToDelete({ ...poll, action: 'delete' });
    setDeleteConfirmOpen(true);
  };

  const deactivatePoll = (poll) => {
    setPollToDelete({ ...poll, action: 'deactivate' });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (pollToDelete) {
      let success;
      if (pollToDelete.action === 'delete') {
        success = await deletePollApi(pollToDelete._id);
      } else if (pollToDelete.action === 'deactivate') {
        success = await endPollApi(pollToDelete._id);
      }
      
      if (success) {
        setDeleteConfirmOpen(false);
        setPollToDelete(null);
      } else {
        const action = pollToDelete.action === 'delete' ? 'delete' : 'end';
        alert(`Failed to ${action} poll. You can only ${action} your own polls.`);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setPollToDelete(null);
  };

  const COLORS = ['#9333ea', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box mb={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 0 }}>
              Academic Polls
            </Typography>
            <Badge badgeContent={filteredPolls.length} color="primary">
              <Activity size={32} color="#9333ea" />
            </Badge>
            <Chip 
              label={`Filter: ${filterTab}`} 
              size="small" 
              color="secondary" 
              sx={{ ml: 2 }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            Participate in polls and help improve the learning experience
          </Typography>
        </Box>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search polls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Tabs
                  value={filterTab}
                  onChange={(_, newValue) => {
                    console.log('Tab changed to:', newValue);
                    console.log('Previous tab:', filterTab);
                    setFilterTab(newValue);
                    console.log('Filter tab set to:', newValue);
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTab-root': {
                      minWidth: 'auto',
                      px: 2,
                      textTransform: 'none',
                    },
                    '& .Mui-selected': {
                      color: '#9333ea !important',
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#9333ea',
                      height: 3,
                    },
                  }}
                >
                  <Tab label="All" icon={<FileText size={18} />} iconPosition="start" />
                  <Tab label="Active" icon={<Clock size={18} />} iconPosition="start" />
                </Tabs>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Create Poll Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Box mb={4} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Plus />}
            onClick={handleOpenDialog}
            sx={{ 
              mb: 0,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #9333ea, #ec4899)',
              '&:hover': {
                background: 'linear-gradient(45deg, #7c3aed, #db2777)',
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
              transition: 'all 0.3s ease',
            }}
          >
            Create New Poll
          </Button>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip
              icon={<Flame size={16} />}
              label={`${filteredPolls.filter(p => p.totalVotes > 20).length} Trending`}
              color="warning"
              variant="outlined"
            />
            <Chip
              icon={<Zap size={16} />}
              label={`${filteredPolls.filter(p => p.isActive).length} Active`}
              color="success"
              variant="outlined"
            />
          </Box>
        </Box>
      </motion.div>

      {/* Polls Grid */}
      <AnimatePresence>
        {loading && polls.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ width: '100%' }}
          >
            <Paper sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)' }}>
              <CircularProgress size={48} sx={{ mb: 2, color: '#9333ea' }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Loading polls...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Please wait while we fetch the latest polls
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => {
                  setLoading(false);
                  setPolls([]);
                }}
                sx={{ mt: 2 }}
              >
                Cancel Loading
              </Button>
            </Paper>
          </motion.div>
        ) : filteredPolls.length === 0 && polls.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%' }}
          >
            <Paper sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No polls found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your search or filters, or create a new poll to get started
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Plus size={16} />}
                onClick={handleOpenDialog}
                sx={{ 
                  background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #7c3aed, #db2777)',
                  }
                }}
              >
                Create First Poll
              </Button>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => {
                  setLoading(true);
                  fetchPolls();
                }}
                sx={{ ml: 2 }}
              >
                Refresh
              </Button>
            </Paper>
          </motion.div>
        ) : (
          <> 
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Box mb={4}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 'bold', 
                  color: '#6b7280',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <CheckCircle size={24} />
                  Polls ({filteredPolls.length})
                </Typography>
                <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                  {filteredPolls.map((poll, index) => (
              <Grid item xs={12} md={6} lg={4} key={poll._id} sx={{ position: 'relative' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  style={{ position: 'relative', zIndex: 2 }}
                >
                  <Card sx={{ 
                    height: '100%', 
                    minHeight: '600px',
                    display: 'flex', 
                    flexDirection: 'column',
                    background: 'linear-gradient(145deg, #1a1a2e 0%, #0f0f1e 50%, #16213e 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease-in-out',
                    zIndex: 2,
                    '&:hover': { 
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
                      transform: 'translateY(-2px)',
                      borderColor: 'rgba(147, 51, 234, 0.5)',
                    },
                  }}>
                    {poll.totalVotes > 20 && (
                      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
                        <Chip
                          icon={<Flame size={14} />}
                          label="Trending"
                          size="small"
                          sx={{ 
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                            color: 'white',
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            border: '1px solid rgba(255, 107, 53, 0.3)',
                            '& .MuiChip-icon': {
                              color: 'white',
                            },
                            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)',
                          }}
                        />
                      </Box>
                    )}
                    <CardContent sx={{ 
                      flexGrow: 1, 
                      p: 3, 
                      position: 'relative',
                      zIndex: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                        <Avatar sx={{ 
                            backgroundColor: '#9333ea',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            width: 40,
                            height: 40,
                          }}>
                            CU
                          </Avatar>
                        </motion.div>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="h6" component="h2" sx={{ 
                            fontWeight: 600, 
                            color: '#ffffff',
                            fontSize: '1.125rem',
                            lineHeight: 1.3,
                            mb: 1,
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                          }}>
                            {poll.title}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#b8bcc8', 
                            fontSize: '0.875rem',
                            lineHeight: 1.5,
                            mb: 2,
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}>
                            {poll.description}
                          </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip
                            icon={poll.isActive ? <Clock size={14} /> : <CheckCircle size={14} />}
                            label={poll.isActive ? 'Active' : 'Ended'}
                            size="small"
                            sx={{ 
                              fontWeight: 500,
                              background: poll.isActive 
                                ? 'linear-gradient(135deg, #10b981, #059669)'
                                : 'linear-gradient(135deg, #6b7280, #4b5563)',
                              color: 'white',
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              height: 28,
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                              MozUserSelect: 'none',
                              msUserSelect: 'none',
                              WebkitTouchCallout: 'none',
                              '& .MuiChip-icon': {
                                color: 'white',
                                fontSize: '14px',
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                MozUserSelect: 'none',
                                msUserSelect: 'none',
                                WebkitTouchCallout: 'none',
                              },
                              '& .MuiChip-label': {
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                MozUserSelect: 'none',
                                msUserSelect: 'none',
                                WebkitTouchCallout: 'none',
                              },
                            }}
                          />
                          <Chip
                            icon={<Users size={14} />}
                            label={`${poll.totalVotes || 0} votes`}
                            size="small"
                            sx={{ 
                              fontWeight: 500,
                              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                              color: 'white',
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              height: 28,
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              '& .MuiChip-icon': {
                                color: 'white',
                                fontSize: '14px',
                              },
                            }}
                          />
                          <Chip
                            icon={<Star size={14} />}
                            label={poll.subject}
                            size="small"
                            sx={{ 
                              fontWeight: 500,
                              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                              color: 'white',
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              height: 28,
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              '& .MuiChip-icon': {
                                color: 'white',
                                fontSize: '14px',
                              },
                            }}
                          />
                        </Box>
                        </Box>
                      </Box>

                      {/* Poll Options */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {(poll.options || []).map((option, index) => {
                          const isAnimating = animatingVotes.has(`${poll._id}-${index}`);
                          const isRippling = Array.from(animatingRipples).some(id => id.includes(`${poll._id}-${index}`));
                          
                          return (
                            <motion.div
                              key={index}
                              initial={false}
                              {...(poll.isActive && {
                                whileHover: { scale: 1.02 },
                                whileTap: { scale: 0.98 }
                              })}
                              animate={{
                                scale: isAnimating ? [1, 1.05, 1] : 1,
                                backgroundColor: isAnimating ? 'rgba(147, 51, 234, 0.1)' : 'transparent',
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  p: 2.5,
                                  borderRadius: 2,
                                  backgroundColor: option.selected ? 'rgba(147, 51, 234, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                                  cursor: poll.isActive ? 'pointer' : 'default',
                                  border: option.selected ? '2px solid transparent' : '1px solid rgba(255, 255, 255, 0.1)',
                                  backgroundImage: option.selected 
                                    ? 'linear-gradient(145deg, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.05))'
                                    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.05))',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                                  ...(poll.isActive && {
                                    '&:hover': { 
                                      backgroundColor: option.selected ? 'rgba(147, 51, 234, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                                      transform: 'translateY(-2px) scale(1.02)',
                                      border: option.selected ? '2px solid rgba(147, 51, 234, 0.6)' : '1px solid rgba(147, 51, 234, 0.3)',
                                      boxShadow: option.selected ? 
                                        '0 8px 32px rgba(147, 51, 234, 0.4), 0 0 0 1px rgba(147, 51, 234, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)' : 
                                        '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(147, 51, 234, 0.1)',
                                    },
                                  }),
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: option.selected ? 
                                      'linear-gradient(90deg, #9333ea, #ec4899, #3b82f6)' : 
                                      'linear-gradient(90deg, transparent, transparent)',
                                    transition: 'all 0.4s ease',
                                    opacity: option.selected ? 1 : 0,
                                  },
                                  '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: option.selected ? '100px' : '0',
                                    height: '100px',
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)',
                                    transform: 'translate(-50%, -50%)',
                                    transition: 'all 0.6s ease',
                                    pointerEvents: 'none',
                                  },
                                }}
                                onClick={(e) => {
                                  if (!poll.isActive) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    return;
                                  }
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Voting option clicked:', poll._id, index, 'Option:', option.text);
                              handleVote(poll._id, index);
                            }}
                            onMouseDown={(e) => {
                              if (!poll.isActive) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                              }
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <motion.div
                                    {...(poll.isActive && {
                                      whileHover: { scale: 1.15, rotate: 8 },
                                      whileTap: { scale: 0.9 }
                                    })}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                  >
                                    {poll.isMultipleChoice ? (
                                      <Box
                                        sx={{
                                          width: 24,
                                          height: 24,
                                          border: '2.5px solid',
                                          borderColor: option.selected ? 'primary.main' : 'rgba(255, 255, 255, 0.4)',
                                          borderRadius: 1.5,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          backgroundColor: option.selected ? 'primary.main' : 'rgba(255, 255, 255, 0.05)',
                                          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                                          boxShadow: option.selected ? 
                                            '0 4px 12px rgba(147, 51, 234, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)' : 
                                            '0 2px 6px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                                        }}
                                      >
                                        {option.selected && (
                                          <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ 
                                              type: "spring", 
                                              stiffness: 500,
                                              damping: 15,
                                              duration: 0.4 
                                            }}
                                          >
                                            <Check size={12} color="white" />
                                          </motion.div>
                                        )}
                                      </Box>
                                    ) : (
                                      <Box
                                        sx={{
                                          width: 24,
                                          height: 24,
                                          border: '2.5px solid',
                                          borderColor: option.selected ? 'primary.main' : 'rgba(255, 255, 255, 0.4)',
                                          borderRadius: '50%',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          backgroundColor: option.selected ? 'primary.main' : 'rgba(255, 255, 255, 0.05)',
                                          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                                          boxShadow: option.selected ? 
                                            '0 4px 12px rgba(147, 51, 234, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)' : 
                                            '0 2px 6px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                                        }}
                                      >
                                        {option.selected && (
                                          <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ 
                                              type: "spring", 
                                              stiffness: 500,
                                              damping: 15,
                                              duration: 0.4 
                                            }}
                                          >
                                            <Box
                                              sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: '50%',
                                                backgroundColor: 'white',
                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                              }}
                                            />
                                          </motion.div>
                                        )}
                                      </Box>
                                    )}
                                  </motion.div>
                                  <Box sx={{ flexGrow: 1, ml: 1 }}>
                                    <Typography 
                                    variant="body1" 
                                    sx={{ 
                                      fontWeight: option.selected ? 600 : 500,
                                      color: option.selected ? 'primary.main' : 'rgba(255, 255, 255, 0.9)',
                                      fontSize: '0.95rem',
                                      lineHeight: 1.6,
                                      transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                                      textShadow: option.selected ? '0 2px 4px rgba(147, 51, 234, 0.3)' : '0 1px 2px rgba(0, 0, 0, 0.3)',
                                    }}
                                  >
                                    {option.text}
                                  </Typography>
                                  </Box>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flex: 1 }}>
                                  <motion.div
                                    {...(poll.isActive && {
                                      whileHover: { scale: 1.05, y: -1 },
                                      whileTap: { scale: 0.95 }
                                    })}
                                    transition={{ type: "spring", stiffness: 300 }}
                                  >
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.6,
                                        px: 1.2,
                                        py: 0.8,
                                        borderRadius: 2,
                                        background: option.selected 
                                          ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(236, 72, 153, 0.2))'
                                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.2))',
                                        border: '1.5px solid',
                                        borderColor: option.selected ? 'rgba(147, 51, 234, 0.6)' : 'rgba(255, 255, 255, 0.3)',
                                        backdropFilter: 'blur(12px)',
                                        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                                        boxShadow: option.selected ? 
                                          '0 6px 20px rgba(147, 51, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 20px rgba(147, 51, 234, 0.1)' : 
                                          '0 3px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                                      }}
                                    >
                                      <Users 
                                        size={18} 
                                        sx={{ 
                                          color: option.selected ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
                                          filter: option.selected ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' : 'none',
                                          transition: 'all 0.3s ease'
                                        }} 
                                      />
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          fontWeight: 700,
                                          fontSize: '0.85rem',
                                          color: option.selected ? '#ffffff' : 'rgba(255, 255, 255, 0.95)',
                                          textShadow: option.selected ? '0 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
                                          transition: 'all 0.3s ease'
                                        }}
                                      >
                                        {option.votes}
                                      </Typography>
                                    </Box>
                                  </motion.div>
                                </Box>
                                
                                {option.percentage > 0 && (
                                  <motion.div
                                    initial={{ scale: 0, opacity: 0, rotate: -180 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                    transition={{ 
                                      type: "spring", 
                                      stiffness: 500,
                                      damping: 18,
                                      delay: 0.1 
                                    }}
                                    {...(poll.isActive && {
                                      whileHover: { scale: 1.05 }
                                    })}
                                    style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
                                  >
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.4,
                                        px: 1,
                                        py: 0.6,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        boxShadow: '0 6px 16px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.2)',
                                        border: '1px solid rgba(16, 185, 129, 0.4)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                          content: '""',
                                          position: 'absolute',
                                          top: 0,
                                          left: -100,
                                          width: '100%',
                                          height: '100%',
                                          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                                          animation: 'shimmer 2s infinite',
                                        }
                                      }}
                                    >
                                      <TrendingUp size={14} color="white" sx={{ zIndex: 1 }} />
                                      <Typography 
                                        variant="caption" 
                                        sx={{ 
                                          fontWeight: 800,
                                          fontSize: '0.8rem',
                                          color: 'white',
                                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
                                          letterSpacing: '0.5px',
                                          lineHeight: 1
                                        }}
                                      >
                                        {Math.round(option.percentage)}%
                                      </Typography>
                                    </Box>
                                  </motion.div>
                                )}
                              </Box>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                              >
                                <LinearProgress
                                  variant="determinate"
                                  value={option.percentage}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    mt: 1,
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 4,
                                      background: option.selected ? 
                                        'linear-gradient(90deg, #9333ea, #ec4899)' : 
                                        `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`,
                                      boxShadow: option.selected ? 
                                        '0 2px 8px rgba(147, 51, 234, 0.3)' : 
                                        '0 2px 4px rgba(0, 0, 0, 0.1)',
                                      transition: 'all 0.3s ease'
                                    }
                                  }}
                                />
                              </motion.div>
                              {/* Ripple Effect */}
                              {isRippling && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0.8 }}
                                  animate={{ scale: 4, opacity: 0 }}
                                  transition={{ duration: 0.8 }}
                                  style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(147, 51, 234, 0.3)',
                                    border: '2px solid rgba(147, 51, 234, 0.6)',
                                    pointerEvents: 'none'
                                  }}
                                />
                              )}
                            </motion.div>
                          );
                        })}
                      </Box>

                      {/* Enhanced Voting Interface & Live Results */}
                      <Box sx={{ 
                        mt: 3, 
                        p: 3, 
                        background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.05))', 
                        borderRadius: 3, 
                        border: '1px solid rgba(147, 51, 234, 0.2)',
                        position: 'relative',
                        zIndex: 4
                      }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          color: '#ffffff', 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Activity size={18} />
                          Live Voting Results
                        </Typography>
                        
                        {/* Quick Vote Summary */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))',
                                border: '1px solid rgba(16, 185, 129, 0.3)'
                              }}>
                                <Users size={16} sx={{ color: '#10b981' }} />
                                <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                                  {poll.totalVotes || 0} Votes
                                </Typography>
                              </Box>
                            </motion.div>
                            
                            {poll.userVotes && poll.userVotes.length > 0 && (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 1,
                                  px: 2,
                                  py: 1,
                                  borderRadius: 2,
                                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.1))',
                                  border: '1px solid rgba(147, 51, 234, 0.3)'
                                }}>
                                  <CheckCircle size={16} sx={{ color: '#9333ea' }} />
                                  <Typography variant="body2" sx={{ color: '#9333ea', fontWeight: 600 }}>
                                    You Voted
                                  </Typography>
                                </Box>
                              </motion.div>
                            )}
                          </Box>
                          
                          <Box sx={{ position: 'relative', zIndex: 100, mt: 2, width: '100%' }}>
                          <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Chart button clicked for poll:', poll._id);
                              togglePollExpansion(poll._id);
                            }}
                            startIcon={
                              expandedPoll === poll._id ? (
                                <ChevronUp size={24} />
                              ) : (
                                <PieChart size={24} />
                              )
                            }
                            sx={{
                              textTransform: 'none',
                              fontSize: '1.1rem',
                              fontWeight: 700,
                              py: 2,
                              px: 3,
                              minHeight: '60px',
                              background: expandedPoll === poll._id 
                                ? 'linear-gradient(135deg, #1e40af, #3b82f6, #6366f1)' 
                                : 'linear-gradient(135deg, #1f2937, #374151, #4b5563)',
                              color: '#ffffff',
                              border: '2px solid transparent',
                              borderRadius: 3,
                              boxShadow: expandedPoll === poll._id 
                                ? '0 10px 30px rgba(59, 130, 246, 0.4)' 
                                : '0 4px 15px rgba(0, 0, 0, 0.3)',
                              cursor: 'pointer',
                              '&:hover': {
                                background: expandedPoll === poll._id 
                                  ? 'linear-gradient(135deg, #1d4ed8, #2563eb, #4f46e5)' 
                                  : 'linear-gradient(135deg, #374151, #4b5563, #6b7280)',
                                boxShadow: expandedPoll === poll._id 
                                  ? '0 15px 40px rgba(59, 130, 246, 0.5)' 
                                  : '0 8px 25px rgba(0, 0, 0, 0.4)',
                                transform: 'translateY(-2px)'
                              },
                              '&:active': {
                                transform: 'translateY(0px)'
                              }
                            }}
                          >
                            {expandedPoll === poll._id ? 'Hide Chart' : 'Show Chart'}
                          </Button>
                        </Box>
                        </Box>

                        {/* Enhanced Pie Chart */}
                        <Collapse in={expandedPoll === poll._id}>
                          {console.log('Chart collapse state for poll', poll._id, ':', expandedPoll === poll._id, 'expandedPoll:', expandedPoll)}
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              mb: 2
                            }}>
                              <Typography variant="subtitle1" sx={{ 
                                fontWeight: 600, 
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                <PieChart size={18} />
                                Vote Distribution
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                Total: {poll.totalVotes || 0} votes
                              </Typography>
                            </Box>
                            
                            {(!poll.options || poll.options.length === 0) ? (
                              <Box sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>
                                <Typography variant="body2">No options available for this poll</Typography>
                              </Box>
                            ) : (poll.totalVotes === 0) ? (
                              <Box sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>
                                <Typography variant="body2">No votes yet. Be the first to vote!</Typography>
                              </Box>
                            ) : (
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 3,
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              {/* Pie Chart */}
                              <Box sx={{ flex: 1, maxWidth: '280px' }}>
                                {console.log('Rendering chart for poll', poll._id, 'with options:', poll.options)}
                                <ResponsiveContainer width="100%" height={250} key={`enhanced-pie-chart-${poll._id}-${poll.totalVotes || 0}-${forceUpdate}-${Date.now()}`}>
                                  <RechartsPieChart>
                                    <Pie
                                      data={(poll.options || []).map((opt, i) => {
                                        const voteCount = Array.isArray(opt.originalVotes) ? opt.originalVotes.length : (opt.votes || 0);
                                        console.log('Chart data for option', i, ':', opt.text, 'votes:', voteCount);
                                        return {
                                          name: opt.text.length > 25 ? opt.text.substring(0, 25) + '...' : opt.text,
                                          value: voteCount,
                                          color: COLORS[i % COLORS.length],
                                          percentage: poll.totalVotes > 0 ? Math.round((voteCount / poll.totalVotes) * 100) : 0
                                        };
                                      })}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={90}
                                      paddingAngle={2}
                                      dataKey="value"
                                      animationBegin={0}
                                      animationDuration={800}
                                      animationEasing="ease-out"
                                    >
                                      {(poll.options || []).map((entry, index) => (
                                        <Cell 
                                          key={`cell-${index}`} 
                                          fill={COLORS[index % COLORS.length]}
                                          stroke={entry.selected ? '#9333ea' : 'none'}
                                          strokeWidth={entry.selected ? 3 : 0}
                                        />
                                      ))}
                                    </Pie>
                                    <RechartsTooltip 
                                      contentStyle={{ 
                                        backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                                        border: '1px solid rgba(147, 51, 234, 0.3)',
                                        borderRadius: '8px',
                                        color: '#ffffff'
                                      }}
                                      labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                                      formatter={(value, name, props) => [
                                        `${value} votes (${props.payload.percentage}%)`,
                                        name
                                      ]}
                                    />
                                  </RechartsPieChart>
                                </ResponsiveContainer>
                              </Box>
                              
                              {/* Legend with Stats */}
                              <Box sx={{ flex: 1, ml: 2 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                  {(poll.options || []).map((option, index) => {
                                    const voteCount = Array.isArray(option.originalVotes) ? option.originalVotes.length : (option.votes || 0);
                                    const percentage = poll.totalVotes > 0 ? Math.round((voteCount / poll.totalVotes) * 100) : 0;
                                    
                                    return (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                        whileHover={{ scale: 1.02 }}
                                      >
                                        <Box sx={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: 2,
                                          p: 1.5,
                                          borderRadius: 2,
                                          backgroundColor: option.selected ? 'rgba(147, 51, 234, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                          border: option.selected ? '1px solid rgba(147, 51, 234, 0.3)' : '1px solid transparent',
                                          transition: 'all 0.2s ease'
                                        }}>
                                          <Box
                                            sx={{
                                              width: 12,
                                              height: 12,
                                              borderRadius: '50%',
                                              backgroundColor: COLORS[index % COLORS.length],
                                              flexShrink: 0,
                                              boxShadow: option.selected ? `0 0 12px ${COLORS[index % COLORS.length]}` : 'none'
                                            }}
                                          />
                                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography variant="body2" sx={{ 
                                              color: option.selected ? '#9333ea' : '#e2e8f0',
                                              fontWeight: option.selected ? 600 : 500,
                                              fontSize: '0.85rem',
                                              lineHeight: 1.3,
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap'
                                            }}>
                                              {option.text.length > 30 ? option.text.substring(0, 30) + '...' : option.text}
                                            </Typography>
                                          </Box>
                                          <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            flexShrink: 0
                                          }}>
                                            <Typography variant="body2" sx={{ 
                                              color: '#94a3b8',
                                              fontWeight: 600,
                                              fontSize: '0.8rem'
                                            }}>
                                              {voteCount}
                                            </Typography>
                                            <Typography variant="caption" sx={{ 
                                              color: '#64748b',
                                              fontWeight: 700,
                                              fontSize: '0.75rem',
                                              minWidth: '35px',
                                              textAlign: 'right'
                                            }}>
                                              {percentage}%
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </motion.div>
                                    );
                                  })}
                                </Box>
                              </Box>
                            </Box>
                            )}
                          </Box>
                        </Collapse>
                      </Box>

                      {/* Poll Type Indicator and Stats */}
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {poll.isMultipleChoice ? 'Multiple choice - Select all that apply' : 'Single choice - Select one option'}
                          </Typography>
                          {poll.userVotes && poll.userVotes.length > 0 && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Chip
                                size="small"
                                icon={
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      background: `linear-gradient(135deg, #9333ea, #ec4899)`,
                                      boxShadow: '0 2px 4px rgba(147, 51, 234, 0.3)'
                                    }}
                                  />
                                }
                                label={`${poll.userVotes.length} vote${poll.userVotes.length > 1 ? 's' : ''}`}
                                color="primary"
                                variant="outlined"
                                sx={{ 
                                  fontWeight: 'bold',
                                  borderColor: 'primary.main',
                                  backgroundColor: 'rgba(147, 51, 234, 0.1)',
                                  '& .MuiChip-icon': {
                                    color: 'white'
                                  }
                                }}
                              />
                            </motion.div>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {poll.subject} • Year {poll.year} • Semester {poll.semester}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {poll.isActive && (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Tooltip title="End poll" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => deactivatePoll(poll)}
                                    sx={{ 
                                      backgroundColor: 'rgba(251, 146, 60, 0.15)',
                                      color: '#fb923c',
                                      borderRadius: 2,
                                      border: '1px solid rgba(251, 146, 60, 0.3)',
                                      width: 32,
                                      height: 32,
                                      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                                      '&:hover': {
                                        backgroundColor: 'rgba(251, 146, 60, 0.25)',
                                        transform: 'scale(1.1)',
                                        borderColor: '#fb923c',
                                        boxShadow: '0 2px 8px rgba(251, 146, 60, 0.3)',
                                      },
                                    }}
                                    
                                  >
                                    <CheckCircle size={14} />
                                  </IconButton>
                                </Tooltip>
                              </motion.div>
                            )}
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Tooltip title="Delete poll" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => deletePoll(poll)}
                                  sx={{ 
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                    color: '#ef4444',
                                    borderRadius: 2,
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    width: 32,
                                    height: 32,
                                    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                                    '&:hover': {
                                      backgroundColor: 'rgba(239, 68, 68, 0.25)',
                                      transform: 'scale(1.1)',
                                      borderColor: '#ef4444',
                                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                                    },
                                  }}
                                >
                                  <Trash2 size={14} />
                                </IconButton>
                              </Tooltip>
                            </motion.div>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(poll.createdAt).toLocaleDateString()}
                        </Typography>
                        <AICorrectionButton 
                          poll={poll} 
                          disabled={!poll.isActive}
                          onCorrectionReceived={(correction) => {
                            console.log('AI Correction received for poll:', poll.title, correction);
                            console.log('Poll details:', { 
                              pollId: poll._id, 
                              isActive: poll.isActive, 
                              hasVoted: poll.hasVoted,
                              optionsLength: poll.options?.length 
                            });
                            
                            // If AI provided a specific correct answer (not -1), automatically select it
                            if (correction.correctAnswer >= 0 && correction.correctAnswer < poll.options.length) {
                              console.log('AI suggested answer:', correction.correctAnswer);
                              
                              // Check if user hasn't already voted
                              if (!poll.hasVoted) {
                                console.log('User has not voted, attempting to auto-vote...');
                                // Automatically vote for the AI's suggested answer
                                handleVote(poll._id, correction.correctAnswer);
                                
                                // Show success feedback (you could add a toast notification here)
                                console.log(`AI selected Option ${correction.correctAnswer + 1}: ${poll.options[correction.correctAnswer].text || poll.options[correction.correctAnswer]}`);
                              } else {
                                console.log('User has already voted in this poll');
                              }
                            } else {
                              console.log('AI did not provide a valid answer or answer is out of range');
                            }
                          }}
                        />
                      </Box>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
                </Box>
              </motion.div>
          </>
        )
      }
      </AnimatePresence>
        

      {/* Beautiful Poll Creator */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            maxHeight: '90vh',
            overflow: 'auto',
          }
        }}
      >
        <BeautifulPollCreator
          currentUser={currentUser}
          onCreatePoll={handleCreatePoll}
          isSubmitting={isSubmitting}
          onCancel={handleCloseDialog}
        />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmNotification
        open={deleteConfirmOpen && pollToDelete?.action === 'delete'}
        onClose={handleDeleteCancel}
        itemName={pollToDelete?.title || 'this poll'}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      
      {/* End Poll Confirmation Dialog */}
      <ActionConfirmDialog
        open={deleteConfirmOpen && pollToDelete?.action === 'deactivate'}
        onClose={handleDeleteCancel}
        title="End Poll"
        message="Are you sure you want to end"
        itemName={pollToDelete?.title || 'this poll'}
        confirmText="End Poll"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        severity="end"
        icon={<CheckCircle sx={{ fontSize: 56, color: '#fb923c' }} />}
      />
    </Container>
    </>
  );
};

export default Polls;


