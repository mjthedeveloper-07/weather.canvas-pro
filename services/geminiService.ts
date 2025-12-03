import { GoogleGenAI } from "@google/genai";
import { TrendingItem, WeatherCondition, WeatherState } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches trending cities/weather using Google Search Grounding.
 */
export const getTrendingWeatherCities = async (): Promise<TrendingItem[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Identify 4 major global cities that are currently experiencing notable weather (storms, heatwaves, snow, etc) or are trending in search. Return ONLY a JSON list with keys 'city' and 'reason'. The 'reason' should be a short summary.",
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are not allowed with googleSearch
      }
    });

    let text = response.text;
    if (!text) return [];
    
    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text) as TrendingItem[];
  } catch (error) {
    console.error("Failed to fetch trends:", error);
    return [];
  }
};

/**
 * Gets current weather for a specific city using Google Search Grounding.
 */
export const getCityWeatherData = async (city: string): Promise<Partial<WeatherState> | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `What is the current weather condition and temperature in ${city}? Return ONLY a JSON object with keys 'condition' (one of Sunny, Cloudy, Rain, Storm, Snow, Fog), 'temperature' (number), and 'unit' ('C' or 'F').`,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are not allowed with googleSearch
      }
    });

    let text = response.text;
    if (!text) return null;

    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(text) as Partial<WeatherState>;
  } catch (error) {
    console.error("Failed to fetch city weather:", error);
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
      contents: prompt,
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