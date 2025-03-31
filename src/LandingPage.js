"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView, AnimatePresence } from "framer-motion"
import "./LandingPage.css"

// eslint-disable-next-line no-unused-vars
import { copyData } from './copyData'

// Icon components
const ChevronRightIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
)

const ArrowRightIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
)

const ZapIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
)

const ShieldIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
)

const GlobeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
)

const DatabaseIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
)

const UsersIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
)

const CodeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
)

const LayersIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
)

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
      clipRule="evenodd"
    />
  </svg>
)

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
)

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const SocialIcon = ({ type }) => {
  switch (type) {
    case "twitter":
      return (
        <svg
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M23.953 4.569c-.885.39-1.83.654-2.825.775 
                  1.014-.611 1.794-1.574 2.163-2.723-.949.555-2.005.959-3.127 1.184
                  -.897-.959-2.178-1.555-3.594-1.555-2.72 0-4.924 2.204-4.924 4.917 0 
                  .39.045.765.127 1.124-4.09-.205-7.72-2.165-10.148-5.144-.424.722
                  -.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566
                  -.248-2.228-.616v.06c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171
                  -1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.6 3.415
                  -1.68 1.318-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067
                  2.189 1.397 4.768 2.21 7.548 2.21 9.142 0 14.307-7.721 
                  13.995-14.646.962-.695 1.8-1.562 2.462-2.549z" />
        </svg>
      )
    case "linkedin":
      return (
        <svg
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 
                  2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0
                  -2.761-2.239-5-5-5zm-11 19h-2v-10h2v10zm-1
                  -11.268c-.69 0-1.25-.562-1.25-1.25s.56
                  -1.25 1.25-1.25 1.25.562 1.25 1.25
                  -.56 1.25-1.25 1.25zm12 11.268h-2v-5.399c0
                  -1.285-.025-2.938-1.793-2.938-1.795 0-2.068
                  1.403-2.068 2.851v5.486h-2v-10h1.922v1.367h.028c.268
                  -.507.922-1.041 1.899-1.041 2.029 0 2.403 1.335
                  2.403 3.069v6.605z" />
        </svg>
      )
    case "facebook":
      return (
        <svg
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M22.675 0h-21.35c-.733 
                  0-1.325.592-1.325 1.325v21.351c0
                  .733.592 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.672
                  c0-3.1 1.894-4.788 4.659-4.788 1.325
                  0 2.464.099 2.795.143v3.24h-1.918c-1.504 
                  0-1.796.715-1.796 1.763v2.313h3.587l
                  -.467 3.622h-3.12v9.293h6.116c.73 
                  0 1.324-.592 1.324-1.324v-21.35c0-.733
                  -.594-1.325-1.325-1.325z" />
        </svg>
      )
    case "github":
    default:
      return (
        <svg
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 
               12.017c0 4.425 2.865 8.18 6.839 
               9.504.5.092.682-.217.682-.483 
               0-.237-.008-.868-.013-1.703-2.782.605
               -3.369-1.343-3.369-1.343-.454-1.158
               -1.11-1.466-1.11-1.466-.908-.62.069
               -.608.069-.608 1.003.07 1.531 1.032
               1.531 1.032.892 1.53 2.341 1.088
               2.91.832.092-.647.35-1.088.636
               -1.338-2.22-.253-4.555-1.113
               -4.555-4.951 0-1.093.39-1.988
               1.029-2.688-.103-.253-.446-1.272.098
               -2.65 0 0 .84-.27 2.75 1.026A9.564
               9.564 0 0112 6.844c.85.004 1.705.115
               2.504.337 1.909-1.296 2.747-1.027
               2.747-1.027.546 1.379.202 2.398.1
               2.651.64.7 1.028 1.595 1.028 
               2.688 0 3.848-2.339 4.695-4.566
               4.943.359.309.678.92.678 1.855
               0 1.338-.012 2.419-.012 2.747
               0 .268.18.58.688.482A10.019 
               10.019 0 0022 12.017C22 6.484 
               17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      )
  }
}

