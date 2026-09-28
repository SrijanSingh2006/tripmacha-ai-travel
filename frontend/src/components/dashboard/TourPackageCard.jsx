import React from 'react';
import { MapPin, Calendar, Check } from 'lucide-react';

export default function TourPackageCard({ tourData }) {
  // If no data is passed, we can show a skeleton or return null
  if (!tourData) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col sm:flex-row">
      
      {/* Left side: Image or Color Block (if images can't be scraped easily) */}
      <div className="w-full sm:w-48 bg-indigo-100 flex flex-col justify-center items-center p-4 border-b sm:border-b-0 sm:border-r border-gray-100">
        <MapPin className="w-8 h-8 text-indigo-500 mb-2" />
        <span className="text-sm font-bold text-indigo-900 text-center">{tourData.destination}</span>
        <span className="text-xs text-indigo-600 mt-1">{tourData.duration} Days</span>
      </div>

      {/* Right side: Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-900">{tourData.title}</h3>
            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-md uppercase tracking-wider">
              {tourData.provider}
            </span>
          </div>
          
          <ul className="mt-3 space-y-1">
            {tourData.inclusions.map((item, idx) => (
              <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex justify-between items-end border-t border-gray-50 pt-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Starting from</p>
            <p className="text-2xl font-black text-gray-900">₹{tourData.price.toLocaleString('en-IN')}</p>
          </div>
          
          {/* Affiliate/Redirect Button */}
          <a 
            href={tourData.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors"
          >
            View Deal
          </a>
        </div>
      </div>

    </div>
  );
}