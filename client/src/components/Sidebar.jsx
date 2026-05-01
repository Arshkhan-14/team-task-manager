import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { LayoutDashboard, FolderKanban, LogOut, UserCircle, Sun, Moon } from "lucide-react";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className={`glass-panel ${styles.sidebar}`}>
      <div className={styles.logo}>
        <FolderKanban size={28} color="var(--accent-color)" />
        <h2>TaskSync</h2>
      </div>

      <div className={styles.userInfo}>
        <UserCircle size={40} className={styles.avatar} />
        <div className={styles.userDetails}>
          <p className={styles.userName}>{user?.name}</p>
          <span className={styles.userRole}>{user?.role}</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/dashboard" className={({isActive}) => isActive ? styles.activeLink : styles.link}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/projects" className={({isActive}) => isActive ? styles.activeLink : styles.link}>
          <FolderKanban size={20} />
          <span>Projects</span>
        </NavLink>
      </nav>

      <div className={styles.bottom}>
        <button onClick={toggleTheme} className={styles.themeToggleBtn}>
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
