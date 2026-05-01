import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Sidebar from "../components/Sidebar";
import styles from "./ProjectDetails.module.css";
import { Plus, Trash2, GripVertical, Paperclip, Download } from "lucide-react";

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "", priority: "Medium", tags: "", assigneeId: "" });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const fetchProjectDetails = async () => {
    try {
      const { data } = await axios.get(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProject(data.project);
      setTasks(data.tasks);
    } catch (error) {
      console.error("Failed to fetch project details");
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    if (user?.role === "ADMIN") fetchUsers();
  }, [id, user.token]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...newTask, 
        projectId: id,
        tags: newTask.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      await axios.post("/api/tasks", payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setShowModal(false);
      setNewTask({ title: "", description: "", dueDate: "", priority: "Medium", tags: "", assigneeId: "" });
      fetchProjectDetails();
    } catch (error) {
      console.error("Failed to create task");
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchProjectDetails();
    } catch (error) {
      console.error("Failed to update status");
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchProjectDetails();
    } catch (error) {
      console.error("Failed to delete task");
    }
  };

  if (!project) return <div className="app-container"><Sidebar /><main className="main-content">Loading...</main></div>;

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    
    // Optimistic UI update
    setTasks(prev => prev.map(t => 
      t._id === draggableId ? { ...t, status: newStatus } : t
    ));

    try {
      await axios.put(`/api/tasks/${draggableId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
    } catch (error) {
      console.error("Failed to update status");
      fetchProjectDetails(); // Revert on failure
    }
  };

  const handleFileUpload = async (taskId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`/api/tasks/${taskId}/submit`, formData, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      fetchProjectDetails();
    } catch (error) {
      console.error("File upload failed");
    }
  };

  const renderTaskColumn = (status, title) => {
    const columnTasks = filteredTasks.filter(t => t.status === status);
    return (
      <div className={styles.boardColumn}>
        <div className={styles.columnHeader}>
          <h3>{title}</h3>
          <span className={styles.taskCount}>{columnTasks.length}</span>
        </div>
        <Droppable droppableId={status}>
          {(provided) => (
            <div 
              className={styles.columnContent}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {columnTasks.map((task, index) => (
                <Draggable key={task._id} draggableId={task._id} index={index}>
                  {(provided) => (
                    <div 
                      className={`glass-panel ${styles.taskCard}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className={styles.taskHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div {...provided.dragHandleProps} className={styles.dragHandle}>
                            <GripVertical size={16} color="var(--text-secondary)" />
                          </div>
                          <h4>{task.title}</h4>
                        </div>
                        {user.role === "ADMIN" && (
                          <button className={styles.deleteBtn} onClick={() => deleteTask(task._id)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      
                      <div className={styles.taskBadges}>
                        <span className={`${styles.priorityBadge} ${styles[`priority${task.priority}`]}`}>
                          {task.priority}
                        </span>
                        {task.tags && task.tags.map((tag, idx) => (
                          <span key={idx} className={styles.tagBadge}>#{tag}</span>
                        ))}
                      </div>

                      {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                      
                      <div className={styles.taskFooter}>
                        <select 
                          value={task.status} 
                          onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                          className={styles.statusSelect}
                          disabled={user.role !== "ADMIN" && task.assigneeId?._id !== user._id}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                        {task.dueDate && (
                          <span className={styles.dueDate}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      <div className={styles.submissionsArea}>
                        {task.submissions && task.submissions.length > 0 && (
                          <div className={styles.submissionList}>
                            {task.submissions.map((sub, i) => (
                              <a key={i} href={`${import.meta.env.VITE_API_URL || ''}${sub.fileUrl}`} target="_blank" rel="noreferrer" className={styles.submissionLink}>
                                <Download size={14} /> {sub.fileName}
                              </a>
                            ))}
                          </div>
                        )}
                        {(user.role === "ADMIN" || task.assigneeId?._id === user._id) && (
                          <label className={styles.fileUploadLabel}>
                            <Paperclip size={14} /> Attach File
                            <input type="file" onChange={(e) => handleFileUpload(task._id, e.target.files[0])} style={{ display: 'none' }} />
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className={styles.header}>
          <div>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
          </div>
          {user?.role === "ADMIN" && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/>
              Add Task
            </button>
          )}
        </div>

        <div className={styles.filtersBar}>
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className={styles.board}>
            {renderTaskColumn("TODO", "To Do")}
            {renderTaskColumn("IN_PROGRESS", "In Progress")}
            {renderTaskColumn("DONE", "Done")}
          </div>
        </DragDropContext>

        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={`glass-panel ${styles.modal}`}>
              <h2>Create New Task</h2>
              <form onSubmit={handleCreateTask}>
                <div className={styles.inputGroup}>
                  <label>Task Title</label>
                  <input 
                    type="text" 
                    value={newTask.title} 
                    onChange={e => setNewTask({...newTask, title: e.target.value})} 
                    required 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Description</label>
                  <textarea 
                    rows="3"
                    value={newTask.description} 
                    onChange={e => setNewTask({...newTask, description: e.target.value})} 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Assignee</label>
                  <select 
                    value={newTask.assigneeId} 
                    onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.department})</option>
                    ))}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    value={newTask.dueDate} 
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})} 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Priority</label>
                  <select 
                    value={newTask.priority} 
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Tags (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="frontend, bug, urgent"
                    value={newTask.tags} 
                    onChange={e => setNewTask({...newTask, tags: e.target.value})} 
                  />
                </div>
                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setShowModal(false)} className={styles.btnCancel}>Cancel</button>
                  <button type="submit" className="btn-primary">Add Task</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
