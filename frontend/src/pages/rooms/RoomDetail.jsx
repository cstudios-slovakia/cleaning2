import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Zap, CheckCircle2 } from 'lucide-react';

export default function RoomDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/rooms" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">Room: 101</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass bg-white p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-emerald-600 font-bold uppercase tracking-widest">Emerald Grand</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900">Room 101</h3>
              </div>
              <button className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">
                <Zap size={18} />
                <span className="font-medium">Express Clean</span>
              </button>
            </div>
            
            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Next Assignment</p>
                <p className="font-medium flex items-center space-x-2">
                  <Clock size={16} className="text-orange-500"/> 
                  <span>Today, 14:00</span>
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Auto Interval</p>
                <p className="font-medium">Every 2 days</p>
              </div>
            </div>
          </div>

          <div className="glass bg-white p-6 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Task List Template</h3>
            <ul className="space-y-2">
              {['Make bed', 'Clean bathroom', 'Vacuum floors', 'Empty trash'].map((task, i) => (
                <li key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <CheckCircle2 size={18} className="text-gray-300" />
                  <span className="font-medium text-gray-700">{task}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass bg-white p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Cleaning Log</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded-xl border border-gray-100 shadow-sm ml-4 md:ml-0">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-gray-900 text-sm">Maria G.</div>
                    <time className="text-xs font-medium text-emerald-600">Yesterday</time>
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-gray-300 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-gray-50 p-3 rounded-xl border border-gray-100 ml-4 md:ml-0 opacity-70">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-gray-900 text-sm">Anna N.</div>
                    <time className="text-xs font-medium text-gray-500">3 days ago</time>
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
