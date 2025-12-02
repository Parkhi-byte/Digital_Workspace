import React, { useMemo, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Plus, MoreHorizontal, Calendar, Filter, ArrowUpRight } from 'lucide-react';
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

const initialData = {
  todo: [
    { id: 't1', title: 'Define project goals', description: 'Outline OKRs and deliverables', priority: 'high', tag: 'Planning' },
    { id: 't2', title: 'Set up CI/CD', description: 'Add build, test, and deploy pipelines', priority: 'medium', tag: 'DevOps' },
  ],
  inprogress: [
    { id: 'p1', title: 'Design system audit', description: 'Unify colors and components', priority: 'high', tag: 'Design' },
  ],
  done: [
    { id: 'd1', title: 'User auth flow', description: 'Login / Signup / Guarded routes', priority: 'high', tag: 'Frontend' },
  ],
};

function Column({ title, items, status, onMove }) {
  const statusColors = {
    'To Do': 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700',
    'In Progress': 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30',
    'Done': 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30'
  };

  const dotColors = {
    'To Do': 'bg-gray-400',
    'In Progress': 'bg-blue-500',
    'Done': 'bg-green-500'
  };

  return (
    <div className={`flex-1 min-w-[300px] rounded-2xl border p-4 flex flex-col h-full ${statusColors[title]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${dotColors[title]}`}></span>
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">{title}</h3>
          <span className="bg-white dark:bg-gray-800 text-gray-500 text-xs px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
            {items.length}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
        {items.map((card) => (
          <div key={card.id} className="group bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${card.priority === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                  card.priority === 'medium' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                    'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                }`}>
                {card.priority}
              </span>
              <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity">
                <MoreHorizontal size={14} />
              </button>
            </div>

            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-tight">{card.title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{card.description}</p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-[8px] text-white font-bold">
                  PK
                </div>
                <span className="text-[10px] text-gray-400">{card.tag}</span>
              </div>
              <div className="flex items-center text-gray-400 text-[10px]">
                <Calendar size={10} className="mr-1" />
                <span>Today</span>
              </div>
            </div>

            {/* Quick Actions (Simulated) */}
            <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Logic to move cards would go here */}
            </div>
          </div>
        ))}
        <button className="w-full py-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 transition-colors flex items-center justify-center">
          <Plus size={16} className="mr-1" /> Add Task
        </button>
      </div>
    </div>
  );
}

export default function Kanban() {
  const [data, setData] = useState(initialData);
  const [newTitle, setNewTitle] = useState('');

  const totals = useMemo(() => {
    const t = data.todo.length;
    const p = data.inprogress.length;
    const d = data.done.length;
    const all = t + p + d;
    const completion = all ? Math.round((d / all) * 100) : 0;
    return { t, p, d, all, completion };
  }, [data]);

  const pieData = useMemo(() => ({
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [
      {
        data: [totals.t, totals.p, totals.d],
        backgroundColor: ['#94a3b8', '#3b82f6', '#22c55e'],
        borderWidth: 0,
      },
    ],
  }), [totals]);

  const barData = useMemo(() => ({
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [
      {
        label: 'Tasks',
        data: [totals.t, totals.p, totals.d],
        backgroundColor: ['#94a3b8', '#3b82f6', '#22c55e'],
        borderRadius: 6,
      },
    ],
  }), [totals]);

  const barOptions = {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { display: false } },
      x: { grid: { display: false } }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Project Board</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage tasks and track progress for <span className="font-semibold text-gray-900 dark:text-white">Q4 Roadmap</span></p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs text-white font-bold ${['bg-blue-500', 'bg-purple-500', 'bg-green-500'][i - 1]}`}>
                U{i}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-500 font-medium">
              +2
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-aurora-600 text-white rounded-lg text-sm font-medium hover:bg-aurora-700 transition-colors shadow-lg shadow-aurora-500/20">
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totals.all}</h3>
            </div>
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-aurora-500 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completion</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totals.completion}%</h3>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full rounded-full" style={{ width: `${totals.completion}%` }}></div>
          </div>
        </div>

        {/* Charts */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center">
            <div className="w-24 h-24">
              <Pie data={pieData} options={{ plugins: { legend: { display: false } } }} />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="h-24">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-24rem)]">
        <Column title="To Do" items={data.todo} />
        <Column title="In Progress" items={data.inprogress} />
        <Column title="Done" items={data.done} />
      </div>
    </div>
  );
}
