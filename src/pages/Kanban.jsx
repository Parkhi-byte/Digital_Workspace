import React, { useMemo, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
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
    { id: 't1', title: 'Define project goals', description: 'Outline OKRs and deliverables' },
    { id: 't2', title: 'Set up CI/CD', description: 'Add build, test, and deploy' },
  ],
  inprogress: [
    { id: 'p1', title: 'Design system audit', description: 'Unify colors and components' },
  ],
  done: [
    { id: 'd1', title: 'User auth flow', description: 'Login / Signup / Guarded routes' },
  ],
};

function Column({ title, items, bg }) {
  return (
    <div className={"flex-1 min-w-[260px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 " + bg}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wide">{title}</h3>
        <span className="text-xs text-gray-400">{items.length}</span>
      </div>
      <div className="space-y-3">
        {items.map((card) => (
          <div key={card.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 shadow-sm">
            <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{card.title}</div>
            {card.description && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.description}</div>
            )}
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-aurora-50 text-aurora-700 dark:bg-aurora-900/30 dark:text-aurora-300">priority: med</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">team</span>
            </div>
          </div>
        ))}
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
        label: 'Tasks',
        data: [totals.t, totals.p, totals.d],
        backgroundColor: ['#22c55e33', '#06b6d433', '#10b98166'],
        borderColor: ['#22c55e', '#06b6d4', '#10b981'],
        borderWidth: 1,
      },
    ],
  }), [totals]);

  const barData = useMemo(() => ({
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [
      {
        label: 'Count',
        data: [totals.t, totals.p, totals.d],
        backgroundColor: ['#22c55e', '#06b6d4', '#10b981'],
      },
    ],
  }), [totals]);

  const barOptions = {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  const addCard = () => {
    if (!newTitle.trim()) return;
    const id = 't' + Math.random().toString(36).slice(2, 8);
    setData(prev => ({
      ...prev,
      todo: [{ id, title: newTitle.trim(), description: '' }, ...prev.todo]
    }));
    setNewTitle('');
  };

  const moveCard = (id, from, to) => {
    if (from === to) return;
    setData(prev => {
      const source = [...prev[from]];
      const idx = source.findIndex(c => c.id === id);
      if (idx === -1) return prev;
      const [card] = source.splice(idx, 1);
      const target = [...prev[to], card];
      return { ...prev, [from]: source, [to]: target };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Project Board</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Plan, track, analyze progress across projects.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new project/task title"
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 w-64"
          />
          <button onClick={addCard} className="px-3 py-2 text-sm rounded-lg bg-aurora-600 text-white hover:bg-aurora-700">Add</button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totals.all}</div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">To Do</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totals.t}</div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">In Progress</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totals.p}</div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Done</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totals.d}</div>
          <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded">
            <div className="h-2 bg-emerald-500 rounded" style={{ width: totals.completion + '%' }}></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{totals.completion}% complete</div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Task Distribution</h3>
          <Pie data={pieData} />
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Progress by Status</h3>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto">
        <div className="flex-1 min-w-[280px]">
          <Column title="To Do" items={data.todo} bg="" />
          {data.todo.length === 0 ? (
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">No tasks. Add one to get started.</div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2 justify-end">
              {data.todo.map(card => (
                <button key={card.id} onClick={() => moveCard(card.id, 'todo', 'inprogress')} className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Start {card.title}</button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-[280px]">
          <Column title="In Progress" items={data.inprogress} bg="" />
          {data.inprogress.length === 0 ? (
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">Nothing in progress.</div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2 justify-end">
              {data.inprogress.map(card => (
                <div key={card.id} className="flex gap-2">
                  <button onClick={() => moveCard(card.id, 'inprogress', 'todo')} className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Backlog</button>
                  <button onClick={() => moveCard(card.id, 'inprogress', 'done')} className="text-xs px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white">Mark Done</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-[260px]">
          <Column title="Done" items={data.done} bg="" />
        </div>
      </div>
    </div>
  );
}


