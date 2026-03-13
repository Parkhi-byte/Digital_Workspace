import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export const useKanban = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [teams, setTeams] = useState([]); // Store all teams
    const [selectedTeam, setSelectedTeam] = useState(null); // Currently selected team
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'To Do',
        tag: 'General'
    });

    // Fetch Data
    const fetchData = useCallback(async () => {
        if (!user || !user.token) return;
        setLoading(true);
        try {
            // 1. Fetch Teams
            const teamResponse = await fetch('/api/team', {
                headers: { 'Authorization': `Bearer ${user.token}` },
            });
            const teamData = await teamResponse.json();

            let currentTeams = [];
            if (teamResponse.ok) {
                currentTeams = Array.isArray(teamData) ? teamData : [];
                setTeams(currentTeams);

                // Set default team if none selected
                if (!selectedTeam && currentTeams.length > 0) {
                    setSelectedTeam(currentTeams[0]);
                } else if (selectedTeam) {
                    // Update the selected team object with fresh data if it exists
                    const updatedSelected = currentTeams.find(t => t.id === selectedTeam.id);
                    if (updatedSelected) setSelectedTeam(updatedSelected);
                }
            }

            // 2. Fetch Tasks
            const response = await fetch('/api/tasks', {
                headers: { 'Authorization': `Bearer ${user.token}` },
            });
            const data = await response.json();
            if (response.ok) setTasks(data);

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, [user, selectedTeam]); // dependent on selectedTeam ID stability? No, simpler to just run on mount/user change.

    // Better to split fetch so selecting team doesn't re-fetch everything

    useEffect(() => {
        fetchData();
    }, [user]); // Run once on mount/user change

    // Derived State: filteredTasks by TEAM and Search
    const filteredTasks = useMemo(() => {
        if (!selectedTeam) return [];

        return tasks.filter(task => {
            // Filter by Team (Task.team is ObjectId, selectedTeam.id is string)
            // Legacy tasks might not have team, or we might want to show them in a specific way?
            // For now, STRICT filtering by team.
            // Check if task.team matches selectedTeam.id
            const taskTeamId = typeof task.team === 'object' ? task.team._id : task.team; // Populate check

            // selectedTeam.id is usually a string from database _id conversion
            // Ensure comparison is safe (string vs string)
            const matchesTeam = String(taskTeamId) === String(selectedTeam.id);

            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

            return matchesTeam && matchesSearch && matchesPriority;
        });
    }, [tasks, searchQuery, filterPriority, selectedTeam]);

    // Derived Members for Dropdown (from selectedTeam)
    const teamMembers = useMemo(() => {
        return selectedTeam ? selectedTeam.members : [];
    }, [selectedTeam]);

    const groupedTasks = useMemo(() => ({
        todo: filteredTasks.filter(t => t.status === 'To Do'),
        inprogress: filteredTasks.filter(t => t.status === 'In Progress'),
        done: filteredTasks.filter(t => t.status === 'Done'),
    }), [filteredTasks]);

    const stats = useMemo(() => {
        const total = filteredTasks.length;
        const done = filteredTasks.filter(t => t.status === 'Done').length;
        return { total, done };
    }, [filteredTasks]);

    const priorityData = useMemo(() => ({
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
            data: [
                filteredTasks.filter(t => t.priority === 'high').length,
                filteredTasks.filter(t => t.priority === 'medium').length,
                filteredTasks.filter(t => t.priority === 'low').length
            ],
            backgroundColor: ['#ef4444', '#f97316', '#3b82f6'],
            borderWidth: 0,
        }]
    }), [filteredTasks]);

    const statusData = useMemo(() => ({
        labels: ['To Do', 'In Progress', 'Done'],
        datasets: [{
            label: 'Tasks',
            data: [
                groupedTasks.todo.length,
                groupedTasks.inprogress.length,
                groupedTasks.done.length
            ],
            backgroundColor: ['#e5e7eb', '#3b82f6', '#22c55e'],
            borderRadius: 6,
            barThickness: 40,
        }]
    }), [groupedTasks]);

    const onDragEnd = useCallback(async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId;
        const currentStatus = source.droppableId;

        if (newStatus !== currentStatus) {
            const updatedTasks = tasks.map(t =>
                t._id === draggableId ? { ...t, status: newStatus } : t
            );
            setTasks(updatedTasks);

            try {
                const response = await fetch(`/api/tasks/${draggableId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ status: newStatus })
                });

                if (!response.ok) {
                    fetchData();
                    toast.error('Failed to update task status');
                }
            } catch (error) {
                console.error('Error updating task status:', error);
                toast.error('Failed to update task status');
                fetchData();
            }
        }
    }, [tasks, user, fetchData]);

    const handleDeleteTask = useCallback(async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                setTasks(prev => prev.filter(t => t._id !== taskId));
                toast.success('Task deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task');
        }
    }, [user]);

    const openModal = useCallback((statusOrTask = 'To Do') => {
        if (typeof statusOrTask === 'string') {
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                status: statusOrTask,
                tag: 'General',
                assignedTo: ''
            });
        } else {
            setEditingTask(statusOrTask);
            setFormData({
                title: statusOrTask.title,
                description: statusOrTask.description,
                priority: statusOrTask.priority,
                status: statusOrTask.status,
                tag: statusOrTask.tag || 'General',
                assignedTo: statusOrTask.assignedTo?._id || '',
                dueDate: statusOrTask.dueDate ? new Date(statusOrTask.dueDate).toISOString().split('T')[0] : ''
            });
        }
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingTask(null);
        setFormData({
            title: '',
            description: '',
            priority: 'medium',
            status: 'To Do',
            tag: 'General'
        });
    }, []);

    const handleSaveTask = useCallback(async (taskData) => {
        if (!user || !user.token) return;
        if (!selectedTeam) return toast.error("No team selected");

        try {
            const url = editingTask
                ? `/api/tasks/${editingTask._id}`
                : '/api/tasks';

            const method = editingTask ? 'PUT' : 'POST';

            // Include teamId for new tasks
            const payload = { ...taskData };
            if (!editingTask) {
                payload.teamId = selectedTeam.id;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const savedTask = await response.json();
                setTasks(prev => {
                    if (editingTask) {
                        return prev.map(t => t._id === savedTask._id ? savedTask : t);
                    } else {
                        return [...prev, savedTask];
                    }
                });
                closeModal();
                toast.success(editingTask ? 'Task updated successfully' : 'Task created successfully');
            } else {
                const errData = await response.json();
                toast.error(errData.message || 'Failed to save task');
            }
        } catch (error) {
            console.error('Error saving task:', error);
            toast.error('Failed to save task');
        }
    }, [user, editingTask, closeModal, selectedTeam]);

    return {
        user, tasks, loading, isModalOpen, editingTask, showAnalytics, setShowAnalytics, searchQuery, setSearchQuery, filterPriority, setFilterPriority, formData, setFormData,
        groupedTasks, stats, priorityData, statusData, teamMembers, teams, selectedTeam, setSelectedTeam,
        onDragEnd, handleDeleteTask, openModal, closeModal, handleSaveTask
    };
}
