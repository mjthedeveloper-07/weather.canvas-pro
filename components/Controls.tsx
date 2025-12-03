import React from 'react';
import { WeatherState, WeatherCondition, ImageStyle } from '../types';
import { WEATHER_ICONS, IMAGE_STYLES } from '../constants';
import { Calendar, RefreshCw, Sparkles, Palette, Box, Camera, Smile, Zap } from 'lucide-react';
import { GlassPanel } from './GlassPanel';

interface ControlsProps {
  weatherState: WeatherState;
  onChange: (updates: Partial<WeatherState>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const STYLE_ICONS: Record<ImageStyle, React.ElementType> = {
  Isometric: Box,
  Realistic: Camera,
  Cartoonish: Smile,
  Cyberpunk: Zap,
};

export const Controls: React.FC<ControlsProps> = ({ weatherState, onChange, onGenerate, isGenerating }) => {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Weather Condition Selector */}
      <GlassPanel>
        <label className="text-sm font-medium text-slate-400 mb-4 block">Weather Condition</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {(Object.keys(WEATHER_ICONS) as WeatherCondition[]).map((condition) => (
            <button
              key={condition}
              onClick={() => onChange({ condition })}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 gap-2
                ${weatherState.condition === condition
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                  : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
            >
              {WEATHER_ICONS[condition]}
              <span className="text-xs">{condition}</span>
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* Style Selector */}
      <GlassPanel>
        <label className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4 text-pink-400" />
            Visual Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {IMAGE_STYLES.map((style) => {
                const Icon = STYLE_ICONS[style];
                return (
                    <button
                        key={style}
                        onClick={() => onChange({ style })}
                        className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm font-medium border transition-all duration-200
                        ${weatherState.style === style
                            ? 'bg-pink-600/20 border-pink-500/50 text-white shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                            : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        {Icon && <Icon className="w-4 h-4" />}
                        {style}
                    </button>
                );
            })}
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperature */}
        <GlassPanel>
          <label className="text-sm font-medium text-slate-400 mb-4 block">Temperature</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={weatherState.temperature}
              onChange={(e) => onChange({ temperature: parseInt(e.target.value) || 0 })}
              className="glass-input w-24 p-3 rounded-lg text-center text-xl font-bold text-white focus:outline-none"
            />
            <div className="flex bg-slate-900/50 rounded-lg p-1 border border-white/5">
              {(['C', 'F'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => onChange({ unit: u })}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    weatherState.unit === u ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  °{u}
                </button>
              ))}
            </div>
          </div>
        </GlassPanel>

        {/* Date */}
        <GlassPanel>
            <label className="text-sm font-medium text-slate-400 mb-4 block">Date</label>
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    value={weatherState.date}
                    onChange={(e) => onChange({ date: e.target.value })}
                    className="glass-input w-full pl-10 p-3 rounded-lg text-white focus:outline-none"
                />
            </div>
        </GlassPanel>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || !weatherState.city}
        className={`
            relative w-full py-4 rounded-xl text-lg font-bold text-white tracking-wide overflow-hidden group
            transition-all duration-300
            ${!weatherState.city ? 'opacity-50 cursor-not-allowed bg-slate-800' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]'}
        `}
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 backdrop-blur-sm" />
        <span className="relative flex items-center justify-center gap-2">
            {isGenerating ? (
                <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Creating your Canvas...
                </>
            ) : (
                <>
                    <Sparkles className="w-5 h-5" />
                    Generate Weather Canvas
                </>
            )}
        </span>
      </button>

    </div>
  );
};