function LandingPage({ onNavigate }) {
  // eslint-disable-next-line no-unused-vars
  const [scrollY, setScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [testimonials, setTestimonials] = useState([])
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 })
  const { scrollYProgress } = useScroll()
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -300])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
  const rotation = useTransform(scrollYProgress, [0, 1], [0, 10])

  // Smooth spring animations
  const springConfig = useMemo(() => ({ stiffness: 100, damping: 30, mass: 1 }), []);
  const smoothY = useSpring(parallaxY, springConfig)
  const smoothOpacity = useSpring(opacity, springConfig)
  const smoothScale = useSpring(scale, springConfig)
  const smoothRotation = useSpring(rotation, springConfig)

  // Mouse parallax effect
  // eslint-disable-next-line no-unused-vars
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Gradient animation values
  const gradientX = useMotionValue(0)
  const gradientY = useMotionValue(0)
  const gradientRotate = useMotionValue(0)

  useEffect(() => {
    // Optimize image loading
    const preloadImages = () => {
      const imageUrls = ['/Screenshot%202025-03-29%20231427.png'];
      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };
    
    preloadImages();

    // Instead of random selection, we'll use fixed testimonials
    const fixedTestimonials = [
      {
        name: "Alex Chen",
        role: "Founder & CEO, NeuralSphere",
        image: "https://via.placeholder.com/100",
        content: "Building NeuralSphere from the ground up required more than just technical expertise—it demanded vision and strategic partnerships. This platform connected us with investors who truly understood our AI infrastructure goals and helped us scale operations across three continents in just 18 months."
      },
      {
        name: "Sophia Rodriguez",
        role: "Co-founder, BioGenesis Healthcare",
        image: "https://via.placeholder.com/100",
        content: "After developing our breakthrough therapy, we faced the challenge of scaling production while navigating complex regulatory environments. The mentorship and capital resources we accessed through this network proved invaluable—we've since secured approval in 7 countries and helped over 50,000 patients."
      },
      {
        name: "Marcus Johnson",
        role: "Founder, Quantum Finance Solutions",
        image: "https://via.placeholder.com/100",
        content: "When we set out to democratize enterprise-grade financial tools for small businesses, we knew we needed partners who shared our vision. Through connections made here, we secured not just funding but strategic guidance that helped us grow our customer base from 200 to over 15,000 businesses in just two years."
      }
    ];
    
    setTestimonials(fixedTestimonials);

    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Debounce mousemove for better performance
    let timeoutId;
    const handleMouseMove = (e) => {
      if (timeoutId) {
        cancelAnimationFrame(timeoutId);
      }
      
      timeoutId = requestAnimationFrame(() => {
        const { clientX, clientY } = e
        const x = clientX / window.innerWidth
        const y = clientY / window.innerHeight
        setMousePosition({ x, y })
        mouseX.set(x * 100 - 50)
        mouseY.set(y * 100 - 50)
        gradientX.set(x * 100)
        gradientY.set(y * 100)
        gradientRotate.set(x * 360)
      });
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("mousemove", handleMouseMove)
      if (timeoutId) {
        cancelAnimationFrame(timeoutId);
      }
    }
  }, [mouseX, mouseY, gradientX, gradientY, gradientRotate])

  // Reduce animation complexity for mobile devices
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      
      // Reduce animation complexity on mobile
      if (isMobile) {
        // Simpler spring config for mobile
        springConfig.stiffness = 50;
        springConfig.damping = 15;
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [springConfig]);

  // Feature tabs data
  const features = [
    {
      title: "Innovative Scaling",
      description: "Our proprietary scaling methodology helps businesses grow 3x faster than traditional methods.",
      icon: <ZapIcon className="h-6 w-6" />,
    },
    {
      title: "Secure Investments",
      description: "Bank-level security protocols protect every transaction and investment in our platform.",
      icon: <ShieldIcon className="h-6 w-6" />,
    },
    {
      title: "Global Network",
      description: "Access our worldwide network of investors, mentors, and industry experts.",
      icon: <GlobeIcon className="h-6 w-6" />,
    },
    {
      title: "Advanced Analytics",
      description: "AI-powered insights help you make data-driven decisions for optimal growth.",
      icon: <DatabaseIcon className="h-6 w-6" />,
    },
  ]

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [features.length])

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className={`landing-container ${isDarkMode ? "dark" : ""}`}>
      {/* Animated background gradient */}
      <motion.div
        className="background-gradient"
        style={{
          backgroundPosition: `${gradientX.get()}% ${gradientY.get()}%`,
          transform: `rotate(${gradientRotate.get()}deg)`,
        }}
      />

      {/* Animated grid pattern */}
      <div className="grid-pattern"></div>

      {/* Header */}
      <header className="landing-header">
        <div className="header-container">
          <motion.div
            className="logo-container"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="logo-wrapper">
              <motion.div
                className="logo-glow"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 10,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
              <div className="logo-icon">
                <LayersIcon className="icon" />
              </div>
            </div>
            <h1 className="branding">
