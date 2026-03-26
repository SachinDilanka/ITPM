import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Badge,
  Tooltip,
  LinearProgress,
  Skeleton
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  Visibility,
  ThumbUp,
  Bookmark,
  BookmarkBorder,
  Star,
  StarBorder,
  TrendingUp,
  AccessTime,
  School,
  Subject,
  CalendarToday,
  Person,
  FileDownload,
  Favorite,
  FavoriteBorder,
  Share,
  MoreVert,
  Sort,
  ArrowUpward,
  ArrowDownward,
  Clear,
  CheckCircle,
  Pending,
  Schedule
} from '@mui/icons-material';

const BrowseNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedNote, setSelectedNote] = useState(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [bookmarkedNotes, setBookmarkedNotes] = useState(new Set());
  const [likedNotes, setLikedNotes] = useState(new Set());

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Biology', 'English', 'History'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const years = ['2021', '2022', '2023', '2024'];

  useEffect(() => {
    fetchNotes();
  }, [currentPage, searchTerm, selectedSubject, selectedSemester, selectedYear, sortBy]);

  const fetchNotes = async () => {
    setLoading(true);
    setTimeout(() => {
      const mockNotes = [
        {
          id: 1,
          title: 'Advanced Data Structures & Algorithms',
          description: 'Comprehensive notes covering trees, graphs, and dynamic programming with visual examples and practice problems.',
          subject: 'Computer Science',
          semester: 4,
          year: '2024',
          author: { name: 'Sarah Chen', avatar: 'SC', verified: true },
          fileUrl: '/notes/data-structures.pdf',
          fileSize: '2.4 MB',
          fileType: 'PDF',
          downloads: 1234,
          views: 5678,
          likes: 89,
          bookmarks: 45,
          rating: 4.8,
          status: 'approved',
          uploadedAt: '2 days ago',
          tags: ['algorithms', 'data structures', 'programming'],
          difficulty: 'Advanced',
          pages: 45
        },
        {
          id: 2,
          title: 'Organic Chemistry Reaction Mechanisms',
          description: 'Detailed explanation of reaction mechanisms with electron-pushing diagrams and real-world examples.',
          subject: 'Chemistry',
          semester: 3,
          year: '2024',
          author: { name: 'Michael Rodriguez', avatar: 'MR', verified: true },
          fileUrl: '/notes/organic-chemistry.pdf',
          fileSize: '3.1 MB',
          fileType: 'PDF',
          downloads: 987,
          views: 3456,
          likes: 67,
          bookmarks: 34,
          rating: 4.6,
          status: 'approved',
          uploadedAt: '1 week ago',
          tags: ['organic chemistry', 'reactions', 'mechanisms'],
          difficulty: 'Intermediate',
          pages: 38
        },
        {
          id: 3,
          title: 'Calculus III: Multiple Integrals',
          description: 'Step-by-step solutions to complex integration problems with geometric interpretations.',
          subject: 'Mathematics',
          semester: 2,
          year: '2023',
          author: { name: 'Emily Johnson', avatar: 'EJ', verified: false },
          fileUrl: '/notes/calculus-3.pdf',
          fileSize: '1.8 MB',
          fileType: 'PDF',
          downloads: 756,
          views: 2345,
          likes: 45,
          bookmarks: 28,
          rating: 4.7,
          status: 'approved',
          uploadedAt: '2 weeks ago',
          tags: ['calculus', 'integrals', 'mathematics'],
          difficulty: 'Intermediate',
          pages: 32
        }
      ];
      
      setNotes(mockNotes);
      setTotalPages(3);
      setLoading(false);
    }, 1000);
  };

  const handleBookmark = (noteId) => {
    const newBookmarks = new Set(bookmarkedNotes);
    if (newBookmarks.has(noteId)) {
      newBookmarks.delete(noteId);
    } else {
      newBookmarks.add(noteId);
    }
    setBookmarkedNotes(newBookmarks);
  };

  const handleLike = (noteId) => {
    const newLikes = new Set(likedNotes);
    if (newLikes.has(noteId)) {
      newLikes.delete(noteId);
    } else {
      newLikes.add(noteId);
    }
    setLikedNotes(newLikes);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#4caf50';
      case 'Intermediate': return '#ff9800';
      case 'Advanced': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'PDF': return '📄';
      case 'DOCX': return '📝';
      case 'PNG': return '🖼️';
      default: return '📁';
    }
  };

  const NoteCard = ({ note }) => (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px solid rgba(147, 51, 234, 0.3)',
        borderRadius: 3,
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          boxShadow: '0 10px 30px rgba(147, 51, 234, 0.3)',
          border: '1px solid rgba(147, 51, 234, 0.5)',
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease'
        }
      }}
    >
      <Chip
        icon={note.status === 'approved' ? <CheckCircle /> : note.status === 'pending' ? <Schedule /> : <Pending />}
        label={note.status.charAt(0).toUpperCase() + note.status.slice(1)}
        size="small"
        color={getStatusColor(note.status)}
        sx={{
          position: 'absolute',
          top: -10,
          right: 10,
          zIndex: 1,
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.1)'
        }}
      />

      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#9333ea', width: 40, height: 40 }}>
              {note.author.avatar}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 'bold' }}>
                {note.author.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {note.uploadedAt}
              </Typography>
            </Box>
          </Box>
          {note.author.verified && (
            <Tooltip title="Verified Author">
              <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
            </Tooltip>
          )}
        </Box>

        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            fontWeight: 'bold',
            mb: 1,
            lineHeight: 1.3,
            minHeight: 48
          }}
        >
          {note.title}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            mb: 2,
            minHeight: 48,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {note.description}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {note.tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              sx={{
                background: 'rgba(147, 51, 234, 0.2)',
                color: '#9333ea',
                border: '1px solid rgba(147, 51, 234, 0.3)',
                fontSize: '0.7rem'
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<School />}
            label={note.subject}
            size="small"
            sx={{
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#3b82f6',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}
          />
          <Chip
            icon={<CalendarToday />}
            label={`Semester ${note.semester}`}
            size="small"
            sx={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          />
          <Chip
            icon={<TrendingUp />}
            label={note.difficulty}
            size="small"
            sx={{
              background: `${getDifficultyColor(note.difficulty)}20`,
              color: getDifficultyColor(note.difficulty),
              border: `1px solid ${getDifficultyColor(note.difficulty)}40`
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {getFileIcon(note.fileType)} {note.fileType}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            • {note.fileSize}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            • {note.pages} pages
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Visibility sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {note.views.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Download sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {note.downloads.toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Star sx={{ fontSize: 16, color: '#fbbf24' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {note.rating}
            </Typography>
          </Box>
        </Box>

        <CardActions sx={{ p: 0, gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<FileDownload />}
            sx={{
              background: 'linear-gradient(45deg, #9333ea, #ec4899)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(45deg, #7c3aed, #db2777)',
                transform: 'scale(1.05)'
              }
            }}
          >
            Download
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => {
              setSelectedNote(note);
              setPreviewDialog(true);
            }}
            sx={{
              borderColor: 'rgba(147, 51, 234, 0.5)',
              color: '#9333ea',
              '&:hover': {
                borderColor: '#9333ea',
                background: 'rgba(147, 51, 234, 0.1)'
              }
            }}
          >
            Preview
          </Button>
          <IconButton
            size="small"
            onClick={() => handleLike(note.id)}
            sx={{
              color: likedNotes.has(note.id) ? '#ef4444' : 'rgba(255, 255, 255, 0.5)',
              '&:hover': { color: '#ef4444' }
            }}
          >
            {likedNotes.has(note.id) ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleBookmark(note.id)}
            sx={{
              color: bookmarkedNotes.has(note.id) ? '#fbbf24' : 'rgba(255, 255, 255, 0.5)',
              '&:hover': { color: '#fbbf24' }
            }}
          >
            {bookmarkedNotes.has(note.id) ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        </CardActions>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #9333ea, #ec4899)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Browse Notes
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Discover high-quality study materials from your peers
        </Typography>
      </Box>

      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(147, 51, 234, 0.3)'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                  </InputAdornment>
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
                '& .MuiInputBase-input': {
                  color: '#fff'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Subject</InputLabel>
              <Select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                sx={{
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
                }}
              >
                <MenuItem value="">All Subjects</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Semester</InputLabel>
              <Select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                sx={{
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
                }}
              >
                <MenuItem value="">All Semesters</MenuItem>
                {semesters.map((semester) => (
                  <MenuItem key={semester} value={semester}>Semester {semester}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Year</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                sx={{
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
                }}
              >
                <MenuItem value="">All Years</MenuItem>
                {years.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{
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
                }}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="popular">Most Popular</MenuItem>
                <MenuItem value="rated">Highest Rated</MenuItem>
                <MenuItem value="downloaded">Most Downloaded</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item}>
              <Skeleton variant="rectangular" height={400} sx={{ bgcolor: 'rgba(147, 51, 234, 0.1)' }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          <Grid container spacing={3}>
            {notes.map((note) => (
              <Grid item xs={12} md={6} lg={4} key={note.id}>
                <NoteCard note={note} />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(e, value) => setCurrentPage(value)}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#fff',
                  borderColor: 'rgba(147, 51, 234, 0.3)'
                },
                '& .MuiPaginationItem-root:hover': {
                  background: 'rgba(147, 51, 234, 0.2)'
                },
                '& .MuiPaginationItem-root.Mui-selected': {
                  background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                  color: '#fff'
                }
              }}
            />
          </Box>
        </>
      )}

      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(147, 51, 234, 0.3)'
          }
        }}
      >
        {selectedNote && (
          <>
            <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(147, 51, 234, 0.3)' }}>
              {selectedNote.title}
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                {selectedNote.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip label={selectedNote.subject} color="primary" />
                <Chip label={`Semester ${selectedNote.semester}`} color="secondary" />
                <Chip label={selectedNote.difficulty} />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                File: {selectedNote.fileType} • {selectedNote.fileSize} • {selectedNote.pages} pages
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(147, 51, 234, 0.3)' }}>
              <Button onClick={() => setPreviewDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<FileDownload />}
                sx={{
                  background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #7c3aed, #db2777)'
                  }
                }}
              >
                Download
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default BrowseNotes;
