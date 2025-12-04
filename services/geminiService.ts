import { GoogleGenAI } from "@google/genai";
import { TrendingItem, WeatherCondition, WeatherState } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches trending cities/weather.
 * Tries with Google Search first, falls back to basic knowledge if search fails (e.g. network/RPC errors).
 */
export const getTrendingWeatherCities = async (): Promise<TrendingItem[]> => {
  const promptText = "Identify 4 major global cities that are currently experiencing notable weather (storms, heatwaves, snow, etc) or are trending in search. Return ONLY a JSON list with keys 'city' and 'reason'. The 'reason' should be a short summary.";
  
  // 1. Try with Google Search (Live Data)
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text;
    if (text) {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        // Attempt parse
        return JSON.parse(cleaned) as TrendingItem[];
    }
  } catch (error) {
    console.warn("Trending fetch with Search failed, retrying without tools...", error);
  }

  // 2. Fallback: No Tools (Basic Knowledge) if RPC/Search fails
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: promptText + " (Use your internal knowledge base to estimate current global weather trends)" }] }],
    });

    const text = response.text;
    if (!text) return [];
    
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as TrendingItem[];
  } catch (fallbackError) {
    console.error("Failed to fetch trends (fallback):", fallbackError);
    return [];
  }
};

/**
 * Gets current weather for a specific city.
 * Tries with Google Search first, falls back to basic knowledge (estimate) if search fails.
 */
export const getCityWeatherData = async (city: string): Promise<Partial<WeatherState> | null> => {
  const promptText = `What is the current weather condition and temperature in ${city}? Return ONLY a JSON object with keys 'condition' (one of Sunny, Cloudy, Rain, Storm, Snow, Fog), 'temperature' (number), and 'unit' ('C' or 'F').`;

  // 1. Try with Google Search (Live Data)
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text;
    if (text) {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned) as Partial<WeatherState>;
    }
  } catch (error) {
    console.warn("Weather fetch with Search failed, retrying without tools...", error);
  }

  // 2. Fallback: No Tools (Estimate)
  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: promptText + " (Provide a realistic estimate based on the city's climate for this time of year)" }] }],
    });
    
    const text = response.text;
    if (!text) return null;

    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as Partial<WeatherState>;
  } catch (fallbackError) {
    console.error("Failed to fetch city weather (fallback):", fallbackError);
    return null;
  }
};

/**
 * Generates a weather card image based on selected style.
 */
export const generateWeatherImage = async (state: WeatherState): Promise<string | null> => {
  try {
    let stylePrompt = "";
    
    // Specific aesthetic rules from "Chennai Example" breakdown
    switch (state.style) {
        case 'Realistic':
            stylePrompt = "A breathtaking, photorealistic 8k cinematic shot. Highly detailed, atmospheric lighting, resembling National Geographic photography. Darker, dramatic mood.";
            break;
        case 'Cartoonish':
            stylePrompt = "A cute, vibrant, stylized 3D render in the style of high-end animation (like Pixar or Animal Crossing). Soft round shapes, bright cheerful colors, toy-like textures. Light and airy background.";
            break;
        case 'Cyberpunk':
            stylePrompt = "A futuristic, neon-drenched cyberpunk vision. Glowing lights, dark moody atmosphere, holographic elements, high-tech architecture. Night time setting.";
            break;
        case 'Isometric':
        default:
            // Relaxed Isometric prompt to allow for diverse city colors while keeping the diorama structure
            stylePrompt = "A highly detailed isometric 3D diorama mini-world. Tilted top-down view (approx 45 degrees). Style: Toy-like realism, smooth shading, 3D-rendered diorama art. Composition: A miniature city block on a square platform with distinct edges, water channels or roads, and recognizable landmarks. Colors: Vibrant but cohesive, soft textures. Lighting: Soft ambient lighting, diffuse shadows. Render: Octane render quality, smooth textures, SimCity-style aesthetic, high resolution, clean outlines.";
            break;
    }

    const prompt = `${stylePrompt} 
    Subject: The city of ${state.city}. 
    Weather Condition: ${state.condition}. 
    Details: Features iconic landmarks of ${state.city} (e.g. towers, temples, bridges) arranged in a miniature scene. 
    Atmosphere: Match the weather: ${state.condition === 'Rain' ? 'Wet roads, slight reflections, grey-blue mist, rain streaks' : state.condition === 'Sunny' ? 'Bright soft sunlight, distinct shadows' : 'Atmospheric fog or clouds'}.
    Background: ${state.style === 'Isometric' || state.style === 'Cartoonish' ? 'Clean, solid soft grey-blue or neutral light background to contrast with dark text overlay.' : 'Atmospheric background matching the scene.'}
    Important: No text on the image. High fidelity, 8k resolution.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        // No specific image config needed for flash-image other than defaults usually
      }
    });

    // Check for image part
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to generate image:", error);
    return null;
  }
};