export interface NutritionResult {
  product: string;
  calories: number; // kcal
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  // Ions
  sodium: number; // mg
  potassium: number; // mg
  calcium: number; // mg
  // Minerals
  iron: number; // mg
  magnesium: number; // mg
  zinc: number; // mg
  // Fiber
  fiber: number; // g
  ingredients: string[];
  tags: string[];
  explanation: string; // customized athletic insight
  estimatedGrams: number; // weight of the analyzed portion/serving
  servingSizeName: string; // descriptive portion size (e.g., '5 boiled eggs', '200g Dal')
  healthierAlternatives: {
    name: string;
    protein: number; // g per 100g
    calories: number; // kcal per 100g
    reason: string; // why it's a superior gym option
  }[];
}

export interface LogEntry {
  id: string;
  userMobile: string; // separates data among mock Indian phone user logins
  productName: string;
  timestamp: number; // epochs
  dateStr: string; // YYYY-MM-DD
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium: number;
  potassium: number;
  calcium: number;
  iron: number;
  magnesium: number;
  zinc: number;
  fiber: number;
  quantityGrams: number; // selected quantity in grams
}

export interface UserSession {
  mobile: string;
  loggedIn: boolean;
}
