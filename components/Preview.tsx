import React, { useState } from 'react';
import { WeatherState } from '../types';
import { WEATHER_ICONS } from '../constants';
import { Share2, Download, Cloud, Loader2 } from 'lucide-react';

interface PreviewProps {
  weatherState: WeatherState;
  imageUrl: string | null;
  isGenerating: boolean;
}

export const Preview: React.FC<PreviewProps> = ({ weatherState, imageUrl, isGenerating }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Extract city name safely
  const cityName = weatherState.city.split(',')[0]; 

  // The "Chennai Example" calls for dark text on light backgrounds (Isometric/Cartoonish)
  // But light text on dark backgrounds (Realistic/Cyberpunk)
  const isLightModeImage = weatherState.style === 'Isometric' || weatherState.style === 'Cartoonish';
  const textColorClass = isLightModeImage ? 'text-slate-900' : 'text-white';
  const subTextColorClass = isLightModeImage ? 'text-slate-500' : 'text-slate-300';
  const accentColorClass = isLightModeImage ? 'text-slate-800' : 'text-white';
  const shadowClass = isLightModeImage ? '' : 'drop-shadow-lg';

  const handleDownload = async () => {
    if (!imageUrl) return;
    setIsDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = "anonymous"; // Handle cross-origin if needed, though usually base64 here

      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Set canvas dimensions to match the source image (high quality)
      canvas.width = img.width;
      canvas.height = img.height;

      // 1. Draw Background Image
      ctx.drawImage(img, 0, 0);

      // 2. Add subtle gradient overlay for text readability if needed
      if (!isLightModeImage) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.4);
        gradient.addColorStop(0, 'rgba(0,0,0,0.6)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);
      }

      // 3. Configure Text Styles matching the UI
      const w = canvas.width;
      const centerX = w / 2;
      const startY = w * 0.15; // Position text at top 15%

      ctx.textAlign = 'center';
      
      // Style settings based on mode
      const primaryColor = isLightModeImage ? '#0f172a' : '#ffffff';
      const secondaryColor = isLightModeImage ? '#64748b' : '#cbd5e1';
      
      if (!isLightModeImage) {
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 15;
      }

      // -- DRAW CITY NAME --
      // [ CITY ]
      const cityFontSize = w * 0.09; // Scale font relative to image width
      ctx.font = `bold ${cityFontSize}px Inter, sans-serif`;
      ctx.fillStyle = primaryColor;
      ctx.fillText(`[ ${cityName.toUpperCase()} ]`, centerX, startY);

      // -- DRAW TEMP & CONDITION --
      const tempFontSize = w * 0.045;
      ctx.font = `bold ${tempFontSize}px Inter, sans-serif`;
      const tempText = `${weatherState.temperature}°${weatherState.unit}, ${weatherState.condition}`;
      ctx.fillText(tempText, centerX, startY + (w * 0.08));

      // -- DRAW DATE --
      ctx.shadowBlur = 0; // Reduce shadow for smaller text
      const dateFontSize = w * 0.025;
      ctx.font = `500 ${dateFontSize}px Inter, sans-serif`;
      ctx.fillStyle = secondaryColor;
      ctx.fillText(weatherState.date, centerX, startY + (w * 0.12));

      // 4. Trigger Download
      const link = document.createElement('a');
      link.download = `WeatherCanvas-${cityName.replace(/\s+/g, '')}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (e) {
      console.error("Download composition failed:", e);
      // Fallback: Download raw image
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `weather-canvas-${cityName}.png`;
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
        <div className="relative flex-grow w-full aspect-square md:aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 bg-slate-900/40 shadow-2xl group ring-1 ring-white/5">
            
            {/* Loading / Placeholder State */}
            {(!imageUrl || isGenerating) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-900/50 backdrop-blur-sm z-20">
                   {isGenerating ? (
                       <div className="flex flex-col items-center gap-6">
                           <div className="relative w-32 h-32">
                                <div className="absolute inset-0 rounded-full border-[6px] border-indigo-500/10 animate-[spin_4s_linear_infinite]"></div>
                                <div className="absolute inset-0 rounded-full border-[6px] border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-[spin_2s_linear_infinite]"></div>
                                <div className="absolute inset-4 rounded-full bg-indigo-500/10 blur-xl animate-pulse"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Cloud className="w-10 h-10 text-indigo-400 animate-bounce" />
                                </div>
                           </div>
                           <div className="space-y-2">
                               <p className="text-xl font-semibold text-white tracking-tight animate-pulse">Designing Scene...</p>
                               <p className="text-sm text-indigo-300/60">Rendering {weatherState.style} diorama of {weatherState.city}</p>
                           </div>
                       </div>
                   ) : (
                       <>
                           <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                                <Cloud className="w-10 h-10 opacity-20" />
                           </div>
                           <p className="text-xl font-medium text-white/50">Your Custom Weather Canvas</p>
                           <p className="text-sm text-white/20 mt-2 max-w-[200px]">Enter a city and click generate to see the magic.</p>
                       </>
                   )}
                </div>
            )}

            {/* Generated Image Layer */}
            {imageUrl && !isGenerating && (
                <>
                    <img 
                        src={imageUrl} 
                        alt={`Weather in ${weatherState.city}`} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] hover:scale-105 ease-out"
                    />
                    
                    {/* Subtle vignetting for focus */}
                    <div className={`absolute inset-0 pointer-events-none ${isLightModeImage ? 'bg-gradient-to-t from-slate-900/10 to-transparent' : 'bg-gradient-to-t from-black/50 to-transparent'}`} />
                    
                    {/* Main Content Overlay - Following "Chennai Example" Style */}
                    <div className="absolute inset-0 flex flex-col items-center pt-12 md:pt-16 z-10 pointer-events-none px-4">
                        
                        {/* 1. Weather Icon Centered Above Scene */}
                        <div className={`
                            mb-4 md:mb-6 transform hover:scale-110 transition-transform duration-300
                            ${isLightModeImage ? 'text-amber-500 drop-shadow-md' : 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]'}
                        `}>
                             {/* Cloning the icon to increase size and control specific styling */}
                             {React.cloneElement(WEATHER_ICONS[weatherState.condition] as React.ReactElement, { 
                                 className: "w-12 h-12 md:w-16 md:h-16", 
                                 strokeWidth: 1.5 
                             })}
                        </div>

                        {/* 2. Typography Block */}
                        <div className="flex flex-col items-center text-center space-y-1 md:space-y-2 w-full">
                            
                            {/* City Name: [ Bracketed ] Bold Sans-Serif */}
                            <h2 className={`
                                text-5xl md:text-7xl font-bold tracking-tight uppercase ${textColorClass} ${shadowClass}
                                font-sans break-words w-full px-2 leading-none
                            `}>
                                <span className="opacity-40 font-light mr-2">[</span>
                                {cityName}
                                <span className="opacity-40 font-light ml-2">]</span>
                            </h2>

                            {/* Temp & Condition: Bold, Modern */}
                            <div className={`text-2xl md:text-3xl font-bold ${accentColorClass} ${shadowClass} mt-1`}>
                                {weatherState.temperature}°{weatherState.unit}, {weatherState.condition}
                            </div>

                            {/* Date: Thin-medium, Neutral Grey */}
                            <div className={`text-base md:text-lg font-medium tracking-wide ${subTextColorClass} ${shadowClass} mt-1`}>
                                {weatherState.date}
                            </div>

                        </div>
                    </div>
                </>
            )}
        </div>

        {/* Action Bar */}
        <div className="mt-6 flex justify-between items-center px-4">
            <div className="text-sm text-slate-500 font-medium">
                {imageUrl && !isGenerating ? (
                    <span className="flex items-center gap-2 text-indigo-400">
                         <span className="relative flex h-2 w-2">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                         </span>
                         Canvas Ready
                    </span>
                ) : "Waiting for input..."}
            </div>
            <div className="flex gap-3">
                <button 
                    disabled={!imageUrl || isGenerating}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-slate-400 hover:text-white transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Share2 className="w-4 h-4" />
                    Share
                </button>
                <button 
                    onClick={handleDownload}
                    disabled={!imageUrl || isGenerating || isDownloading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-300 hover:text-indigo-200 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
                >
                    {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    {isDownloading ? 'Saving...' : 'Save Image'}
                </button>
            </div>
        </div>
    </div>
  );
};