import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useKanban } from '../hooks/useKanban/useKanban';
import KanbanColumn from '../components/Kanban/KanbanColumn';
import TaskModal from '../components/Kanban/TaskModal';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Plus, Search, PieChart as PieChartIcon, CheckSquare, Clock, Filter, List, ChevronDown, X } from 'lucide-react';
import { DragDropContext } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';

const Kanban = () => {
  const {
    user, loading, isModalOpen, editingTask, showAnalytics, setShowAnalytics, searchQuery, setSearchQuery, filterPriority, setFilterPriority, formData, setFormData,
    groupedTasks, stats, priorityData, statusData, teamMembers, teams, selectedTeam, setSelectedTeam,
    onDragEnd, handleDeleteTask, openModal, closeModal, handleSaveTask
  } = useKanban();

  const location = useLocation();

  useEffect(() => {
    if (location.state?.openNewTask) {
      openModal();
      window.history.replaceState({}, document.title);
    }
  }, [location, openModal]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
        <div className="flex space-x-3">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-900 dark:to-blue-950/50 flex flex-col overflow-hidden">
      {/* Simplified Background - Static, no animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      {/* Header Section - Reduced blur */}
      <div className="relative px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
              Task Board
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm font-medium">Manage and track your tasks</p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
            {/* Search */}
            <div className="relative w-full md:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Team Selector */}
            <select
              value={selectedTeam?.id || ''}
              onChange={(e) => {
                const team = teams.find(t => t.id === e.target.value);
                setSelectedTeam(team);
              }}
              className="pl-3 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="pl-3 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Analytics Toggle */}
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`p-2 rounded-lg transition-colors ${showAnalytics
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <PieChartIcon size={18} />
            </button>

            {/* New Task Button */}
            {user?.role !== 'team_member' && (
              <button
                onClick={openModal}
                className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <Plus size={18} />
                <span>New Task</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="h-full flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
          {/* Analytics Sidebar - Simplified */}
          {showAnalytics && (
            <div className="absolute lg:relative inset-y-0 right-0 z-30 w-full lg:w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl lg:shadow-none">
              <div className="h-full overflow-y-auto p-6 space-y-6">
                <div className="flex justify-between items-center lg:hidden mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h2>
                  <button
                    onClick={() => setShowAnalytics(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h3 className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase mb-2">Total</h3>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.total}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <h3 className="text-green-600 dark:text-green-400 text-xs font-bold uppercase mb-2">Done</h3>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{stats.done}</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Priority</h3>
                  <div className="h-48">
                    <Doughnut data={priorityData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } } }} />
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Status</h3>
                  <div className="h-40">
                    <Bar data={statusData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Kanban Board - Removed motion wrapper */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-4 h-full min-w-max pb-4">
                <KanbanColumn
                  title="To Do"
                  items={groupedTasks.todo}
                  status="To Do"
                  onAdd={openModal}
                  onEdit={openModal}
                  onDelete={handleDeleteTask}
                  icon={List}
                />
                <KanbanColumn
                  title="In Progress"
                  items={groupedTasks.inprogress}
                  status="In Progress"
                  onAdd={openModal}
                  onEdit={openModal}
                  onDelete={handleDeleteTask}
                  icon={Clock}
                />
                <KanbanColumn
                  title="Done"
                  items={groupedTasks.done}
                  status="Done"
                  onAdd={openModal}
                  onEdit={openModal}
                  onDelete={handleDeleteTask}
                  icon={CheckSquare}
                />
              </div>
            </DragDropContext>
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      {user?.role !== 'team_member' && (
        <button
          onClick={() => openModal()}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center z-40 transition-colors"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        formData={formData}
        setFormData={setFormData}
        handleSaveTask={handleSaveTask}
        editingTask={editingTask}
        teamMembers={teamMembers}
      />
    </div>
  );
};

export default Kanban;
