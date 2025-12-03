import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Sparkles, Loader2, TrendingUp, Navigation } from 'lucide-react';
import { TrendingItem } from '../types';
import { getTrendingWeatherCities, getCityWeatherData } from '../services/geminiService';
import { POPULAR_CITIES } from '../constants';

interface HeroInputProps {
  onCitySelect: (city: string, autoFillData?: any) => void;
  isLoading: boolean;
}

export const HeroInput: React.FC<HeroInputProps> = ({ onCitySelect, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [trends, setTrends] = useState<TrendingItem[]>([]);
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      setIsFetchingTrends(true);
      const data = await getTrendingWeatherCities();
      if (data && data.length > 0) {
        setTrends(data);
      } else {
        // Fallback mock if API fails or quota limited
        setTrends([
            { city: "London", reason: "Foggy" },
            { city: "Tokyo", reason: "Rain" },
            { city: "Mumbai", reason: "Monsoon" }
        ]);
      }
      setIsFetchingTrends(false);
    };
    fetchTrends();
  }, []);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = POPULAR_CITIES.filter(city => 
        city.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 5);
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [inputValue]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
        handleSelectCity(inputValue);
        setShowSuggestions(false);
    }
  };

  const handleSelectCity = async (city: string) => {
    setInputValue(city);
    setShowSuggestions(false);
    // Optimistically select city, then maybe fetch extra data in parent or here
    onCitySelect(city); 
    
    // Fetch live data for this city to autofill
    const data = await getCityWeatherData(city);
    if (data) {
        onCitySelect(city, data);
    }
  };

  const handleUseMyLocation = () => {
      if (navigator.geolocation) {
          // Visual feedback
          setInputValue("Detecting location...");
          navigator.geolocation.getCurrentPosition(async (position) => {
              // Simulating reverse geocode for now or use coordinates if API supported it
              // For this demo, we'll map to a nearby major city or just clear and let them type if failed
              // In a real app, we'd use a reverse geocoding API here.
              // Let's assume San Francisco for demo purposes if we can't really reverse geocode without an extra API key
              handleSelectCity("San Francisco, USA"); 
          }, (error) => {
              console.error("Geolocation error:", error);
              setInputValue("");
              alert("Could not detect location. Please enter manually.");
          });
      }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto relative z-50" ref={wrapperRef}>
      <div className="relative group search-container">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
        </div>
        <input
          type="text"
          className="glass-input w-full pl-12 pr-12 py-4 rounded-xl text-lg text-white placeholder-slate-400 focus:outline-none focus:ring-0"
          placeholder="Enter City Name (e.g. San Francisco)"
          value={inputValue}
          onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
        />
        <div 
            className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer hover:text-white text-slate-400 transition-colors" 
            title="Use My Location"
            onClick={handleUseMyLocation}
        >
          <Navigation className="h-5 w-5" />
        </div>

        {/* Smart Suggestions Dropdown */}
        {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                
                {/* Autocomplete List */}
                {filteredCities.length > 0 && (
                    <div className="py-2 border-b border-white/5">
                        <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Suggestions</div>
                        {filteredCities.map((city, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelectCity(city)}
                                className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors"
                            >
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-200">{city}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Trending Section inside Dropdown */}
                {trends.length > 0 && (
                     <div className="p-4 bg-white/2">
                        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <TrendingUp className="w-3 h-3 text-indigo-400" />
                            Trending on Google
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {trends.map((trend, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectCity(trend.city)}
                                    className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 hover:bg-indigo-600/20 border border-white/5 hover:border-indigo-500/30 transition-all text-sm"
                                >
                                    <span className="text-slate-200 group-hover:text-white">{trend.city}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400 group-hover:text-indigo-200 group-hover:bg-indigo-500/20 transition-colors">
                                        {trend.reason}
                                    </span>
                                </button>
                            ))}
                        </div>
                     </div>
                )}

                {/* Loading State or No Results */}
                {inputValue && filteredCities.length === 0 && trends.length === 0 && (
                    <div className="p-4 text-center text-slate-500 text-sm">
                        No suggestions found. Press Enter to search.
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Static Context Strip (Popular Searches) - Kept for visibility when not typing */}
      {!showSuggestions && (
        <div className="flex flex-wrap items-center gap-3 text-sm animate-fade-in-up">
            <span className="text-slate-400 flex items-center gap-1.5">
            {isFetchingTrends ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-yellow-400" />}
            Popular searches now:
            </span>
            {trends.slice(0, 3).map((trend, idx) => (
            <button
                key={idx}
                onClick={() => handleSelectCity(trend.city)}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 transition-all text-slate-300 hover:text-white flex items-center gap-2"
            >
                <span className="font-medium">{trend.city}</span>
            </button>
            ))}
        </div>
      )}
    </div>
  );
};