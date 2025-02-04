import Head from 'next/head';
import styles from '../styles/home/home.module.scss';
import { FaGithubAlt, FaBrain, FaChartLine, FaPencilAlt, FaGraduationCap, FaRobot } from "react-icons/fa";
import { FaCircleArrowRight, FaRegClock, FaUsers } from "react-icons/fa6";
import { IoMail } from "react-icons/io5";
import Link from 'next/link';
import Image from 'next/image';
import NavBar from '../components/NavBar';
import { useEffect, useState } from 'react';
import CustomThemePicker from '../components/CustomThemePicker';
import { IoPersonCircleSharp } from "react-icons/io5";
import { IoIosArrowDropdown } from "react-icons/io";
import ActionButton from '@/components/ActionButton'; 
import OptimizedVideo from '@/components/OptimizedVideo';
import VideoCarousel from '@/components/VideoCarousel';
import { FaXTwitter } from "react-icons/fa6";

const CTAButton = ({ href, children, primary }) => (
  <Link href={href} className={`${styles.ctaButton} ${primary ? styles.primary : ''}`}>
    {children}
  </Link>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className={styles.featureCard}>
    {icon}
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const FAQSection = ({question, children}) => {

  let [collapsed, setCollapsed] = useState(true);

  return (
    <div className={styles.infoContainer}>
      <div
        onClick={() => setCollapsed(!collapsed)} 
        className={styles.infoHeader}>
        { question }

        <div 
          onClick={() => setCollapsed(!collapsed)}
          className={`${styles.collapseButton} ${collapsed ? styles.collapsed : ''}`}>
          <IoIosArrowDropdown/>
        </div>
      </div>
      <div className={`${styles.infoContent} ${collapsed ? styles.infoCollapsed : ''}`}>
        { children }
      </div>
    </div>
  )

}

export default function Home() {
  let [stats, setStats] = useState({});
  
  const getStats = async () => {
    try {
        const response = await fetch(`/api/getStats`);
        const data = await response.json();
        if(data.success) { 
            setStats(data.data);
        }
    } catch(err) {
        console.log(err);
    }
  }

  useEffect(() => {
    getStats();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>shovel journal - Smart Note-Taking & AI-Powered Study Tools</title>
        <meta name="description" content="Transform your study experience with Shovel Journal - featuring markdown notes, AI-generated flashcards, quizzes, and intelligent study tools." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />
      <CustomThemePicker />

      <div className={styles.mainContent}>
        <div className={styles.circleTop}></div>
        <div className={styles.circleBottom}></div>
        <div className={styles.circleMiddleTop}></div>
        <div className={styles.circleMiddleBottom}></div>
        <div className={styles.circleFooterTop}></div>
        <div className={styles.circleFooterBottom}></div>
        {/* Hero Section */}
        <section className={styles.hero}>

          <div className={styles.heroWrapper}>
            <div className={styles.heroContent}>
              <h1>
                Your <span className={styles.highlight}>Smart Study</span> Companion
                <br />
                From <span className={styles.italics}>Notes</span> to <span className={styles.italics}>Knowledge</span>
              </h1>
              <p className={styles.heroSubtext}>
                More than just notes - a complete study system that transforms your notes into 
                interactive learning tools with AI-powered flashcards, quizzes, and study assistance.
              </p>
              <div className={styles.ctaButtons}>
                <ActionButton text="Start Free" icon={<FaCircleArrowRight />} onClick={() => {}} />
              </div>
            </div>
            <div className={styles.heroVisual}>
              <VideoCarousel 
                videos={['deckdemo.mp4', 'notedemo.mp4', 'quizdemo.mp4']}
                maxHeight="35rem"
              />
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className={styles.features} id="features">
          <h2>Smart Study Tools</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureContent}>
                <FeatureCard 
                  icon={<FaPencilAlt />}
                  title="Advanced Note-Taking"
                  description="Rich markdown editor supporting code syntax highlighting, LaTeX math, tables, and more. Organize with folders and tags."
                />
              </div>
              <div className={styles.featureImage}>
                {/* Placeholder for screenshot */}
                <div className={styles.screenshotPlaceholder}>
                <img src="/images/screenshots/notepage.png" alt="notepage"/>
                </div>
              </div>
            </div>


            <div className={styles.featureItem}>
              <div className={styles.featureContent}>
                <FeatureCard 
                  icon={<FaBrain />}
                  title="AI Study Generation"
                  description="Transform your notes into flashcard decks and quizzes automatically. AI analyzes your content for optimal learning."
                />
              </div>
              <div className={styles.featureImage}>
                {/* Placeholder for screenshot */}
                <div className={styles.screenshotPlaceholder}>
                <img src="/images/screenshots/flashcard.png" alt="deckdemo"/>
                </div>
              </div>
            </div>


            <div className={styles.featureItem}>
              <div className={styles.featureContent}>
                <FeatureCard 
                  icon={<FaGraduationCap />}
                  title="Interactive Learning"
                  description="Study with spaced repetition flashcards and quizzes. Get AI feedback to improve understanding."
                />
              </div>
              <div className={styles.featureImage}>
                {/* Placeholder for screenshot */}
                <div className={styles.screenshotPlaceholder}>              
                  <img src="/images/screenshots/quizresult.png" alt="quizresult"/>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.comingSoon}>
          <div className={styles.featureContent}>
            <FeatureCard 
              icon={<FaRobot />}
              title="Coming Soon"
              description="AI study tutor, personalized study plans, and voice chat study partners - all powered by your notes."
            />
          </div>
        </div>

        {/* Product Demo Section */}
        <section className={styles.productDemo}>
          <div className={styles.demoContent}>
            <h2>See It In Action</h2>
            <div className={styles.demoVideo}>
              <VideoCarousel 
                videos={['deckdemo.mp4', 'notedemo.mp4', 'quizdemo.mp4']}
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className={styles.testimonials}>
          <h2>What Students Say</h2>
          <div className={styles.testimonialGrid}>
            <div className={styles.testimonialItem}>
              <div className={styles.testimonialText}>
                "The AI quiz generation is incredible. I just write my notes normally and it creates perfect study materials."
              </div>
              <div className={styles.testimonialName}>
                <IoPersonCircleSharp />
                Frida H, Computer Science Student
              </div>
            </div>
            <div className={styles.testimonialItem}>
              <div className={styles.testimonialText}>
                "Being able to write code snippets and LaTeX in my notes and have them render beautifully makes taking CS and Math notes so much better."
              </div>
              <div className={styles.testimonialName}>
                <IoPersonCircleSharp />
                Kyle B, Engineering Student
              </div>
            </div>
            {/* Add more relevant testimonials */}
          </div>
        </section>

        {/* Final CTA */}
        <section className={styles.finalCTA}>
          <h2>Ready to Transform Your Study Experience?</h2>
          <p>Join students using AI-powered tools to learn more effectively.</p>

          <div className={styles.ctaButtonOuter}>
            <ActionButton text="Start Taking Smart Notes " icon={<FaCircleArrowRight />} onClick={() => {}} />
          </div>

        </section>

        {/* Sister Site Promo */}
        <section className={styles.sisterSite}>
          <div className={styles.sisterContent}>
            <h3>Also Check Out</h3>
            <h2>Shovel Productivity</h2>
            <p>
              A productivity tool designed for ADHD minds, focused on deep work and daily structure. 
              Features daily check-ins, goal tracking, work hour monitoring, and journaling to help 
              you stay focused and accountable.
            </p>
            <div className={styles.sisterFeatures}>
              <span>Daily Check-ins</span>
              <span>Goal Tracking</span>
              <span>Work Timer</span>
              <span>Journal</span>
            </div>
            <Link href="https://ovel.sh" className={styles.sisterLink}>
              <ActionButton text="Visit Shovel Productivity" icon={<FaCircleArrowRight />} onClick={() => {}} />
            </Link>
          </div>
          <div className={styles.sisterVisual}>
            <img 
              src="/images/screenshots/screenshots.gif" 
              alt="shovel productivity" 
              className={styles.sisterImage}/>
          </div>
        </section>
      </div>


      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLinks}>
            <Link href="https://github.com/JamesAC42/shovel" target="_blank">
              <FaGithubAlt /> GitHub
            </Link>
            <Link href="mailto:ovelsh.feedback@gmail.com">
              <IoMail /> Contact
            </Link>
            <Link href="https://x.com/fifltriggi" target="_blank">
              <FaXTwitter /> Twitter
            </Link>
          </div>
          <p>shovel © 2024 ovel.sh</p>
        </div>
      </footer>
    </div>
  );
}
