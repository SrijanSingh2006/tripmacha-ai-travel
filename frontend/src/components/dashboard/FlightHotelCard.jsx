import React from 'react';
import { Plane, Hotel, ArrowRight } from 'lucide-react';

export default function FlightHotelCard({ flight, hotel }) {
  if (!flight && !hotel) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 flex flex-col gap-5">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
          DIY Custom Build
        </span>
        <span className="text-sm font-semibold text-gray-500">Combined Price</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flight Segment */}
        {flight && (
          <div className="flex gap-3 items-start border-r border-gray-50 pr-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Plane className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-900 text-sm">{flight.airline}</h4>
                <span className="text-xs font-semibold text-gray-700">₹{flight.price}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                {flight.from} <ArrowRight className="w-3 h-3" /> {flight.to}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Departing: {flight.time}</p>
            </div>
          </div>
        )}

        {/* Hotel Segment */}
        {hotel && (
          <div className="flex gap-3 items-start">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Hotel className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-900 text-sm">{hotel.name}</h4>
                <span className="text-xs font-semibold text-gray-700">₹{hotel.price_per_night}/night</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{hotel.rating} ⭐ — {hotel.location}</p>
              <p className="text-xs text-gray-400 mt-0.5">Inclusions: {hotel.amenities}</p>
            </div>
          </div>
        )}
      </div>

      {/* Aggregated Booking Action */}
      <div className="mt-2 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 -mx-6 -mb-6 p-6">
        <div>
          <span className="text-2xl font-black text-gray-900">
            Locating...
          </span>
          <p className="text-xs text-gray-400 mt-0.5">Sum total of individual bookings</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
          Verify Options
        </button>
      </div>
    </div>
  );
}