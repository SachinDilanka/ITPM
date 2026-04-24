import { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Link,
    IconButton,
    Fade,
    Slide,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Facebook,
    Twitter,
    LinkedIn,
    GitHub,
    Email,
    Phone,
    LocationOn,
    School,
    Book,
    Psychology,
    Lightbulb,
    AutoAwesome,
    RocketLaunch,
} from '@mui/icons-material';
import './Footer.css';

const particleStyle = (i) => {
    const w = 2 + ((i * 7) % 5);
    const left = ((i * 41) % 100);
    const top = ((i * 53) % 100);
    const dur = 10 + ((i * 3) % 10);
    const delay = ((i * 2) % 5);
    return {
        position: 'absolute',
        width: `${w}px`,
        height: `${w}px`,
        background: 'radial-gradient(circle, #9333ea, transparent)',
        borderRadius: '50%',
        animation: `footer-float ${dur}s ease-in-out infinite`,
        left: `${left}%`,
        top: `${top}%`,
        animationDelay: `${delay}s`,
    };
};

const MarketingFooter = () => {
    const [isVisible, setIsVisible] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const particles = useMemo(() => [...Array(20)].map((_, i) => i), []);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const footerSections = [
        {
            title: 'KnowVerse',
            icon: <School />,
            items: [
                { text: 'About Us', href: '#about' },
                { text: 'Features', href: '#features' },
                { text: 'How It Works', href: '#how-it-works' },
                { text: 'FAQ', href: '#faq' },
            ],
        },
        {
            title: 'Resources',
            icon: <Book />,
            items: [
                { text: 'Documentation', href: '#docs' },
                { text: 'Tutorials', href: '#tutorials' },
                { text: 'Blog', href: '#blog' },
                { text: 'Community', href: '#community' },
            ],
        },
        {
            title: 'Learning',
            icon: <Psychology />,
            items: [
                { text: 'AI Assistant', href: '#ai' },
                { text: 'Study Groups', href: '#study-groups' },
                { text: 'Practice Tests', href: '#tests' },
                { text: 'Certifications', href: '#certifications' },
            ],
        },
        {
            title: 'Support',
            icon: <Lightbulb />,
            items: [
                { text: 'Help Center', href: '#help' },
                { text: 'Contact Us', href: '#contact' },
                { text: 'Feedback', href: '#feedback' },
                { text: 'Report Issue', href: '#report' },
            ],
        },
    ];

    const socialLinks = [
        { icon: <Facebook />, href: '#facebook', label: 'Facebook' },
        { icon: <Twitter />, href: '#twitter', label: 'Twitter' },
        { icon: <LinkedIn />, href: '#linkedin', label: 'LinkedIn' },
        { icon: <GitHub />, href: '#github', label: 'GitHub' },
    ];

    return (
        <Box
            component="footer"
            sx={{
                position: 'relative',
                background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
                borderTop: '2px solid rgba(147, 51, 234, 0.3)',
                overflow: 'hidden',
                mt: 'auto',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #9333ea, #ec4899, transparent)',
                    animation: 'gradientMove 3s ease-in-out infinite',
                },
                '@keyframes gradientMove': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    pointerEvents: 'none',
                }}
            >
                {particles.map((i) => (
                    <Box key={i} sx={particleStyle(i)} />
                ))}
            </Box>

            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ py: 6 }}>
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Fade in={isVisible} timeout={800}>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <AutoAwesome
                                            sx={{
                                                fontSize: 32,
                                                color: '#9333ea',
                                                mr: 2,
                                                animation: 'footer-pulse 2s ease-in-out infinite',
                                            }}
                                        />
                                        <Typography
                                            variant="h4"
                                            sx={{
                                                fontWeight: 'bold',
                                                background: 'linear-gradient(45deg, #9333ea, #ec4899)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                            }}
                                        >
                                            KnowVerse
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                                        Empowering learners worldwide with AI-driven knowledge sharing and collaborative
                                        learning experiences.
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {socialLinks.map((social, index) => (
                                            <Slide
                                                in={isVisible}
                                                direction="up"
                                                timeout={1000 + index * 100}
                                                key={social.label}
                                            >
                                                <IconButton
                                                    component="a"
                                                    href={social.href}
                                                    sx={{
                                                        color: 'rgba(255, 255, 255, 0.7)',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            color: '#9333ea',
                                                            transform: 'translateY(-3px)',
                                                            background: 'rgba(147, 51, 234, 0.1)',
                                                        },
                                                    }}
                                                    aria-label={social.label}
                                                >
                                                    {social.icon}
                                                </IconButton>
                                            </Slide>
                                        ))}
                                    </Box>
                                </Box>
                            </Fade>
                        </Grid>

                        {footerSections.map((section, sectionIndex) => (
                            <Grid size={{ xs: 12, sm: 6, md: 2 }} key={section.title}>
                                <Slide in={isVisible} direction="up" timeout={1200 + sectionIndex * 100}>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Box
                                                sx={{
                                                    color: '#9333ea',
                                                    mr: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {section.icon}
                                            </Box>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: '#ffffff',
                                                    fontSize: isMobile ? '1rem' : '1.1rem',
                                                }}
                                            >
                                                {section.title}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {section.items.map((item) => (
                                                <Link
                                                    key={item.text}
                                                    href={item.href}
                                                    sx={{
                                                        color: 'rgba(255, 255, 255, 0.7)',
                                                        textDecoration: 'none',
                                                        transition: 'all 0.3s ease',
                                                        fontSize: '0.9rem',
                                                        position: 'relative',
                                                        pl: 2,
                                                        '&::before': {
                                                            content: '"›"',
                                                            position: 'absolute',
                                                            left: 0,
                                                            color: '#9333ea',
                                                            transition: 'transform 0.3s ease',
                                                        },
                                                        '&:hover': {
                                                            color: '#9333ea',
                                                            transform: 'translateX(3px)',
                                                            '&::before': {
                                                                transform: 'translateX(3px)',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {item.text}
                                                </Link>
                                            ))}
                                        </Box>
                                    </Box>
                                </Slide>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                <Box
                    sx={{
                        py: 3,
                        borderTop: '1px solid rgba(147, 51, 234, 0.2)',
                        background: 'rgba(147, 51, 234, 0.05)',
                    }}
                >
                    <Grid container spacing={2} justifyContent={isMobile ? 'center' : 'space-between'}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isMobile ? 'center' : 'flex-start',
                                }}
                            >
                                <Email sx={{ color: '#9333ea', mr: 1, fontSize: 20 }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    support@knowverse.com
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Phone sx={{ color: '#9333ea', mr: 1, fontSize: 20 }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    012-3456789
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isMobile ? 'center' : 'flex-end',
                                }}
                            >
                                <LocationOn sx={{ color: '#9333ea', mr: 1, fontSize: 20 }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    Global Learning Hub
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <Box
                    sx={{
                        py: 3,
                        borderTop: '1px solid rgba(147, 51, 234, 0.2)',
                        textAlign: 'center',
                    }}
                >
                    <Fade in={isVisible} timeout={2000}>
                        <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                                © {new Date().getFullYear()} KnowVerse. All rights reserved.
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Link
                                    href="#privacy"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        textDecoration: 'none',
                                        fontSize: '0.85rem',
                                        transition: 'color 0.3s ease',
                                        '&:hover': { color: '#9333ea' },
                                    }}
                                >
                                    Privacy Policy
                                </Link>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                    •
                                </Typography>
                                <Link
                                    href="#terms"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        textDecoration: 'none',
                                        fontSize: '0.85rem',
                                        transition: 'color 0.3s ease',
                                        '&:hover': { color: '#9333ea' },
                                    }}
                                >
                                    Terms of Service
                                </Link>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                    •
                                </Typography>
                                <Link
                                    href="#cookies"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        textDecoration: 'none',
                                        fontSize: '0.85rem',
                                        transition: 'color 0.3s ease',
                                        '&:hover': { color: '#9333ea' },
                                    }}
                                >
                                    Cookie Policy
                                </Link>
                            </Box>
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <RocketLaunch
                                    sx={{
                                        fontSize: 16,
                                        color: '#ec4899',
                                        mr: 1,
                                        animation: 'footer-rocket 3s ease-in-out infinite',
                                    }}
                                />
                                <Typography
                                    variant="caption"
                                    sx={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}
                                >
                                    Powered by AI and built with passion for learning
                                </Typography>
                            </Box>
                        </Box>
                    </Fade>
                </Box>
            </Container>
        </Box>
    );
};

export default MarketingFooter;
