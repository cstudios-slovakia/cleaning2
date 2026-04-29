import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Zap, CheckCircle2, History } from 'lucide-react';

export default function RoomDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Link to="/rooms" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
            <ArrowLeft size={18} className="text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Emerald Grand</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Room 101</h2>
          </div>
        </div>
        <button className="flex items-center space-x-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors shadow-sm font-medium">
          <Zap size={16} />
          <span className="hidden sm:inline">Express Clean</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="card p-5 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0">
              <p className="text-slate-400 font-semibold text-xs tracking-wider uppercase mb-1">Next Assignment</p>
              <div className="flex items-center space-x-2 mt-2">
                <Clock size={20} className="text-orange-400"/> 
                <span className="font-bold text-xl">Today, 14:00</span>
              </div>
            </div>
            <div className="card p-5 flex flex-col justify-center">
              <p className="text-slate-500 font-semibold text-xs tracking-wider uppercase mb-1">Auto Interval</p>
              <p className="font-bold text-xl text-slate-800">Every 2 days</p>
            </div>
          </div>

          <div className="card">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Task List Template</h3>
            </div>
            <div className="p-5">
              <ul className="space-y-3">
                {['Make bed', 'Clean bathroom', 'Vacuum floors', 'Empty trash'].map((task, i) => (
                  <li key={i} className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl">
                    <CheckCircle2 size={18} className="text-slate-300" />
                    <span className="font-medium text-slate-700">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center space-x-2">
              <History size={18} className="text-slate-400" />
              <h3 className="font-bold text-slate-800">Cleaning Log</h3>
            </div>
            <div className="p-5">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:h-full before:w-0.5 before:bg-slate-100">
                <div className="relative flex items-start space-x-4">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-green-500 text-white shadow-sm z-10 shrink-0"></div>
                  <div className="flex-1 -mt-1">
                    <div className="font-bold text-slate-800 text-sm">Maria G.</div>
                    <time className="text-xs font-medium text-slate-500">Yesterday, 14:30</time>
                  </div>
                </div>
                <div className="relative flex items-start space-x-4">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-slate-300 text-white shadow-sm z-10 shrink-0"></div>
                  <div className="flex-1 -mt-1">
                    <div className="font-bold text-slate-600 text-sm">Anna N.</div>
                    <time className="text-xs font-medium text-slate-400">3 days ago, 11:15</time>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
