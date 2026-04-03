import React, { useState } from 'react';
import CheckInCard from '../components/CheckInCard';
import CheckInCalendar from '../components/CheckInCalendar';

const CheckIn: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col p-3 gap-2 h-screen">
      <div className="flex-1 bg-gray-900/95 rounded-xl p-4 border border-gray-800 shadow-lg overflow-hidden">
        <div className="h-full flex flex-col">
          {/* CheckIn Card */}
          <div className="flex-shrink-0 mb-3">
            <div className="w-96 mx-auto">
              <CheckInCard onRefresh={() => setRefreshKey((k) => k + 1)} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-shrink-0 mb-3">
            <p className="text-gray-400 text-xs text-center">
              Hiện tại tính năng điểm danh không áp dụng khi sử dụng combo. Mong các bạn thông cảm!
            </p>
          </div>

          {/* Calendar */}
          <div className="flex-1 min-h-0">
            <CheckInCalendar refreshKey={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
};



export default CheckIn;
