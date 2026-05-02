import { useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FolderKanban, ArrowRight, Layout, Users, Zap } from "lucide-react";
import styles from "./Landing.module.css";

export default function Landing() {
  const { user } = useContext(AuthContext);

  // If already logged in, redirect to dashboard
  if (user && user.token) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className={styles.landingContainer}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <FolderKanban size={28} color="var(--accent-color)" />
          <span>TaskSync</span>
        </div>
        <div className={styles.navLinks}>
          <Link to="/login">
            <button className={styles.loginBtn}>Log In</button>
          </Link>
          <Link to="/signup">
            <button className="btn-primary">Get Started</button>
          </Link>
        </div>
      </nav>

      <main className={styles.hero}>
        <div className={`${styles.heroBadge} animate-fade-in`}>
          ✨ The new standard for team productivity
        </div>
        <h1 className={`${styles.title} animate-fade-in`} style={{ animationDelay: "0.1s" }}>
          Manage your projects with <span className={styles.highlight}>clarity and focus</span>
        </h1>
        <p className={`${styles.subtitle} animate-fade-in`} style={{ animationDelay: "0.2s" }}>
          TaskSync brings your team's work together in one shared space. From Kanban boards to file sharing, keep everyone aligned and moving forward.
        </p>
        
        <div className={`${styles.ctaGroup} animate-fade-in`} style={{ animationDelay: "0.3s" }}>
          <Link to="/signup">
            <button className="btn-primary">
              Start for free <ArrowRight size={18} />
            </button>
          </Link>
          <a href="#features">
            <button className={styles.btnSecondary}>
              Explore Features
            </button>
          </a>
        </div>
      </main>

      <section id="features" className={styles.features}>
        <div className={styles.featuresGrid}>
          <div className={`glass-panel ${styles.featureCard}`}>
            <div className={styles.featureIcon}>
              <Layout size={24} />
            </div>
            <h3>Intuitive Kanban Boards</h3>
            <p>Visualize your workflow, drag and drop tasks, and track progress at a glance. Built for teams that move fast.</p>
          </div>
          <div className={`glass-panel ${styles.featureCard}`}>
            <div className={styles.featureIcon}>
              <Users size={24} />
            </div>
            <h3>Seamless Collaboration</h3>
            <p>Assign tasks, set due dates, and share files directly within tasks. Keep everyone on the same page.</p>
          </div>
          <div className={`glass-panel ${styles.featureCard}`}>
            <div className={styles.featureIcon}>
              <Zap size={24} />
            </div>
            <h3>Fast and Responsive</h3>
            <p>Experience a premium dark and light mode UI designed for speed, comfort, and maximum productivity.</p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} TaskSync. Built for modern teams.</p>
      </footer>
    </div>
  );
}
