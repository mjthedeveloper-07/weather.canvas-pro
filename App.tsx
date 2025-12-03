import React, { useState } from 'react';
import { HeroInput } from './components/HeroInput';
import { Controls } from './components/Controls';
import { Preview } from './components/Preview';
import { WeatherState, WeatherCondition } from './types';
import { DEFAULT_WEATHER_STATE } from './constants';
import { generateWeatherImage } from './services/geminiService';
import { Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [weatherState, setWeatherState] = useState<WeatherState>(DEFAULT_WEATHER_STATE);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCitySelect = (city: string, autoFillData?: Partial<WeatherState>) => {
    setWeatherState((prev) => ({
      ...prev,
      city,
      ...autoFillData,
    }));
  };

  const handleStateChange = (updates: Partial<WeatherState>) => {
    setWeatherState((prev) => ({ ...prev, ...updates }));
  };

  const handleGenerate = async () => {
    if (!weatherState.city) return;
    setIsGenerating(true);
    // Smooth scroll to preview on mobile
    if (window.innerWidth < 768) {
        document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
    }
    
    const imageUrl = await generateWeatherImage(weatherState);
    if (imageUrl) {
        setGeneratedImage(imageUrl);
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">WeatherCanvas <span className="text-slate-500 font-normal">Pro</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm">
             <div className="text-slate-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
             </div>
             <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-xs font-medium text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Powered by Google Search Data
             </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            
            {/* Left Column: Input & Controls */}
            <div className="lg:col-span-5 flex flex-col gap-10">
                <section>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Design your <span className="gradient-text">forecast</span>.
                    </h1>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Enter a city to auto-detect live trends, then generate a stunning AI-powered weather visualization.
                    </p>
                    <HeroInput onCitySelect={handleCitySelect} isLoading={false} />
                </section>
                
                <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <Controls 
                        weatherState={weatherState} 
                        onChange={handleStateChange}
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                    />
                </section>
            </div>

            {/* Right Column: Preview */}
            <div className="lg:col-span-7 w-full h-full lg:min-h-[600px]" id="preview-section">
                <div className="sticky top-24">
                    <Preview 
                        weatherState={weatherState} 
                        imageUrl={generatedImage} 
                        isGenerating={isGenerating}
                    />
                </div>
            </div>

        </div>
      </main>
    </div>
  );
};

export default App;
