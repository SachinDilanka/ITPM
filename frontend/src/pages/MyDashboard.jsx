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
  LinearProgress,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Search,
  Add,
  TrendingUp,
  Notifications,
  Settings,
  Person,
  School,
  Book,
  Star,
  CheckCircle,
  Schedule,
  Assessment,
  Group,
  Assignment,
  CalendarToday,
  Timer,
  EmojiEvents,
  Lightbulb,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Share,
  Bookmark,
  BookmarkBorder
} from '@mui/icons-material';

const MyDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [myProjects, setMyProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [myStats, setMyStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [createDialog, setCreateDialog] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', category: '' });

  const categories = ['Development', 'Design', 'Research', 'Academic', 'Personal'];

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMyProjects([
        {
          id: 1,
          title: 'AI Study Assistant',
          description: 'Building an AI-powered tool to help students with exam preparation',
          category: 'Development',
          progress: 75,
          status: 'active',
          createdAt: '2024-01-15',
          lastModified: '2024-03-20',
          collaborators: 3,
          tasks: 12,
          completedTasks: 9
        },
        {
          id: 2,
          title: 'Research Paper Analysis',
          description: 'Analyzing research papers for computer science topics',
          category: 'Research',
          progress: 45,
          status: 'active',
          createdAt: '2024-02-01',
          lastModified: '2024-03-19',
          collaborators: 2,
          tasks: 8,
          completedTasks: 4
        },
        {
          id: 3,
          title: 'Portfolio Website',
          description: 'Creating a personal portfolio to showcase my work',
          category: 'Design',
          progress: 90,
          status: 'active',
          createdAt: '2024-01-10',
          lastModified: '2024-03-18',
          collaborators: 1,
          tasks: 15,
          completedTasks: 13
        }
      ]);

      setMyTasks([
        {
          id: 1,
          title: 'Complete React component',
          description: 'Finish the dashboard component with all features',
          priority: 'high',
          dueDate: '2024-03-25',
          status: 'pending',
          projectId: 1
        },
        {
          id: 2,
          title: 'Review research paper',
          description: 'Analyze the latest ML research paper',
          priority: 'medium',
          dueDate: '2024-03-28',
          status: 'in-progress',
          projectId: 2
        },
        {
          id: 3,
          title: 'Update portfolio design',
          description: 'Improve the visual design of portfolio',
          priority: 'low',
          dueDate: '2024-04-01',
          status: 'pending',
          projectId: 3
        }
      ]);

      setMyStats({
        totalProjects: 3,
        activeProjects: 3,
        completedProjects: 0,
        totalTasks: 35,
        completedTasks: 26,
        pendingTasks: 9,
        averageProgress: 70,
        totalCollaborators: 6
      });

      setLoading(false);
    }, 1000);
  };

  const handleCreateProject = () => {
    if (newProject.title && newProject.description && newProject.category) {
      const project = {
        id: myProjects.length + 1,
        title: newProject.title,
        description: newProject.description,
        category: newProject.category,
        progress: 0,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        collaborators: 1,
        tasks: 0,
        completedTasks: 0
      };

      setMyProjects([project, ...myProjects]);
      setCreateDialog(false);
      setNewProject({ title: '', description: '', category: '' });
      setSnackbar({ open: true, message: 'Project created successfully!' });
    }
  };

  const handleDeleteProject = (projectId) => {
    setMyProjects(myProjects.filter(p => p.id !== projectId));
    setSnackbar({ open: true, message: 'Project deleted successfully!' });
  };

  const handleTaskStatusChange = (taskId, newStatus) => {
    setMyTasks(myTasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    setSnackbar({ open: true, message: 'Task status updated!' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'completed': return '#2196f3';
      case 'paused': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress sx={{ mb: 4 }} />
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Loading your dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
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
          My Dashboard
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Manage your projects and tasks efficiently
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{
            p: 3,
            height: 180,
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            '&:hover': {
              boxShadow: '0 10px 30px rgba(147, 51, 234, 0.3)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Assessment sx={{ fontSize: 40, color: '#9333ea' }} />
            </Box>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              {myStats.totalProjects}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Projects
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{
            p: 3,
            height: 180,
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            '&:hover': {
              boxShadow: '0 10px 30px rgba(147, 51, 234, 0.3)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Assignment sx={{ fontSize: 40, color: '#ec4899' }} />
            </Box>
            <Typography variant="h4" color="secondary" sx={{ fontWeight: 'bold' }}>
              {myStats.completedTasks}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed Tasks
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{
            p: 3,
            height: 180,
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            '&:hover': {
              boxShadow: '0 10px 30px rgba(147, 51, 234, 0.3)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <TrendingUp sx={{ fontSize: 40, color: '#4caf50' }} />
            </Box>
            <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
              {myStats.averageProgress}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Progress
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{
            p: 3,
            height: 180,
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            '&:hover': {
              boxShadow: '0 10px 30px rgba(147, 51, 234, 0.3)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Group sx={{ fontSize: 40, color: '#ff9800' }} />
            </Box>
            <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
              {myStats.totalCollaborators}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Collaborators
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{
        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px solid rgba(147, 51, 234, 0.3)',
        mb: 4
      }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': {
                color: '#9333ea'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#9333ea'
            }
          }}
        >
          <Tab icon={<Assessment />} label="Projects" />
          <Tab icon={<Assignment />} label="Tasks" />
          <Tab icon={<TrendingUp />} label="Analytics" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>
              My Projects
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialog(true)}
              sx={{
                background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7c3aed, #db2777)'
                }
              }}
            >
              New Project
            </Button>
          </Box>

          <Grid container spacing={3}>
            {myProjects.map((project) => (
              <Grid item xs={12} md={6} lg={4} key={project.id}>
                <Card sx={{
                  height: '100%',
                  background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  '&:hover': {
                    boxShadow: '0 10px 30px rgba(147, 51, 234, 0.3)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                        {project.title}
                      </Typography>
                      <IconButton size="small" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        <MoreVert />
                      </IconButton>
                    </Box>

                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                      {project.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={project.category}
                        size="small"
                        sx={{
                          background: 'rgba(147, 51, 234, 0.2)',
                          color: '#9333ea',
                          border: '1px solid rgba(147, 51, 234, 0.3)'
                        }}
                      />
                      <Chip
                        label={project.status}
                        size="small"
                        sx={{
                          background: `${getStatusColor(project.status)}20`,
                          color: getStatusColor(project.status),
                          border: `1px solid ${getStatusColor(project.status)}40`
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Progress
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {project.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          background: 'rgba(147, 51, 234, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255, 255, 255, 0.5)' }}>
                      <Typography variant="caption">
                        {project.tasks} tasks
                      </Typography>
                      <Typography variant="caption">
                        {project.collaborators} collaborators
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      sx={{
                        color: '#9333ea',
                        borderColor: 'rgba(147, 51, 234, 0.5)',
                        '&:hover': {
                          borderColor: '#9333ea',
                          background: 'rgba(147, 51, 234, 0.1)'
                        }
                      }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      sx={{
                        color: '#ec4899',
                        borderColor: 'rgba(236, 72, 153, 0.5)',
                        '&:hover': {
                          borderColor: '#ec4899',
                          background: 'rgba(236, 72, 153, 0.1)'
                        }
                      }}
                    >
                      Edit
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteProject(project.id)}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        '&:hover': {
                          color: '#f44336'
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold', mb: 3 }}>
            My Tasks
          </Typography>

          <List>
            {myTasks.map((task) => (
              <Paper
                key={task.id}
                sx={{
                  mb: 2,
                  background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  '&:hover': {
                    boxShadow: '0 10px 30px rgba(147, 51, 234, 0.3)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <ListItem sx={{ py: 2 }}>
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: getPriorityColor(task.priority)
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>
                        {task.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {task.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Chip
                            label={task.priority}
                            size="small"
                            sx={{
                              background: `${getPriorityColor(task.priority)}20`,
                              color: getPriorityColor(task.priority),
                              fontSize: '0.7rem'
                            }}
                          />
                          <Chip
                            label={task.status}
                            size="small"
                            sx={{
                              background: 'rgba(147, 51, 234, 0.2)',
                              color: '#9333ea',
                              fontSize: '0.7rem'
                            }}
                          />
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            Due: {task.dueDate}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleTaskStatusChange(task.id, 'completed')}
                      sx={{
                        borderColor: 'rgba(76, 175, 80, 0.5)',
                        color: '#4caf50',
                        fontSize: '0.7rem',
                        '&:hover': {
                          borderColor: '#4caf50',
                          background: 'rgba(76, 175, 80, 0.1)'
                        }
                      }}
                    >
                      Complete
                    </Button>
                  </Box>
                </ListItem>
              </Paper>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold', mb: 3 }}>
            Analytics
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{
                p: 3,
                background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                border: '1px solid rgba(147, 51, 234, 0.3)'
              }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                  Project Distribution
                </Typography>
                {categories.map((category) => {
                  const count = myProjects.filter(p => p.category === category).length;
                  const percentage = myProjects.length > 0 ? (count / myProjects.length) * 100 : 0;
                  return (
                    <Box key={category} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {category}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {count} projects ({percentage.toFixed(0)}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          background: 'rgba(147, 51, 234, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                            borderRadius: 3
                          }
                        }}
                      />
                    </Box>
                  );
                })}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{
                p: 3,
                background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                border: '1px solid rgba(147, 51, 234, 0.3)'
              }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                  Task Status
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Pending Tasks
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                      {myStats.pendingTasks}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      In Progress
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                      {myStats.totalTasks - myStats.completedTasks - myStats.pendingTasks}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Completed
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                      {myStats.completedTasks}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Create Project Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(147, 51, 234, 0.3)'
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(147, 51, 234, 0.3)' }}>
          Create New Project
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Project Title"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{
              sx: {
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(147, 51, 234, 0.3)'
                }
              }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            multiline
            rows={3}
            sx={{ mb: 2 }}
            InputProps={{
              sx: {
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(147, 51, 234, 0.3)'
                }
              }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
          <TextField
            fullWidth
            select
            label="Category"
            value={newProject.category}
            onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{
              sx: {
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(147, 51, 234, 0.3)'
                }
              }
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(147, 51, 234, 0.3)' }}>
          <Button onClick={() => setCreateDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #9333ea, #ec4899)',
              '&:hover': {
                background: 'linear-gradient(45deg, #7c3aed, #db2777)'
              }
            }}
          >
            Create Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity="success"
          sx={{
            background: 'linear-gradient(45deg, #4caf50, #45a049)',
            color: '#fff'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyDashboard;
