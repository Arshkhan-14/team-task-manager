import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import styles from "./Projects.module.css";
import { Plus } from "lucide-react";

export default function Projects() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get("/api/projects", {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user.token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/projects", newProject, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setShowModal(false);
      setNewProject({ name: "", description: "" });
      fetchProjects();
    } catch (error) {
      console.error("Failed to create project");
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className={styles.header}>
          <div>
            <h1>Projects</h1>
            <p>Manage your team projects</p>
          </div>
          {user?.role === "ADMIN" && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/>
              New Project
            </button>
          )}
        </div>

        <div className={styles.projectsGrid}>
          {projects.map(project => (
            <Link to={`/projects/${project._id}`} key={project._id} className={styles.cardLink}>
              <div className={`glass-panel ${styles.projectCard}`}>
                <h3>{project.name}</h3>
                <p className={styles.description}>{project.description || "No description provided."}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.owner}>Owner: {project.ownerId?.name}</span>
                </div>
              </div>
            </Link>
          ))}
          {projects.length === 0 && <p>No projects found.</p>}
        </div>

        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={`glass-panel ${styles.modal}`}>
              <h2>Create New Project</h2>
              <form onSubmit={handleCreate}>
                <div className={styles.inputGroup}>
                  <label>Project Name</label>
                  <input 
                    type="text" 
                    value={newProject.name} 
                    onChange={e => setNewProject({...newProject, name: e.target.value})} 
                    required 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Description</label>
                  <textarea 
                    rows="3"
                    value={newProject.description} 
                    onChange={e => setNewProject({...newProject, description: e.target.value})} 
                  />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setShowModal(false)} className={styles.btnCancel}>Cancel</button>
                  <button type="submit" className="btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
