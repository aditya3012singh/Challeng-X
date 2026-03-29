import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';
import { Activity } from 'lucide-react';

const ProfileRadarChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="w-full h-[350px] flex flex-col items-center justify-center bg-[#0a0a0a] border border-[#222] rounded-xl">
        <div className="w-10 h-10 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-[10px] text-gray-600 font-mono animate-pulse uppercase tracking-[0.3em]">Neural Profiling...</div>
      </div>
    );
  }

  if (!data || data.length === 0 || data.every(item => item.A === 0)) {
    return (
      <div className="w-full h-[350px] flex flex-col items-center justify-center bg-[#0a0a0a] border border-dashed border-[#222] rounded-xl text-center px-8">
        <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mb-4">
             <Activity size={24} className="text-gray-700 opacity-20" />
        </div>
        <div className="text-gray-600 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
          Insufficient Transmission Data<br/>Solve challenges to generate profile.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-[var(--color-primary)]/5 blur-[100px] rounded-full" />
      
      <h3 className="text-sm font-mono text-gray-500 mb-6 flex items-center gap-2">
        <Activity size={14} /> NEURAL PERFORMANCE PROFILE
      </h3>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#222" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Player Skills"
              dataKey="A"
              stroke="var(--color-primary)"
              fill="var(--color-primary)"
              fillOpacity={0.4}
              animationBegin={0}
              animationDuration={1500}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2 border-t border-white/5 pt-6">
        {data.map((item) => (
          <div key={item.subject} className="text-center">
            <div className="text-[8px] font-mono text-gray-600 uppercase mb-1 tracking-tighter">{item.subject}</div>
            <div className="text-xs font-bold text-white font-mono">{item.A}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileRadarChart;
