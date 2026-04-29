import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit2 } from 'lucide-react';

export default function PropertyDetail() {
  const { id } = useParams();
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/properties" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-800">Property Details (ID: {id})</h2>
        </div>
        <button className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors font-medium">
          <Edit2 size={18} />
          <span>Edit</span>
        </button>
      </div>

      <div className="glass bg-white p-8 rounded-3xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Name</h3>
              <p className="text-lg font-medium">Emerald Grand</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Default Schedule Time</h3>
              <p className="text-lg font-medium">10:00 AM</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Color Theme</h3>
              <div className="flex space-x-2 mt-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 shadow-inner"></div>
                <div className="w-8 h-8 rounded-full bg-gold-400 shadow-inner"></div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Assigned Managers</h3>
              <ul className="list-disc pl-5 text-gray-700">
                <li>John Doe</li>
                <li>Jane Smith</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Assigned Cleaners</h3>
              <ul className="list-disc pl-5 text-gray-700">
                <li>Maria Garcia</li>
                <li>Anna Novak</li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        <div>
          <h3 className="text-lg font-bold mb-4">Rooms in this Property</h3>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center">
            <span className="font-medium">Room 101</span>
            <Link to="/rooms/101" className="text-sm text-emerald-600 hover:underline">View Room</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
