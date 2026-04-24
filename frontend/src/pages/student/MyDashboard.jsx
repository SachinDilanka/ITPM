import { useState, useEffect } from 'react';
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
  LinearProgress,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Assessment,
  Assignment,
  TrendingUp,
  Group,
  MoreVert,
  Visibility,
  Edit,
  Delete,
} from '@mui/icons-material';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const categories = ['Development', 'Design', 'Research', 'Academic', 'Personal'];

const MyDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [myProjects, setMyProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [myStats, setMyStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [createDialog, setCreateDialog] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', category: '' });

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setMyProjects([
        {
          id: 1,
          title: 'AI Study Assistant',
          description: 'Building an AI-powered tool to help students with exam preparation',
          category: 'Development',
          progress: 75,
          status: 'active',
          collaborators: 3,
          tasks: 12,
          completedTasks: 9,
        },
        {
          id: 2,
          title: 'Research Paper Analysis',
          description: 'Analyzing research papers for computer science topics',
          category: 'Research',
          progress: 45,
          status: 'active',
          collaborators: 2,
          tasks: 8,
          completedTasks: 4,
        },
        {
          id: 3,
          title: 'Portfolio Website',
          description: 'Creating a personal portfolio to showcase my work',
          category: 'Design',
          progress: 90,
          status: 'active',
          collaborators: 1,
          tasks: 15,
          completedTasks: 13,
        },
      ]);
      setMyTasks([
        {
          id: 1,
          title: 'Complete React component',
          description: 'Finish the dashboard component with all features',
          priority: 'high',
          status: 'pending',
          projectId: 1,
        },
        {
          id: 2,
          title: 'Review research paper',
          description: 'Analyze the latest ML research paper',
          priority: 'medium',
          status: 'in-progress',
          projectId: 2,
        },
        {
          id: 3,
          title: 'Update portfolio design',
          description: 'Improve the visual design of portfolio',
          priority: 'low',
          status: 'pending',
          projectId: 3,
        },
      ]);
      setMyStats({
        totalProjects: 3,
        completedTasks: 26,
        averageProgress: 70,
        totalCollaborators: 6,
        pendingTasks: 9,
        totalTasks: 35,
      });
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const handleCreateProject = () => {
    if (!newProject.title || !newProject.description || !newProject.category) return;
    const project = {
      id: Date.now(),
      title: newProject.title,
      description: newProject.description,
      category: newProject.category,
      progress: 0,
      status: 'active',
      collaborators: 1,
      tasks: 0,
      completedTasks: 0,
    };
    setMyProjects((p) => [project, ...p]);
    setCreateDialog(false);
    setNewProject({ title: '', description: '', category: '' });
    setSnackbar({ open: true, message: 'Project created successfully!' });
  };

  const handleDeleteProject = (projectId) => {
    setMyProjects((p) => p.filter((x) => x.id !== projectId));
    setSnackbar({ open: true, message: 'Project deleted successfully!' });
  };

  const handleTaskStatusChange = (taskId) => {
    setMyTasks((tasks) =>
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' } : task
      )
    );
    setSnackbar({ open: true, message: 'Task status updated!' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#4caf50';
      case 'completed':
        return '#2196f3';
      case 'paused':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const paperSx = {
    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
    border: '1px solid rgba(147, 51, 234, 0.3)',
  };

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
            mb: 1,
          }}
        >
          My Dashboard
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Manage your projects and tasks (local demo — connect to your API when ready)
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { icon: <Assessment sx={{ fontSize: 40, color: '#9333ea' }} />, value: myStats.totalProjects, label: 'Total Projects' },
          { icon: <Assignment sx={{ fontSize: 40, color: '#ec4899' }} />, value: myStats.completedTasks, label: 'Completed Tasks' },
          { icon: <TrendingUp sx={{ fontSize: 40, color: '#4caf50' }} />, value: `${myStats.averageProgress}%`, label: 'Average Progress' },
          { icon: <Group sx={{ fontSize: 40, color: '#ff9800' }} />, value: myStats.totalCollaborators, label: 'Collaborators' },
        ].map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                height: 180,
                ...paperSx,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                '&:hover': {
                  boxShadow: '0 10px 30px rgba(147, 51, 234, 0.3)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>{stat.icon}</Box>
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold' }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ ...paperSx, mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            '& .MuiTab-root': { color: 'rgba(255, 255, 255, 0.7)', '&.Mui-selected': { color: '#9333ea' } },
            '& .MuiTabs-indicator': { backgroundColor: '#9333ea' },
          }}
        >
          <Tab icon={<Assessment />} label="Projects" iconPosition="start" />
          <Tab icon={<Assignment />} label="Tasks" iconPosition="start" />
          <Tab icon={<TrendingUp />} label="Analytics" iconPosition="start" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>
              My Projects
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialog(true)}
              sx={{
                background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                '&:hover': { background: 'linear-gradient(45deg, #7c3aed, #db2777)' },
              }}
            >
              New Project
            </Button>
          </Box>
          <Grid container spacing={3}>
            {myProjects.map((project) => (
              <Grid key={project.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card sx={{ height: '100%', ...paperSx, '&:hover': { boxShadow: '0 10px 30px rgba(147, 51, 234, 0.25)' } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                        {project.title}
                      </Typography>
                      <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        <MoreVert />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                      {project.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip label={project.category} size="small" sx={{ background: 'rgba(147, 51, 234, 0.2)', color: '#9333ea' }} />
                      <Chip
                        label={project.status}
                        size="small"
                        sx={{
                          background: `${getStatusColor(project.status)}22`,
                          color: getStatusColor(project.status),
                        }}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Progress
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
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
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)' }}>
                      <Typography variant="caption">{project.tasks} tasks</Typography>
                      <Typography variant="caption">{project.collaborators} collaborators</Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<Visibility />} sx={{ color: '#9333ea' }}>
                      View
                    </Button>
                    <Button size="small" startIcon={<Edit />} sx={{ color: '#ec4899' }}>
                      Edit
                    </Button>
                    <IconButton size="small" onClick={() => handleDeleteProject(project.id)} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#f44336' } }}>
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
          {myTasks.map((task) => (
            <Paper key={task.id} sx={{ ...paperSx, mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: getPriorityColor(task.priority) }} />
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>{task.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {task.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <Chip label={task.priority} size="small" sx={{ background: `${getPriorityColor(task.priority)}33`, color: getPriorityColor(task.priority) }} />
                    <Chip label={task.status} size="small" sx={{ background: 'rgba(147, 51, 234, 0.2)', color: '#9333ea' }} />
                  </Box>
                </Box>
                <Button size="small" variant="outlined" onClick={() => handleTaskStatusChange(task.id)} sx={{ borderColor: '#4caf50', color: '#4caf50' }}>
                  Toggle done
                </Button>
              </Box>
            </Paper>
          ))}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold', mb: 3 }}>
            Analytics
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, ...paperSx }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                  Project distribution
                </Typography>
                {categories.map((category) => {
                  const count = myProjects.filter((p) => p.category === category).length;
                  const pct = myProjects.length ? (count / myProjects.length) * 100 : 0;
                  return (
                    <Box key={category} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {category}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {count} ({pct.toFixed(0)}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          background: 'rgba(147, 51, 234, 0.1)',
                          '& .MuiLinearProgress-bar': { background: 'linear-gradient(45deg, #9333ea, #ec4899)', borderRadius: 3 },
                        }}
                      />
                    </Box>
                  );
                })}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, ...paperSx }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                  Task status
                </Typography>
                {[
                  ['Pending', myStats.pendingTasks, '#ff9800'],
                  ['In progress', myStats.totalTasks - myStats.completedTasks - myStats.pendingTasks, '#2196f3'],
                  ['Completed', myStats.completedTasks, '#4caf50'],
                ].map(([label, n, c]) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: c, fontWeight: 'bold' }}>
                      {n}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { ...paperSx } }}>
        <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(147, 51, 234, 0.3)' }}>Create New Project</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Project Title"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
            InputProps={{ sx: { color: '#fff' } }}
            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            multiline
            rows={3}
            sx={{ mb: 2 }}
            InputProps={{ sx: { color: '#fff' } }}
            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
          />
          <TextField
            fullWidth
            select
            label="Category"
            value={newProject.category}
            onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
            InputProps={{ sx: { color: '#fff' } }}
            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
          >
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(147, 51, 234, 0.3)' }}>
          <Button onClick={() => setCreateDialog(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Cancel
          </Button>
          <Button onClick={handleCreateProject} variant="contained" sx={{ background: 'linear-gradient(45deg, #9333ea, #ec4899)' }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ color: '#fff', background: 'linear-gradient(45deg, #4caf50, #45a049)' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyDashboard;
