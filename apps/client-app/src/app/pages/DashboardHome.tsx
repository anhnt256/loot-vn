import React from 'react';

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#1e293b]">Endpoint Access</h1>
        <p className="text-[#64748b]">Manage and monitor your API endpoint access.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-[#e2eafc] flex items-center justify-center mb-4">
               <div className="w-5 h-5 bg-[#00359411]" />
            </div>
            <h3 className="font-semibold text-[#1e293b] mb-1">Feature {i}</h3>
            <p className="text-sm text-[#64748b]">Quick description of what this feature does or its status.</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden text-center py-20">
         <div className="text-[#9ca3af] mb-4 text-4xl">📊</div>
         <h2 className="text-lg font-medium text-[#475569]">No active metrics yet</h2>
         <p className="text-[#94a3b8] max-w-xs mx-auto mt-1">
           Once you start using the endpoints, usage metrics will appear here.
         </p>
      </div>
    </div>
  );
};

export default DashboardHome;