UNDIVIDED CAPITAL&nbsp;&lt;&gt;&nbsp;Scaler
</h1>

          </motion.div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {["Features", "Solutions", "About", "Contact"].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="nav-link"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                {item}
                <motion.span className="nav-link-underline" />
              </motion.a>
            ))}
          </nav>

          {/* Mobile menu button and dark mode toggle */}
          <div className="header-actions">
            <button onClick={toggleDarkMode} className="theme-toggle" aria-label="Toggle dark mode">
              <motion.div animate={{ rotate: isDarkMode ? 180 : 0 }} transition={{ duration: 0.5, type: "spring" }}>
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
              </motion.div>
            </button>

            <motion.button
              className="mobile-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div animate={{ rotate: isMenuOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </motion.div>
            </motion.button>

            <motion.button
              className="cta-button desktop-cta"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNavigate}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span>Get Started</span>
              <ChevronRightIcon className="icon-sm" />
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mobile-nav-container">
                {["Features", "Solutions", "About", "Contact"].map((item, i) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="mobile-nav-link"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </motion.a>
                ))}
                <motion.button
                  className="cta-button mobile-cta"
                  whileTap={{ scale: 0.98 }}
                  onClick={onNavigate}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <span>Get Started</span>
                  <ChevronRightIcon className="icon-sm" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="landing-main">
        {/* Hero Section */}
        <section ref={heroRef} className="hero-section">
          <motion.div
            className="hero-background"
            style={{
              y: smoothY,
              opacity: smoothOpacity,
              scale: smoothScale,
              rotateZ: smoothRotation,
            }}
          >
            <div className="hero-gradient"></div>
            <div className="hero-blob"></div>
          </motion.div>

          <div className="container">
            <div className="hero-grid">
              <motion.div
                className="hero-content"
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <motion.div
                  className="hero-badge"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5 }}
                >
                  Revolutionizing Capital Scaling
                </motion.div>

                <motion.h1
                  className="hero-title"
                  initial={{ opacity: 0 }}
                  animate={isHeroInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  Scaling Capital for{" "}
                  <motion.span
                    className="hero-highlight"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    Maximum Growth
                  </motion.span>
                </motion.h1>

                <motion.p
                  className="hero-subtitle"
                  initial={{ opacity: 0 }}
                  animate={isHeroInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.7, delay: 0.4 }}
                >
                  Innovative financial solutions to help businesses scale efficiently and sustainably in today's dynamic
                  market.
                </motion.p>

                <motion.div
                  className="hero-buttons"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.5 }}
                >
                  <motion.button
                    className="hero-button primary"
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 20px 25px -5px rgba(42, 157, 143, 0.2), 0 8px 10px -6px rgba(42, 157, 143, 0.2)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onNavigate}
                  >
                    <span>Start Investing</span>
                    <ArrowRightIcon className="icon-sm" />
                  </motion.button>

                  <motion.button
                    className="hero-button secondary"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Learn More
                  </motion.button>
                </motion.div>

                <motion.div
                  className="hero-trust"
                  initial={{ opacity: 0 }}
                  animate={isHeroInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.7, delay: 0.6 }}
                >
                  <div className="trust-avatars">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="trust-avatar">
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <span>Trusted by 10,000+ businesses</span>
                </motion.div>
              </motion.div>

              <motion.div
                className="hero-image-container"
                style={{
                  x: useTransform(mouseX, [-50, 50], [-10, 10]),
                  y: useTransform(mouseY, [-50, 50], [-10, 10]),
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <div className="hero-image-wrapper">
                  <div className="hero-image">
                    <img
                      src="/Screenshot%202025-03-29%20231427.png"
                      alt="Financial Growth Dashboard"
                      className="dashboard-image"
                      width="600"
                      height="400"
                      loading="eager"
                    />
                  </div>

                  {/* Floating elements */}
                  <motion.div
                    className="floating-card top-right"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                  >
                    <div className="floating-card-content">
                      <div className="floating-card-icon growth">
                        <ZapIcon className="icon-sm" />
                      </div>
                      <div>
                        <div className="floating-card-label">Growth Rate</div>
                        <div className="floating-card-value">+27.4%</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="floating-card bottom-left"
                    animate={{
                      y: [0, 10, 0],
                    }}
                    transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 1 }}
                  >
                    <div className="floating-card-content">
                      <div className="floating-card-icon investors">
                        <UsersIcon className="icon-sm" />
                      </div>
                      <div>
                        <div className="floating-card-label">New Investors</div>
                        <div className="floating-card-value">1,240</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Background decorative elements */}
                <div className="hero-image-bg">
                  <motion.div
                    className="bg-blob primary"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                  />
                  <motion.div
                    className="bg-blob secondary"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 2 }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="container">
            <motion.div
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                className="section-badge"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Our Capabilities
              </motion.div>
              <h2 className="section-title">Advanced Capital Scaling Features</h2>
              <p className="section-subtitle">
                Our platform provides cutting-edge tools and methodologies to help your business scale efficiently and
                sustainably.
              </p>
            </motion.div>

            <div className="features-grid">
              <motion.div
                className="features-tabs"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7 }}
              >
                <div className="features-tabs-list">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className={`feature-tab ${activeFeature === index ? "active" : ""}`}
                      onClick={() => setActiveFeature(index)}
                      whileHover={{ x: 5 }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className={`feature-tab-icon ${activeFeature === index ? "active" : ""}`}>
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="feature-tab-title">{feature.title}</h3>
                        <p className="feature-tab-description">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="features-display"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    className="feature-content"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    {activeFeature === 0 && (
                      <div className="feature-card growth-metrics">
                        <div className="feature-card-header">
                          <h4>Growth Metrics</h4>
                          <div className="feature-card-meta">Last 30 days</div>
                        </div>
                        <div className="feature-card-body">
                          {[
                            { label: "Revenue Growth", value: "142%", color: "primary" },
                            { label: "Customer Acquisition", value: "87%", color: "secondary" },
                            { label: "Market Expansion", value: "53%", color: "success" },
                          ].map((item, i) => (
                            <div key={i} className="metric-item">
                              <div className="metric-header">
                                <span>{item.label}</span>
                                <span className="metric-value">{item.value}</span>
                              </div>
                              <div className="metric-bar">
                                <motion.div
                                  className={`metric-progress ${item.color}`}
                                  initial={{ width: "0%" }}
                                  animate={{ width: item.value }}
                                  transition={{ duration: 1, delay: 0.2 + i * 0.2 }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeFeature === 1 && (
                      <div className="feature-card security">
                        <div className="feature-card-header with-icon">
                          <ShieldIcon className="icon" />
                          <h4>Security Dashboard</h4>
                        </div>
                        <div className="security-grid">
                          {[
                            { label: "Threat Protection", value: "Active" },
                            { label: "Encryption", value: "256-bit" },
                            { label: "Last Scan", value: "2 min ago" },
                            { label: "Vulnerabilities", value: "0" },
                          ].map((item, i) => (
                            <div key={i} className="security-item">
                              <div className="security-label">{item.label}</div>
                              <div className="security-value">{item.value}</div>
                            </div>
                          ))}
                        </div>
                        <div className="feature-card-footer">
                          <div className="status-indicator">
                            <div className="status-dot active"></div>
                            <span>All systems secure</span>
                          </div>
                          <button className="text-link">View details</button>
                        </div>
                      </div>
                    )}

                    {activeFeature === 2 && (
                      <div className="feature-card network">
                        <div className="feature-card-header">
                          <h4>Global Network</h4>
                          <div className="network-badge">24 Countries</div>
                        </div>
                        <div className="network-map">
                          <div className="map-overlay">
                            <img src="https://via.placeholder.com/400x300" alt="World map" className="map-image" />
                          </div>
                          {[
                            { x: "20%", y: "30%", pulse: true },
                            { x: "70%", y: "20%", pulse: false },
                            { x: "80%", y: "60%", pulse: true },
                            { x: "30%", y: "70%", pulse: false },
                            { x: "50%", y: "40%", pulse: true },
                          ].map((point, i) => (
                            <div key={i} className="network-point" style={{ left: point.x, top: point.y }}>
                              {point.pulse && <div className="network-pulse"></div>}
                            </div>
                          ))}
                        </div>
                        <div className="feature-card-footer">
                          <div>
                            Active connections: <span className="highlight">1,240</span>
                          </div>
                          <button className="text-link">Explore network</button>
                        </div>
                      </div>
                    )}

                    {activeFeature === 3 && (
                      <div className="feature-card analytics">
                        <div className="feature-card-header with-icon">
                          <DatabaseIcon className="icon" />
                          <h4>Analytics Dashboard</h4>
                        </div>
                        <div className="analytics-content">
                          <div className="analytics-header">
                            <span>Investment Performance</span>
                            <span className="analytics-value positive">+24.8%</span>
                          </div>
                          <div className="analytics-chart">
                            {[35, 45, 30, 50, 65, 45, 70, 85, 75, 90].map((height, i) => (
                              <motion.div
                                key={i}
                                className="chart-bar"
                                initial={{ height: "0%" }}
                                animate={{ height: `${height}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05 }}
                              >
                                <div className="chart-bar-fill"></div>
                              </motion.div>
                            ))}
                          </div>
                          <div className="feature-card-footer">
                            <button className="text-link">View full report</button>
                            <div className="status-indicator">
                              <div className="status-dot active"></div>
                              <span>AI predictions enabled</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <div className="container">
            <motion.div
              className="section-header"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                className="section-badge secondary"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Success Stories
              </motion.div>
              <h2 className="section-title">Trusted by Industry Leaders</h2>
              <p className="section-subtitle">
                See how businesses have transformed their growth trajectory with our capital scaling solutions.
              </p>
            </motion.div>

            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="testimonial-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="testimonial-quote">"</div>
                  <div className="testimonial-content">
                    <p>{testimonial.content}</p>
                  </div>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        loading="lazy" 
                        width="100" 
                        height="100"
                      />
                    </div>
                    <div className="author-info">
                      <h4>{testimonial.name}</h4>
                      <p>{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="section-cta"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <button className="cta-button primary" onClick={onNavigate}>
                <span>View All Case Studies</span>
                <ArrowRightIcon className="icon-sm" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <motion.div
              className="cta-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <div className="cta-grid">
                <div className="cta-content">
                  <motion.h2
                    className="cta-title"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    Ready to accelerate your business growth?
                  </motion.h2>
                  <motion.p
                    className="cta-description"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    Join thousands of businesses that have transformed their growth trajectory with our capital scaling
                    solutions.
                  </motion.p>
                  <motion.div
                    className="cta-buttons"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <button className="cta-button primary" onClick={onNavigate}>
                      <span>Get Started Today</span>
                      <ArrowRightIcon className="icon-sm" />
                    </button>

                    <button className="cta-button secondary">Schedule a Demo</button>
                  </motion.div>
                </div>

                <motion.div
                  className="cta-features"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <div className="features-grid-small">
                    {[
                      {
                        icon: <ZapIcon className="icon-sm" />,
                        title: "Fast Implementation",
                        description: "Get started in days, not months",
                      },
                      {
                        icon: <ShieldIcon className="icon-sm" />,
                        title: "Secure Platform",
                        description: "Enterprise-grade security protocols",
                      },
                      {
                        icon: <GlobeIcon className="icon-sm" />,
                        title: "Global Support",
                        description: "24/7 assistance in multiple languages",
                      },
                      {
                        icon: <CodeIcon className="icon-sm" />,
                        title: "API Integration",
                        description: "Seamless connection with your systems",
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="feature-mini-card"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      >
                        <div className="feature-mini-icon">{item.icon}</div>
                        <h4 className="feature-mini-title">{item.title}</h4>
                        <p className="feature-mini-description">{item.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-wrapper small">
                  <div className="logo-icon small">
                    <LayersIcon className="icon-sm" />
                  </div>
                </div>
                <h2 className="footer-brand-name">UNDIVIDED CAPITAL</h2>
              </div>
              <p className="footer-tagline">
                Innovative financial solutions to help businesses scale efficiently and sustainably.
              </p>
              <div className="footer-social">
              {["twitter", "linkedin", "facebook", "github"].map((social) => (
    <a key={social} href={`#${social}`} className="social-link" aria-label={`${social} link`}>
      <span className="sr-only">{social}</span>
      <SocialIcon type={social} />
    </a>
  ))}

              </div>
            </div>

            {[
              {
                title: "Product",
                links: ["Features", "Solutions", "Pricing", "Case Studies", "Documentation"],
              },
              {
                title: "Company",
                links: ["About", "Team", "Careers", "Press", "News"],
              },
              {
                title: "Resources",
                links: ["Blog", "Newsletter", "Events", "Help Center", "Tutorials"],
              },
            ].map((column, i) => (
              <div key={i} className="footer-links">
                <h3 className="footer-column-title">{column.title}</h3>
                <ul className="footer-menu">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href={`#${link.toLowerCase()}`} className="footer-link">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="footer-bottom">
            <p className="copyright">&copy; {new Date().getFullYear()} Undivided Capital. All rights reserved.</p>
            <div className="legal-links">
              <a href="#privacy" className="legal-link">
                Privacy Policy
              </a>
              <a href="#terms" className="legal-link">
                Terms of Service
              </a>
              <a href="#cookies" className="legal-link">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

