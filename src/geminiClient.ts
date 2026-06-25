import { GoogleGenAI, Type } from "@google/genai";

// Structured Output schema for high-precision validation, matching server.ts
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    product: {
      type: Type.STRING,
      description: "Standardized food product name (e.g., 'Medium Boiled Eggs (5x Whole)', 'Cooked Dal Tadka (200g)', 'Paneer Tikka (100g)')."
    },
    estimatedGrams: {
      type: Type.INTEGER,
      description: "The estimated total weight of the portion/quantity in grams (e.g., 250 for '5x boiled eggs', 200 for '200g dal', 100 for '100g paneer', 120 for a single medium banana)."
    },
    servingSizeName: {
      type: Type.STRING,
      description: "A short friendly descriptive name of the portion size (e.g., '5 boiled eggs', '200g Cooked Dal', '100g Paneer', '1 Medium Banana', '1 plate shown in photo')."
    },
    calories: {
      type: Type.NUMBER,
      description: "Total calories (kcal) for the entire estimated/specified portion size."
    },
    protein: {
      type: Type.NUMBER,
      description: "Total proteins in grams (g) for the entire estimated/specified portion size."
    },
    carbs: {
      type: Type.NUMBER,
      description: "Total carbohydrates in grams (g) for the entire estimated/specified portion size."
    },
    fat: {
      type: Type.NUMBER,
      description: "Total fat in grams (g) for the entire estimated/specified portion size."
    },
    sodium: {
      type: Type.NUMBER,
      description: "Total Sodium (Ion) content in milligrams (mg) for the entire estimated/specified portion size."
    },
    potassium: {
      type: Type.NUMBER,
      description: "Total Potassium (Ion) content in milligrams (mg) for the entire estimated/specified portion size."
    },
    calcium: {
      type: Type.NUMBER,
      description: "Total Calcium (Ion) content in milligrams (mg) for the entire estimated/specified portion size."
    },
    iron: {
      type: Type.NUMBER,
      description: "Total Iron (Mineral) content in milligrams (mg) for the entire estimated/specified portion size."
    },
    magnesium: {
      type: Type.NUMBER,
      description: "Total Magnesium (Mineral) content in milligrams (mg) for the entire estimated/specified portion size."
    },
    zinc: {
      type: Type.NUMBER,
      description: "Total Zinc (Mineral) content in milligrams (mg) for the entire estimated/specified portion size."
    },
    fiber: {
      type: Type.NUMBER,
      description: "Total dietary fiber in grams (g) for the entire estimated/specified portion size."
    },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of up to 4 primary ingredients or food compositions."
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2 distinct gym/bodybuilding labels (e.g. 'Lean Protein Source', 'Pre-Workout Carb')."
    },
    explanation: {
      type: Type.STRING,
      description: "An extremely brief 1-sentence fitness coach clinical note (maximum 15 words) tailored for lifters."
    },
    healthierAlternatives: {
      type: Type.ARRAY,
      description: "Exactly 2 highly optimized, healthier alternatives.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the alternative food." },
          protein: { type: Type.NUMBER, description: "Grams of protein per 100g." },
          calories: { type: Type.NUMBER, description: "Kcal of calories per 100g." },
          reason: { type: Type.STRING, description: "Actionable brief explanation under 10 words." }
        },
        required: ["name", "protein", "calories", "reason"]
      }
    }
  },
  required: [
    "product", "estimatedGrams", "servingSizeName", "calories", "protein", "carbs", "fat",
    "sodium", "potassium", "calcium", "iron", "magnesium", "zinc",
    "fiber", "ingredients", "tags", "explanation", "healthierAlternatives"
  ]
};

/**
 * Call Gemini models directly from the browser using the user's local API key
 */
export async function analyzeFoodClientSide(
  productName: string | null,
  imageBase64: string | null,
  imageMime: string | null,
  apiKey: string
) {
  // Initialize standard Google Gen AI Client
  const ai = new GoogleGenAI({ apiKey });

  const parts: any[] = [];

  if (imageBase64 && imageMime) {
    parts.push({
      inlineData: {
        mimeType: imageMime,
        data: imageBase64,
      },
    });
  }

  let textQuery = "Analyze the nutritional qualities of this food item.";
  if (productName) {
    textQuery = `Analyze the nutritional profile of this food item or fitness meal: "${productName}".`;
  }
  textQuery += " IMPORTANT: Identify the exact portion size, multiplier (such as '5x' meaning 5 times a single egg/item, '200 gram dal', '100g paneer') specified in the input text query. If a camera photo is provided, carefully inspect the photo and estimate the physical portion size shown. Do NOT standardise values to 100g. Instead, calculate the absolute total nutritional values (calories, proteins, carbs, fats, fiber, minerals, and ions) directly for the entire portion or quantity specified/estimated.";

  parts.push({ text: textQuery });

  // Tries lightweight model first, then fallbacks if needed
  const modelsToTry = ["gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-3.5-flash"];
  let modelResponse: any = null;
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[CLIENT-SIDE] Trying Gemini analysis with model: ${modelName}`);
      modelResponse = await ai.models.generateContent({
        model: modelName,
        contents: parts,
        config: {
          systemInstruction: "You are a master clinical sports nutritionist and strength-conditioning coach. Provide nutrition value breakdowns emphasizing proteins, core ions, minerals, fiber, and ingredients from food scans/names. Always calculate total nutrient/macro content for the entire portion specified (do NOT standardise to 100g). CRITICAL: Be extremely concise. Keep explanation under 15 words, and alternative reasons under 10 words. Minimize words to maximize speed.",
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.0,
        },
      });
      if (modelResponse && modelResponse.text) {
        console.log(`[CLIENT-SIDE] Success with model: ${modelName}`);
        break;
      }
    } catch (err: any) {
      console.warn(`[CLIENT-SIDE] Model ${modelName} failed:`, err.message || err);
      lastError = err;
    }
  }

  if (!modelResponse || !modelResponse.text) {
    throw lastError || new Error("Failed to generate content with any available Gemini models. Please verify your API key.");
  }

  return JSON.parse(modelResponse.text);
}
