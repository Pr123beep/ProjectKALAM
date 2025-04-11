"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView } from "framer-motion"
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
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
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
  const [isDarkMode, setIsDarkMode] = useState(false)
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 })
  const { scrollYProgress } = useScroll()
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -300])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
  const rotation = useTransform(scrollYProgress, [0, 1], [0, 10])

  const springConfig = useMemo(() => ({ stiffness: 100, damping: 30, mass: 1 }), []);
  const smoothY = useSpring(parallaxY, springConfig)
  const smoothOpacity = useSpring(opacity, springConfig)
  const smoothScale = useSpring(scale, springConfig)
  const smoothRotation = useSpring(rotation, springConfig)

  // eslint-disable-next-line no-unused-vars
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const gradientX = useMotionValue(0)
  const gradientY = useMotionValue(0)
  const gradientRotate = useMotionValue(0)

  useEffect(() => {
    const preloadImages = () => {
      console.log("site",process.env.REACT_APP_SITE_URL);
      const imageUrls = ['/Screenshot%202025-03-29%20231427.png'];
      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };
    
    preloadImages();

    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })

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

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        springConfig.stiffness = 50;
        springConfig.damping = 15;
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [springConfig]);

  // eslint-disable-next-line no-unused-vars
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

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className={`landing-container ${isDarkMode ? "dark" : ""}`}>
      <motion.div
        className="background-gradient"
        style={{
          backgroundPosition: `${gradientX.get()}% ${gradientY.get()}%`,
          transform: `rotate(${gradientRotate.get()}deg)`,
        }}
      />

      <div className="grid-pattern"></div>

      <header className="landing-header">
        <div className="header-container" style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
          <motion.div
            className="logo-container"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="branding" style={{ marginLeft: "2.5rem" }}>
              UNDIVIDED CAPITAL x SCALER
            </h1>
          </motion.div>

          {/* Mobile menu button and dark mode toggle */}
          <div className="header-actions">
            <button onClick={toggleDarkMode} className="theme-toggle" aria-label="Toggle dark mode">
              <motion.div animate={{ rotate: isDarkMode ? 180 : 0 }} transition={{ duration: 0.5, type: "spring" }}>
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
              </motion.div>
            </button>

            <motion.button
              className="cta-button primary desktop-cta"
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
                  Project Kalam
                </motion.div>

                <motion.h1
                  className="hero-title"
                  initial={{ opacity: 0 }}
                  animate={isHeroInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  Identify <span className="hero-highlight">exceptional founders</span> with data-driven insights
                </motion.h1>

                <motion.p
                  className="hero-subtitle"
                  initial={{ opacity: 0 }}
                  animate={isHeroInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.7, delay: 0.4 }}
                >
                  A comprehensive platform for sourcing and analyzing promising Indian-origin entrepreneurs globally, enabling data-driven investment decisions.
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
                    <span>Start exploring</span>
                  </motion.button>

                  <motion.a
                    className="hero-button secondary"
                    href="#features"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Learn more
                  </motion.a>
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
                  <span>Trusted by investment teams at Undivided Capital</span>
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
                        <div className="floating-card-value">2,140</div>
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
        <section className="features-section" id="features">
          <div className="container">
            <motion.div
              className="section-header text-center"
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
                Features
              </motion.div>
              <h2 className="section-title">Everything you need to identify promising founders</h2>
              <p className="section-subtitle">
                Project Kalam provides a data-driven approach to sourcing and evaluating potential founders with high entrepreneurial potential.
              </p>
            </motion.div>
            
            <div className="features-cards-grid">
              <motion.div 
                className="feature-card-modern"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 25px 50px -12px rgba(42, 157, 143, 0.25)"
                }}
              >
                <div className="feature-card-icon">
                  <motion.div 
                    className="icon-bg"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                  <DatabaseIcon className="icon" />
                </div>
                <h3 className="feature-card-title">Comprehensive Data Collection</h3>
                <p className="feature-card-description">
                  Gather data from diverse sources to create a holistic view of potential founders, including LinkedIn, GitHub, Wellfound, and more.
                </p>
                <div className="feature-card-points">
                  <div className="feature-point">
                    <div className="feature-point-marker">✓</div>
                    <span>Multiple data sources integration</span>
                  </div>
                  <div className="feature-point">
                    <div className="feature-point-marker">✓</div>
                    <span>GDPR and CCPA compliant</span>
                  </div>
                  <div className="feature-point">
                    <div className="feature-point-marker">✓</div>
                    <span>Automated data enrichment</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="feature-card-modern"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 25px 50px -12px rgba(42, 157, 143, 0.25)"
                }}
              >
                <div className="feature-card-icon">
                  <motion.div 
                    className="icon-bg"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 1
                    }}
                  />
                  <CodeIcon className="icon" />
                </div>
                <h3 className="feature-card-title">Advanced Analysis</h3>
                <p className="feature-card-description">
                  Transform raw data into actionable insights using sophisticated algorithms and machine learning models.
                </p>
                <div className="feature-card-points">
                  <div className="feature-point">
                    <div className="feature-point-marker">✓</div>
                    <span>ML-powered scoring algorithms</span>
                  </div>
                  <div className="feature-point">
                    <div className="feature-point-marker">✓</div>
                    <span>Network analysis visualization</span>
                  </div>
                  <div className="feature-point">
                    <div className="feature-point-marker">✓</div>
                    <span>Predictive founder success metrics</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="feature-card-modern"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 25px 50px -12px rgba(42, 157, 143, 0.25)"
                }}
              >
                <div className="feature-card-icon">
                  <motion.div 
                    className="icon-bg"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 2
                    }}
                  />
                  <LayersIcon className="icon" />
                </div>
                <h3 className="feature-card-title">Intuitive Interface</h3>
                <p className="feature-card-description">
                  Powerful tools to search, evaluate, and collaborate with your team on finding the best founders.
                </p>
                <div className="feature-card-points">
                  <div className="feature-point">
                    <div className="feature-point-marker">✓</div>
                    <span>Rich candidate profiles</span>
                  </div>
                  <div className="feature-point">
                    <div className="feature-point-marker">✓</div>
                    <span>Team collaboration tools</span>
                  </div>
                  <div className="feature-point">
                    <div className="feature-point-marker">✓</div>
                    <span>CRM integration capabilities</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="features-cta"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <button className="cta-button secondary" onClick={onNavigate}>
                <span>Explore All Features</span>
                <ChevronRightIcon className="icon-sm" />
              </button>
            </motion.div>
          </div>
        </section>

        <section className="features-section" id="analytics">
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
                Advanced Analytics
              </motion.div>
              <h2 className="section-title">Data-Driven Investment Decisions</h2>
              <p className="section-subtitle">
                Leverage sophisticated analytics to identify patterns and make informed investment choices
              </p>
            </motion.div>

            <div className="analytics-grid">
              <motion.div 
                className="analytics-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="analytics-card-header">
                  <DatabaseIcon className="icon" />
                  <h3>Founder Success Prediction</h3>
                </div>
                <p>Use machine learning algorithms to predict founder success based on historical performance data, educational background, and professional experience.</p>
                <div className="analytics-metrics">
                  <div className="metric">
                    <span className="metric-value">87%</span>
                    <span className="metric-label">Prediction Accuracy</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="analytics-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="analytics-card-header">
                  <GlobeIcon className="icon" />
                  <h3>Market Opportunity Analysis</h3>
                </div>
                <p>Evaluate sector growth potential and market expansion opportunities with comprehensive data visualization and trend analysis.</p>
                <div className="analytics-metrics">
                  <div className="metric">
                    <span className="metric-value">2.5x</span>
                    <span className="metric-label">ROI Improvement</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="analytics-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="analytics-card-header">
                  <LayersIcon className="icon" />
                  <h3>Portfolio Risk Assessment</h3>
                </div>
                <p>Balance your investment portfolio with data-backed risk assessment tools that analyze market volatility and founder resilience factors.</p>
                <div className="analytics-metrics">
                  <div className="metric">
                    <span className="metric-value">-32%</span>
                    <span className="metric-label">Risk Exposure</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section-cta">
          <div className="container">
            <div className="cta-card">
              <div className="cta-grid">
                <div className="cta-content">
                  <h2 className="cta-title">Ready to transform your investment sourcing?</h2>
                  <p className="cta-description">
                    Start identifying exceptional founders with data-driven insights today.
                  </p>
                  <div className="cta-buttons">
                    <button className="cta-button primary" onClick={onNavigate}>
                      Get started
                    </button>
                  </div>
                </div>
                
                <div className="features-grid-small">
                  <div className="feature-mini-card">
                    <div className="feature-mini-icon">
                      <ZapIcon className="icon-sm" />
                    </div>
                    <h4 className="feature-mini-title">Faster Decision Making</h4>
                    <p className="feature-mini-description">Reduce time-to-investment with data-driven insights</p>
                  </div>
                  
                  <div className="feature-mini-card">
                    <div className="feature-mini-icon">
                      <GlobeIcon className="icon-sm" />
                    </div>
                    <h4 className="feature-mini-title">Global Talent Pool</h4>
                    <p className="feature-mini-description">Identify Indian-origin entrepreneurs worldwide</p>
                  </div>
                  
                  <div className="feature-mini-card">
                    <div className="feature-mini-icon">
                      <ShieldIcon className="icon-sm" />
                    </div>
                    <h4 className="feature-mini-title">Secure & Compliant</h4>
                    <p className="feature-mini-description">Enterprise-grade security and privacy</p>
                  </div>
                  
                  <div className="feature-mini-card">
                    <div className="feature-mini-icon">
                      <DatabaseIcon className="icon-sm" />
                    </div>
                    <h4 className="feature-mini-title">Rich Data Insights</h4>
                    <p className="feature-mini-description">Make informed decisions with comprehensive data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <h2 className="footer-brand-name">UNDIVIDED CAPITAL x SCALER</h2>
              </div>
              <p className="footer-tagline">
                Identifying exceptional founders with data-driven insights
              </p>
              <div className="footer-social">
                <a href="https://www.linkedin.com/company/undividedcapital" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                  <span className="sr-only">LinkedIn</span>
                  <SocialIcon type="linkedin" />
                </a>
                <a href="https://github.com/Pr123beep/frontend2" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                  <span className="sr-only">GitHub</span>
                  <SocialIcon type="github" />
                </a>
              </div>
            </div>

            <div className="footer-links">
              <h3 className="footer-column-title">Connect With Us</h3>
              <ul className="footer-menu">
                <li>
                  <a href="https://www.linkedin.com/company/undividedcapital" 
                     className="footer-link"
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="https://www.scaler.com/"
                     className="footer-link"
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                    Scaler
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="footer-links">
              <h3 className="footer-column-title">Resources</h3>
              <ul className="footer-menu">
                <li>
                  <a href="#features" 
                     className="footer-link"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a href="#analytics"
                     className="footer-link"
                  >
                    Analytics
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-links">
              <h3 className="footer-column-title">Our Approach</h3>
              <ul className="footer-menu">
                <li>
                  <span className="footer-badge">Data-Driven</span>
                </li>
                <li>
                  <span className="footer-badge">AI-Powered</span>
                </li>
                <li>
                  <span className="footer-badge">Founder-Focused</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-divider"></div>

          <div className="footer-bottom">
            <p className="copyright">&copy; {new Date().getFullYear()} Undivided Capital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
