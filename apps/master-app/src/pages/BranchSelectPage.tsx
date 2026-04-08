import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { setBranchCookie } from '../lib/branch-cookie';

// Mock list of branches returned from the API (user mappings)
const MOCK_BRANCHES = [
  { id: '1', name: 'Chi nhánh Quận 1', domainPrefix: 'q1', address: '123 Lê Lợi, P. Bến Nghé', activeUsers: 45, isPrimary: true },
  { id: '2', name: 'Chi nhánh Quận 7', domainPrefix: 'q7', address: '456 Nguyễn Văn Linh, P. Tân Phong', activeUsers: 12, isPrimary: false },
  { id: '3', name: 'Chi nhánh Quận 3', domainPrefix: 'q3', address: '789 Võ Văn Tần, P. Võ Thị Sáu', activeUsers: 8, isPrimary: false },
];

export default function BranchSelectPage() {
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedBranch(id);
  };

  const handleContinue = () => {
    if (!selectedBranch) return;
    const branch = MOCK_BRANCHES.find((b) => b.id === selectedBranch);
    if (!branch) return;
    setLoading(true);
    setBranchCookie({
      id: branch.id,
      name: branch.name,
      domainPrefix: branch.domainPrefix,
      address: branch.address,
      isPrimary: branch.isPrimary,
    });
    navigate('/login', { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-[#1c232f] rounded-2xl p-8 shadow-xl border border-gray-800 flex flex-col"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-4 border border-gray-700">
             <Building className="text-orange-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Chọn Chi Nhánh
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            Vui lòng chọn chi nhánh bạn muốn đăng nhập
          </p>
        </div>

        <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {MOCK_BRANCHES.map((branch) => {
            const isSelected = selectedBranch === branch.id;
            
            return (
              <motion.div
                key={branch.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelect(branch.id)}
                className={`w-full relative overflow-hidden rounded-xl border p-4 cursor-pointer transition-all duration-200 flex items-start gap-4
                  ${isSelected 
                    ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_15px_rgba(246,106,18,0.15)]' 
                    : 'bg-[#151b22] border-gray-700 hover:border-gray-600'
                  }
                `}
              >
                {/* Visual Selection Indicator */}
                <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center border transition-colors shrink-0
                  ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-500 bg-transparent'}
                `}>
                  {isSelected && <CheckCircle2 size={16} className="text-white" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold ${isSelected ? 'text-orange-400' : 'text-gray-200'}`}>
                      {branch.name}
                    </h3>
                    {branch.isPrimary && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase font-medium tracking-wider">
                        Trụ sở
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{branch.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded inline-flex font-mono">
                      hr-{branch.domainPrefix}.a.com
                    </span>
                  </div>
                </div>

                {/* Subtle active glow effect for selected item */}
                <AnimatePresence>
                  {isSelected && (
                     <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 pointer-events-none"
                     />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <button 
          onClick={handleContinue}
          disabled={!selectedBranch || loading}
          className={`w-full font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 flex justify-center items-center gap-2
            ${!selectedBranch 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-70' 
              : loading 
                ? 'bg-[#e86014] text-white opacity-80 cursor-wait'
                : 'bg-[#e86014] hover:bg-[#ff7b2b] text-white shadow-[0_0_15px_rgba(232,96,20,0.3)] hover:shadow-[0_0_20px_rgba(232,96,20,0.5)] transform hover:-translate-y-0.5'
            }
          `}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Tiếp tục <ArrowRight size={18} />
            </>
          )}
        </button>
      </motion.div>
      
      <div className="mt-6 text-xs text-gray-500 flex items-center gap-4">
        <button onClick={() => navigate('/login')} className="hover:text-gray-300 transition-colors">
          Quay lại đăng nhập
        </button>
        <span className="text-gray-600">|</span>
        <span className="text-gray-500">Chọn và bấm Tiếp tục để lưu chi nhánh (đổi chi nhánh sẽ ghi đè)</span>
      </div>
      </div>
    </div>
  );
}
