import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Paper,
  Fab,
  Chip,
  Avatar,
} from '@mui/material';
import { BookOpen, Users, TrendingUp, Brain, Sparkles, ArrowRight, Star, Zap, Target, Share2, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const Home = () => {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [stats, setStats] = useState([
    { label: 'Questions Asked', value: '...' },
    { label: 'Answers Provided', value: '...' },
    { label: 'Active Users', value: '...' },
    { label: 'Topics Covered', value: '...' }
  ]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Track mouse movement for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    const handleScroll = () => setScrollY(window.scrollY);
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fetch real statistics data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/statistics');
        if (response.ok) {
          const data = await response.json();
          setStats([
            { label: 'Questions Asked', value: data.questionsAsked.toLocaleString() },
            { label: 'Answers Provided', value: data.answersProvided.toLocaleString() },
            { label: 'Active Users', value: data.activeUsers.toLocaleString() },
            { label: 'Topics Covered', value: data.topicsCovered.toLocaleString() }
          ]);
        } else {
          console.error('Failed to fetch statistics');
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Advanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 20,
        mass: 1,
      },
    },
  };

  const heroVariants = {
    hidden: { scale: 0.5, opacity: 0, rotate: -5 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 1.2,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const glowVariants = {
    initial: { boxShadow: "0 0 0 rgba(147, 51, 234, 0)" },
    animate: {
      boxShadow: [
        "0 0 20px rgba(147, 51, 234, 0.3)",
        "0 0 40px rgba(147, 51, 234, 0.6)",
        "0 0 60px rgba(147, 51, 234, 0.3)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const cardVariants = {
    hidden: { y: 100, opacity: 0, rotateY: 45 },
    visible: {
      y: 0,
      opacity: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 25,
        duration: 0.8,
      },
    },
    hover: {
      y: -20,
      scale: 1.08,
      rotateY: 5,
      boxShadow: "0 25px 50px rgba(147, 51, 234, 0.4)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  const particleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const features = [
    {
      icon: <BookOpen size={40} color="#9333ea" />,
      title: 'Public Q&A System',
      description: 'Ask questions, get answers from peers, build a knowledge base',
      action: () => navigate('/questions'),
      badge: 'Popular',
      color: '#9333ea'
    },
    {
      icon: <Target size={40} color="#ec4899" />,
      title: 'Interactive MCQ Polls',
      description: 'Create and participate in academic polls for exam preparation',
      action: () => navigate('/polls'),
      badge: 'New',
      color: '#ec4899'
    },
    {
      icon: <Users size={40} color="#3b82f6" />,
      title: 'Smart Tagging System',
      description: 'Organize content by subjects, semesters, and modules',
      action: () => navigate('/questions'),
      badge: 'Smart',
      color: '#3b82f6'
    },
    {
      icon: <Zap size={40} color="#f59e0b" />,
      title: 'AI Answer Highlighting',
      description: 'Get AI-powered insights on the best answers',
      action: () => navigate('/questions'),
      badge: 'AI-Powered',
      color: '#f59e0b'
    },
    {
      icon: <Share2 size={40} color="#10b981" />,
      title: 'Note Sharing',
      description: 'Share and access study notes from peers across different subjects',
      action: () => navigate('/browse-notes'),
      badge: 'Collaborative',
      color: '#10b981'
    },
    {
      icon: <MessageSquare size={40} color="#ef4444" />,
      title: 'Rating and Feedbacks',
      description: 'Rate content and provide feedback to improve the learning experience',
      action: () => navigate('/questions'),
      badge: 'Interactive',
      color: '#ef4444'
    }
  ];

  return (
    <Box sx={{ 
      position: 'relative', 
      overflow: 'hidden', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
    }}>
      {/* Animated Background Particles */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            variants={particleVariants}
            initial="hidden"
            animate="visible"
            style={{
              position: 'absolute',
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              borderRadius: '50%',
              background: `rgba(147, 51, 234, ${Math.random() * 0.5 + 0.2})`,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            whileInView={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, Math.random() * 2 + 0.5, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Enhanced Hero Section */}
        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <Box textAlign="center" mb={8} sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Floating Icons */}
            <Box sx={{ position: 'relative', height: '100px', mb: 4 }}>
              <motion.div
                variants={floatingVariants}
                initial="initial"
                animate="animate"
                style={{ position: 'absolute', left: '10%', top: '50%' }}
              >
                <BookOpen size={30} color="#9333ea" opacity={0.6} />
              </motion.div>
              <motion.div
                variants={floatingVariants}
                initial="initial"
                animate="animate"
                style={{ position: 'absolute', right: '15%', top: '30%' }}
                transition={{ delay: 0.5 }}
              >
                <Brain size={25} color="#ec4899" opacity={0.6} />
              </motion.div>
              <motion.div
                variants={floatingVariants}
                initial="initial"
                animate="animate"
                style={{ position: 'absolute', left: '20%', top: '20%' }}
                transition={{ delay: 1 }}
              >
                <Users size={28} color="#3b82f6" opacity={0.6} />
              </motion.div>
              <motion.div
                variants={floatingVariants}
                initial="initial"
                animate="animate"
                style={{ position: 'absolute', right: '25%', top: '60%' }}
                transition={{ delay: 1.5 }}
              >
                <Target size={26} color="#f59e0b" opacity={0.6} />
              </motion.div>
            </Box>

            {/* Animated Title with Glow Effect */}
            <motion.div
              variants={glowVariants}
              initial="initial"
              animate="animate"
            >
              <motion.div
                animate={{
                  background: [
                    "linear-gradient(45deg, #9333ea, #ec4899, #3b82f6)",
                    "linear-gradient(45deg, #3b82f6, #9333ea, #ec4899)",
                    "linear-gradient(45deg, #ec4899, #3b82f6, #9333ea)",
                    "linear-gradient(45deg, #9333ea, #ec4899, #3b82f6)",
                  ],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  background: {
                    duration: 6,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "reverse"
                  }
                }}
              >
                <Typography variant="h2" component="h1" gutterBottom sx={{ 
                  fontWeight: 'bold', 
                  color: '#ffffff',
                  display: 'inline-block',
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  textShadow: '0 0 40px rgba(147, 51, 234, 0.8), 0 0 60px rgba(236, 72, 153, 0.6)',
                  filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.4))'
                }}>
                  Welcome to KnowVerse
                </Typography>
              </motion.div>
            </motion.div>

            {/* Interactive Subtitle */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
            >
              <Typography variant="h5" color="rgba(255, 255, 255, 0.9)" paragraph sx={{ mb: 4 }}>
                Your Academic Community for Learning and Collaboration
              </Typography>
              
              {/* Animated Tags */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                {['🚀 Fast Learning', '🎯 Goal Oriented', '🤝 Collaborative', '🧠 AI Enhanced'].map((tag, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Chip 
                      label={tag} 
                      variant="outlined" 
                      size="small"
                      sx={{ 
                        borderColor: 'rgba(147, 51, 234, 0.5)',
                        color: '#9333ea',
                        '&:hover': {
                          backgroundColor: 'rgba(147, 51, 234, 0.1)',
                          borderColor: '#9333ea'
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            </motion.div>

            {/* Enhanced Interactive Buttons */}
            <Box mt={4} sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/browse-notes')}
                  endIcon={<ArrowRight size={20} />}
                  sx={{ 
                    px: 5, 
                    py: 2,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #7c3aed, #db2777)',
                      boxShadow: '0 10px 30px rgba(147, 51, 234, 0.4)'
                    }
                  }}
                >
                  Browse Notes
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/questions')}
                  endIcon={<Sparkles size={20} />}
                  sx={{ 
                    px: 5, 
                    py: 2,
                    fontSize: '1.1rem',
                    borderColor: 'rgba(147, 51, 234, 0.5)',
                    color: '#9333ea',
                    '&:hover': {
                      borderColor: '#9333ea',
                      background: 'rgba(147, 51, 234, 0.1)',
                      boxShadow: '0 10px 30px rgba(147, 51, 234, 0.2)'
                    }
                  }}
                >
                  Explore Questions
                </Button>
              </motion.div>
            </Box>
          </Box>
        </motion.div>

      {/* Enhanced Stats Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
      >
        <Box mb={8}>
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Typography variant="h4" component="h2" gutterBottom textAlign="center" mb={6} sx={{ color: 'rgba(255, 255, 255, 0.95)' }}>
              Platform Statistics
            </Typography>
          </motion.div>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    scale: 1.1,
                    rotateY: 10,
                    boxShadow: "0 20px 40px rgba(147, 51, 234, 0.5)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Paper sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                    border: '2px solid rgba(147, 51, 234, 0.3)',
                    cursor: 'pointer',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <motion.div
                      animate={{
                        scale: [1, 1.15, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: index * 0.3,
                        ease: "easeInOut"
                      }}
                    >
                      <Typography variant="h3" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {statsLoading ? '...' : stat.value}
                      </Typography>
                    </motion.div>
                    <Typography variant="body1" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                      {stat.label}
                    </Typography>
                    
                    {/* Animated Badge */}
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                      }}
                    />
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>

      {/* Enhanced Features Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.8 }}
      >
        <Box mb={8}>
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Typography variant="h4" component="h2" gutterBottom textAlign="center" mb={6} sx={{ color: 'rgba(255, 255, 255, 0.95)' }}>
              Discover Amazing Features
            </Typography>
          </motion.div>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  onHoverStart={() => setHoveredFeature(index)}
                  onHoverEnd={() => setHoveredFeature(null)}
                  transition={{ delay: index * 0.15 }}
                >
                  <Card sx={{ 
                    height: '280px', 
                    width: '100%',
                    display: 'flex', 
                    flexDirection: 'column',
                    background: hoveredFeature === index 
                      ? 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)' 
                      : 'linear-gradient(145deg, #0f3460 0%, #16213e 100%)',
                    border: hoveredFeature === index 
                      ? `2px solid ${feature.color}` 
                      : '1px solid rgba(147, 51, 234, 0.3)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Animated Background Pattern */}
                    <motion.div
                      animate={{
                        background: [
                          `radial-gradient(circle at 20% 50%, ${feature.color}20 0%, transparent 50%)`,
                          `radial-gradient(circle at 80% 50%, ${feature.color}20 0%, transparent 50%)`,
                          `radial-gradient(circle at 20% 50%, ${feature.color}20 0%, transparent 50%)`,
                        ],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: hoveredFeature === index ? 1 : 0.3,
                      }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                      {/* Badge */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                      >
                        <Chip 
                          label={feature.badge} 
                          size="small"
                          sx={{ 
                            mb: 2,
                            background: `linear-gradient(45deg, ${feature.color}, ${feature.color}dd)`,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                          }}
                        />
                      </motion.div>
                      
                      {/* Animated Icon */}
                      <motion.div
                        animate={{
                          rotate: hoveredFeature === index ? [0, 10, -10, 0] : [0, 5, -5, 0],
                          scale: hoveredFeature === index ? 1.2 : 1,
                        }}
                        transition={{
                          duration: hoveredFeature === index ? 0.5 : 4,
                          repeat: hoveredFeature === index ? 0 : Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Box mb={3} sx={{ color: feature.color }}>
                          {feature.icon}
                        </Box>
                      </motion.div>
                      
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: feature.color }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="rgba(255, 255, 255, 0.8)" paragraph sx={{ mb: 3 }}>
                        {feature.description}
                      </Typography>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="contained"
                          onClick={feature.action}
                          endIcon={<ArrowRight size={16} />}
                          sx={{ 
                            background: `linear-gradient(45deg, ${feature.color}, ${feature.color}dd)`,
                            '&:hover': {
                              background: `linear-gradient(45deg, ${feature.color}dd, ${feature.color})`,
                              boxShadow: `0 10px 25px ${feature.color}40`
                            }
                          }}
                        >
                          Get Started
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>
    </Container>
  </Box>
  );
};

export default Home;
