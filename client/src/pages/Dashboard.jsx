import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Sidebar from "../components/Sidebar";
import styles from "./Dashboard.module.css";
import { CheckCircle2, CircleDashed, Clock, ListTodo } from "lucide-react";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await axios.get("/api/tasks", {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user.token]);

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "TODO").length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    done: tasks.filter(t => t.status === "DONE").length,
    overdue: tasks.filter(t => t.status !== "DONE" && new Date(t.dueDate) < new Date()).length
  };

  const pieData = [
    { name: "To Do", value: stats.todo },
    { name: "In Progress", value: stats.inProgress },
    { name: "Done", value: stats.done }
  ];
  const COLORS = ['#94a3b8', '#3b82f6', '#10b981'];

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <header className={styles.header}>
          <h1>Dashboard Overview</h1>
          <p>Welcome back, {user?.name}</p>
        </header>

        {loading ? <p>Loading stats...</p> : (
          <>
            <div className={styles.statsGrid}>
              <div className={`glass-panel ${styles.statCard}`}>
                <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <ListTodo size={24} />
                </div>
                <div className={styles.statInfo}>
                  <h3>Total Tasks</h3>
                  <p>{stats.total}</p>
                </div>
              </div>
              <div className={`glass-panel ${styles.statCard}`}>
                <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <CheckCircle2 size={24} />
                </div>
                <div className={styles.statInfo}>
                  <h3>Completed</h3>
                  <p>{stats.done}</p>
                </div>
              </div>
              <div className={`glass-panel ${styles.statCard}`}>
                <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                  <CircleDashed size={24} />
                </div>
                <div className={styles.statInfo}>
                  <h3>In Progress</h3>
                  <p>{stats.inProgress}</p>
                </div>
              </div>
              <div className={`glass-panel ${styles.statCard}`}>
                <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <Clock size={24} />
                </div>
                <div className={styles.statInfo}>
                  <h3>Overdue</h3>
                  <p>{stats.overdue}</p>
                </div>
              </div>
            </div>

            <div className={styles.dashboardSplit}>
              <div className={`glass-panel ${styles.chartContainer}`}>
                <h2>Task Status Distribution</h2>
                <div style={{ height: 300, width: '100%', marginTop: '1rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '8px' }} 
                        itemStyle={{ color: 'var(--text-primary)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.chartLegend}>
                  <div className={styles.legendItem}><span style={{background: COLORS[0]}}></span> To Do</div>
                  <div className={styles.legendItem}><span style={{background: COLORS[1]}}></span> In Progress</div>
                  <div className={styles.legendItem}><span style={{background: COLORS[2]}}></span> Done</div>
                </div>
              </div>

              <div className={styles.recentTasks}>
                <h2>Recent Tasks</h2>
                <div className={styles.taskList}>
                {tasks.slice(0, 5).map(task => (
                  <div key={task._id} className={`glass-panel ${styles.taskItem}`}>
                    <div>
                      <h4>{task.title}</h4>
                      <p className={styles.projectName}>{task.projectId?.name}</p>
                    </div>
                    <div className={styles.taskMeta}>
                      <span className={`status-badge status-${task.status.toLowerCase()}`}>
                        {task.status.replace("_", " ")}
                      </span>
                      <span className={styles.dueDate}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                  {tasks.length === 0 && <p>No tasks assigned to you yet.</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
