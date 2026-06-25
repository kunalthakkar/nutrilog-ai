import React, { useState, useEffect } from "react";
// Cloud synchronization and database trigger comments
import {
  NutritionResult,
  LogEntry,
  UserSession,
} from "./types";
import InnovanceHeader from "./components/InnovanceHeader";
import InnovanceLogo from "./components/InnovanceLogo";
import NutritionSpecs from "./components/NutritionSpecs";
import HealthierAlternatives from "./components/HealthierAlternatives";
import FitnessHistoryLogs from "./components/FitnessHistoryLogs";
import {
  getUserLogsFromFirestore,
  saveLogToFirestore,
  deleteLogFromFirestore,
  syncLogsWithFirestore,
} from "./firebase";
import {
  Upload,
  Camera,
  Search,
  CheckCircle,
  HelpCircle,
  Lock,
  Smartphone,
  ShieldCheck,
  Flame,
  Activity,
  Dumbbell,
  RefreshCw,
  PlusCircle,
  Eye,
  Check,
  Sparkles,
  Gauge,
  Apple,
  Cloud,
  Wifi,
  WifiOff,
  Key,
} from "lucide-react";
import { analyzeFoodClientSide } from "./geminiClient";

export default function App() {
  // Settings & local API key states
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem("GEMINI_API_KEY") || "");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsKeyInput, setSettingsKeyInput] = useState<string>(apiKey);

  const handleSaveApiKey = (key: string) => {
    const trimmed = key.trim();
    setApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem("GEMINI_API_KEY", trimmed);
    } else {
      localStorage.removeItem("GEMINI_API_KEY");
    }
    setIsSettingsOpen(false);
  };

  // Authentication & Session States
  const [session, setSession] = useState<UserSession | null>(null);
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [otpStep, setOtpStep] = useState<boolean>(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [enteredOtp, setEnteredOtp] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [otpNotice, setOtpNotice] = useState<string>("");

  // Navigations & Views
  const [activeTab, setActiveTab] = useState<"analyze" | "logs">("analyze");

  // Analyzer Core States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imageMime, setImageMime] = useState<string>("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzerError, setAnalyzerError] = useState<string>("");

  // Camera Capture States
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>("");

  // Active result state
  const [analysisResult, setAnalysisResult] = useState<NutritionResult | null>(null);

  // Persistence Gym Logs State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [appLogsMessage, setAppLogsMessage] = useState<string>("");

  // Cloud Sync States
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced");

  // Loading indicator random status messages
  const [loadingMsg, setLoadingMsg] = useState<string>("Analyzing food nutrients...");

  const loadingTicks = [
    "Scanning amino acid peptide chains...",
    "Estimating raw calorie output...",
    "Isolating cellular electrolytes (Sodium, Potassium, Calcium)...",
    "Quantifying essential recovery minerals (Iron, Magnesium, Zinc) & Fiber...",
    "Generating professional gym coach advisory...",
    "Querying healthier alternative substitutes...",
  ];

  // Load existing session & segregated logs from Local Storage safely
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem("gym_tracker_active_user");
      if (savedSession) {
        const parsedUser = JSON.parse(savedSession) as UserSession;
        if (parsedUser && parsedUser.mobile) {
          setSession(parsedUser);
          loadLogsForUser(parsedUser.mobile);
        } else {
          localStorage.removeItem("gym_tracker_active_user");
        }
      }
    } catch (e) {
      console.error("Failed to parse saved user session:", e);
      localStorage.removeItem("gym_tracker_active_user");
    }
  }, []);

  // Update loading texts on timer while analyzing
  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      let stepIdx = 0;
      interval = setInterval(() => {
        setLoadingMsg(loadingTicks[stepIdx % loadingTicks.length]);
        stepIdx++;
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Read logs for specific logged-in user safely and sync with Firebase Firestore in the background
  const loadLogsForUser = async (mobile: string) => {
    let localLogs: LogEntry[] = [];
    const key = `nutrition_logs_${mobile}`;
    
    // 1. Immediately load local logs for instant feedback
    try {
      const savedLogs = localStorage.getItem(key);
      if (savedLogs) {
        const parsedLogs = JSON.parse(savedLogs);
        if (Array.isArray(parsedLogs)) {
          localLogs = parsedLogs;
          setLogs(parsedLogs);
        }
      }
    } catch (e) {
      console.error("Failed to load local logs:", e);
    }

    // 2. Perform background cloud sync with Firestore
    setIsSyncing(true);
    setSyncStatus("syncing");
    try {
      const consolidatedLogs = await syncLogsWithFirestore(mobile, localLogs);
      setLogs(consolidatedLogs);
      localStorage.setItem(key, JSON.stringify(consolidatedLogs));
      setSyncStatus("synced");
    } catch (error) {
      console.error("Cloud synchronization failed:", error);
      setSyncStatus("error");
    } finally {
      setIsSyncing(false);
    }
  };

  // OTP MOCK Logic
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    // 10 digits validation for India
    const cleanNum = mobileNumber.trim().replace(/\D/g, "");
    if (cleanNum.length !== 10) {
      setAuthError("Please provide a valid 10-digit Indian mobile number.");
      return;
    }

    // Generate a secure 6-digit pin
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpStep(true);
    setOtpNotice(`OTP Sent! Use testing code: ${code}`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (enteredOtp.trim() === generatedOtp) {
      const newSession: UserSession = {
        mobile: mobileNumber.trim(),
        loggedIn: true,
      };
      localStorage.setItem("gym_tracker_active_user", JSON.stringify(newSession));
      setSession(newSession);
      loadLogsForUser(newSession.mobile);

      // Clean setup values
      setMobileNumber("");
      setOtpStep(false);
      setGeneratedOtp("");
      setEnteredOtp("");
      setOtpNotice("");
    } else {
      setAuthError("Incorrect verification code. Please check the code provided above.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("gym_tracker_active_user");
    setSession(null);
    setLogs([]);
    setAnalysisResult(null);
    setImagePreviewUrl("");
    setImageBase64("");
    setImageMime("");
  };

  // Convert uploaded files to base64
  const onFileSelectHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnalyzerError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAnalyzerError("Please upload a food image file (PNG, JPEG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      const base64Content = base64Url.split(",")[1];
      setImageBase64(base64Content);
      setImageMime(file.type);
      setImagePreviewUrl(base64Url);
    };
    reader.readAsDataURL(file);
  };

  // Camera handling functions
  const startCamera = async () => {
    setCameraError("");
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setCameraStream(stream);
      // find video element and hook up
      setTimeout(() => {
        const videoElement = document.getElementById("webcam-preview") as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      }, 150);
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError(
        "Could not access your camera. Please ensure camera permissions are active or try uploading a file instead."
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    const videoElement = document.getElementById("webcam-preview") as HTMLVideoElement;
    if (!videoElement) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      }

      const base64Url = canvas.toDataURL("image/jpeg", 0.9);
      const base64Content = base64Url.split(",")[1];
      setImageBase64(base64Content);
      setImageMime("image/jpeg");
      setImagePreviewUrl(base64Url);
      
      setAnalyzerError("");
      
      // Clean up camera stream
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }
      setIsCameraActive(false);
    } catch (err) {
      console.error("Error capturing photo:", err);
      setAnalyzerError("Failed to freeze and capture the photo from the camera stream.");
    }
  };

  // Stop camera if user leaves or unmounts component
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Analyzer execution
  const executeNutritionAnalyzer = async (customQuery?: string) => {
    const query = customQuery !== undefined ? customQuery : searchQuery;
    if (!query && !imageBase64) {
      setAnalyzerError("Please capture/upload an image or type a meal name to run.");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzerError("");

    try {
      let result;

      if (apiKey) {
        // Run Gemini direct client-side analysis
        result = await analyzeFoodClientSide(
          query || null,
          imageBase64 || null,
          imageMime || null,
          apiKey
        );
      } else {
        // Fallback to Express backend (default behavior)
        let response;
        try {
          response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productName: query,
              imageBase64: imageBase64,
              imageMime: imageMime,
            }),
          });
        } catch (fetchErr) {
          throw new Error(
            "Express server is unreachable (standard for static sites like GitHub Pages). Please configure your Gemini API Key in the settings (key icon at the top right) to run scans in client-side mode."
          );
        }

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.error || "The analysis failed. Please try again.");
        }

        if (resData.success) {
          result = resData.result;
        } else {
          throw new Error("Invalid output received from clinical analyzer.");
        }
      }

      setAnalysisResult(result);

        // Auto-add log entry for whatever is searched/analyzed if logged in!
        if (session) {
          const mobile = session.mobile;

          const todayDate = new Date();
          const offset = todayDate.getTimezoneOffset();
          const localAdjusted = new Date(todayDate.getTime() - offset * 60 * 1000);
          const dateStr = localAdjusted.toISOString().split("T")[0]; // YYYY-MM-DD

          const portionSize = result.estimatedGrams || 100;
          const newLog: LogEntry = {
            id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
            userMobile: mobile,
            productName: result.product,
            timestamp: Date.now(),
            dateStr,
            calories: Math.round(result.calories),
            protein: result.protein,
            carbs: result.carbs,
            fat: result.fat,
            sodium: result.sodium,
            potassium: result.potassium,
            calcium: result.calcium,
            iron: result.iron,
            magnesium: result.magnesium,
            zinc: result.zinc,
            fiber: result.fiber,
            quantityGrams: portionSize, // estimated portion weight
          };

          setLogs((prevLogs) => {
            const updated = [newLog, ...prevLogs];
            const key = `nutrition_logs_${mobile}`;
            localStorage.setItem(key, JSON.stringify(updated));
            return updated;
          });

          // Sync to Cloud Firestore in background
          saveLogToFirestore(newLog).catch((err) => {
            console.error("Cloud save failed, local log remains saved:", err);
          });

          setAppLogsMessage(`Dynamic portion (${portionSize}g) of "${result.product}" has been auto-added to your logs!`);
          setTimeout(() => setAppLogsMessage(""), 5050);
        }
    } catch (err: any) {
      console.error(err);
      setAnalyzerError(err.message || "Something went wrong during nutrition calculations.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Meal Presets trigger
  const triggerPresetSearch = (presetName: string) => {
    setSearchQuery(presetName);
    // clear picture when manual preset selected to focus on target preset
    setImagePreviewUrl("");
    setImageBase64("");
    setImageMime("");
    executeNutritionAnalyzer(presetName);
  };

  // Substitutions action trigger (select alternative)
  const handleSelectAlternativeSubstitute = (alternativeName: string) => {
    triggerPresetSearch(alternativeName);
  };

  // Save entry in personal database logs
  const handleLogMealToHistory = (scaledResult: NutritionResult, portionGrams: number) => {
    if (!session) return;
    setAppLogsMessage("");

    const todayDate = new Date();
    const offset = todayDate.getTimezoneOffset();
    const localAdjusted = new Date(todayDate.getTime() - offset * 60 * 1000);
    const dateStr = localAdjusted.toISOString().split("T")[0]; // YYYY-MM-DD

    const newLog: LogEntry = {
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      userMobile: session.mobile,
      productName: scaledResult.product,
      timestamp: Date.now(),
      dateStr,
      calories: scaledResult.calories,
      protein: scaledResult.protein,
      carbs: scaledResult.carbs,
      fat: scaledResult.fat,
      sodium: scaledResult.sodium,
      potassium: scaledResult.potassium,
      calcium: scaledResult.calcium,
      iron: scaledResult.iron,
      magnesium: scaledResult.magnesium,
      zinc: scaledResult.zinc,
      fiber: scaledResult.fiber,
      quantityGrams: portionGrams,
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    const key = `nutrition_logs_${session.mobile}`;
    localStorage.setItem(key, JSON.stringify(updatedLogs));

    // Sync to Cloud Firestore in background
    saveLogToFirestore(newLog).catch((err) => {
      console.error("Cloud save failed, local log remains saved:", err);
    });

    // Show quick feedback
    setAppLogsMessage(`Logged ${portionGrams}g of ${scaledResult.product} successfully! Check 'Fitness Logs' tab.`);
    setTimeout(() => setAppLogsMessage(""), 5000);
  };

  // Delete logged element
  const handleDeleteLogItem = async (id: string) => {
    if (!session) return;
    const updated = logs.filter((item) => item.id !== id);
    setLogs(updated);

    const key = `nutrition_logs_${session.mobile}`;
    localStorage.setItem(key, JSON.stringify(updated));

    // Sync deletion to Cloud Firestore
    try {
      await deleteLogFromFirestore(id);
    } catch (err) {
      console.error("Cloud delete failed, local delete remains done:", err);
    }
  };

  // Simple drag-over utilities
  const [isDragOver, setIsDragOver] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setAnalyzerError("");

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const baseUrl = reader.result as string;
          setImageBase64(baseUrl.split(",")[1]);
          setImageMime(file.type);
          setImagePreviewUrl(baseUrl);
        };
        reader.readAsDataURL(file);
      } else {
        setAnalyzerError("Please upload an image file (PNG, JPEG, WEBP).");
      }
    }
  };

  // Standard Indian athlete diet presets
  const gymPresets = [
    { name: "Egg Whites (boiled)", label: "Anabolic Base" },
    { name: "Paneer (low fat)", label: "Quality Casein" },
    { name: "Chicken Breast", label: "Pure Protein" },
    { name: "Sattu Drink (2 scoops)", label: "Desi Hydrator" },
    { name: "Moong Dal Sprouts", label: "High Fiber" },
    { name: "Peanut Butter (unsweetened)", label: "Gains Fuel" },
  ];

  // Auth Screen render
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-emerald-100 selection:text-emerald-950 font-sans" id="auth-screen">
        {/* Subtle grid elements / clean gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_10%,#fff_40%,#f1f5f9_100%)] pointer-events-none" />

        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-md relative z-10 overflow-hidden">
          {/* Accent top boundary line */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-600" />

          {/* Elegant Vital brand layout */}
          <div className="flex flex-col items-center text-center mb-6">
            <h2 className="text-4xl font-black tracking-tight text-emerald-800 leading-none select-none mt-2 mb-1">
              Vital.
            </h2>
            <p className="text-sm italic font-semibold text-slate-500 select-none mb-3">
              "Eat with intention."
            </p>
            <div className="h-px w-20 bg-slate-150 my-1" />
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-3 leading-relaxed font-semibold">
              Analyze muscle-building macros, track real-time hydration, catalog mineral reserves, and get professional gym-focused substitutions.
            </p>
          </div>

          {authError && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-xs py-3 px-4 rounded-lg font-medium leading-relaxed">
              ⚠️ {authError}
            </div>
          )}

          {otpNotice && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-lg font-bold font-mono animate-pulse flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>{otpNotice}</span>
            </div>
          )}

          {!otpStep ? (
            /* First Step: Indian Mobile Login */
            <form onSubmit={handleRequestOtp} className="space-y-5" id="mobile-login-form">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Enter Indian Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none select-none text-slate-500 font-bold text-sm">
                    +91
                  </div>
                  <input
                    id="mobile-input-field"
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98765 43210"
                    value={mobileNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      if (digits.length <= 10) setMobileNumber(digits);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-14 pr-4 py-3.5 rounded-xl text-lg font-mono tracking-widest outline-none focus:border-slate-400 focus:bg-white transition-all placeholder:text-slate-300 placeholder:tracking-normal"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-mono leading-relaxed">
                  Provide your 10-digit primary India mobile number. Segregated records are secured directly under your account number.
                </p>
              </div>

              <button
                id="get-otp-btn"
                type="submit"
                className="w-full bg-slate-900 hover:bg-black text-white font-extrabold py-3.5 rounded-xl shadow-sm hover:shadow transition-all text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4.5 h-4.5" />
                Get OTP Code
              </button>
            </form>
          ) : (
            /* Second Step: Otp Input Verification */
            <form onSubmit={handleVerifyOtp} className="space-y-5" id="otp-verify-form">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between mb-4">
                <span className="text-xs text-slate-500 font-bold">Mobile Target:</span>
                <span className="text-sm text-slate-700 font-mono font-bold">+91 {mobileNumber}</span>
                <button
                  id="change-mobile-btn"
                  type="button"
                  onClick={() => {
                    setOtpStep(false);
                    setOtpNotice("");
                    setAuthError("");
                  }}
                  className="text-[10px] text-emerald-600 underline font-mono hover:text-emerald-700 font-bold"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Enter 6-Digit SMS OTP
                </label>
                <input
                  id="otp-input-field"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="000 000"
                  value={enteredOtp}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "");
                    if (cleaned.length <= 6) setEnteredOtp(cleaned);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-center py-3.5 rounded-xl text-2xl font-mono tracking-widest outline-none focus:border-slate-400 focus:bg-white transition-all placeholder:text-slate-300"
                />
              </div>

              <button
                id="verify-otp-btn"
                type="submit"
                className="w-full bg-slate-900 hover:bg-black text-white font-extrabold py-3.5 rounded-xl shadow-sm hover:shadow transition-all text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Lock className="w-4.5 h-4.5" />
                Verify & Enter Coach
              </button>
            </form>
          )}

          {/* Humble credit line under Login requested by user */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <span className="text-xs font-extrabold text-slate-700 block">
              Kunal Thakkar
            </span>
          </div>
        </div>

        {/* Brand logo situated and implemented at the bottom */}
        <div className="mt-5 relative z-10 w-40 sm:w-44 transition-all duration-300 transform hover:scale-102 opacity-80 hover:opacity-100">
          <InnovanceLogo variant="full" />
        </div>
      </div>
    );
  }

  // Calc real-time progress aggregates for today
  const todayDateStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  const todayCalories = logs
    .filter((log) => log.dateStr === todayDateStr)
    .reduce((sum, item) => sum + item.calories, 0);

  const todayProtein = Number(
    logs
      .filter((log) => log.dateStr === todayDateStr)
      .reduce((sum, item) => sum + item.protein, 0)
      .toFixed(1)
  );

  const todayFiber = Number(
    logs
      .filter((log) => log.dateStr === todayDateStr)
      .reduce((sum, item) => sum + item.fiber, 0)
      .toFixed(1)
  );

  const targets = {
    calories: 2200,
    protein: 140,
    fiber: 30,
  };

  // Active Main Dashboard Render
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-emerald-100 selection:text-emerald-950 flex flex-col justify-between font-sans">
      {/* Dynamic Header */}
      <InnovanceHeader
        userMobile={session.mobile}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        logsCount={logs.length}
        hasApiKey={!!apiKey}
        onOpenSettings={() => {
          setSettingsKeyInput(apiKey);
          setIsSettingsOpen(true);
        }}
      />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-grow">
        {activeTab === "analyze" ? (
          /* TAB 1: ANALYZER & SCANS */
          <div className="space-y-6">

            {/* Quick feedback message */}
            {appLogsMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm py-3.5 px-4 rounded-xl font-bold flex items-center gap-2.5 animate-pulse shadow-sm">
                <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span>{appLogsMessage}</span>
              </div>
            )}

            {analyzerError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs py-3.5 px-4 rounded-xl font-medium">
                ⚠️ {analyzerError}
              </div>
            )}

            {/* Today's Active Progress Tracker */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse block" />
                  <h3 className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-slate-805">
                    Today's Active Progress Tracker
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md">
                    Intake Balance on: {todayDateStr}
                  </span>
                  {/* Cloud Sync Status Indicator */}
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-mono font-bold select-none border ${
                    syncStatus === "syncing" 
                      ? "bg-amber-50 text-amber-600 border-amber-200" 
                      : syncStatus === "error" 
                      ? "bg-red-50 text-red-600 border-red-200" 
                      : "bg-emerald-50 text-emerald-600 border-emerald-200"
                  }`}>
                    <Cloud className={`w-3.5 h-3.5 ${syncStatus === "syncing" ? "animate-bounce" : ""}`} />
                    <span>
                      {syncStatus === "syncing" && "Syncing"}
                      {syncStatus === "error" && "Sync Error"}
                      {syncStatus === "synced" && "Cloud Synced"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-5">
                {/* Calories Progress Card */}
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5 sm:p-4.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span className="hidden xs:inline">Energy</span>
                      <span className="inline xs:hidden">Kcal</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-400 hidden lg:inline">Target: {targets.calories}</span>
                  </div>
                  <div className="flex items-baseline gap-0.5 mt-0.5 font-mono">
                    <span className="text-sm sm:text-2xl md:text-3xl font-black text-slate-800 leading-none">{todayCalories}</span>
                    <span className="text-[9px] sm:text-xs text-slate-400 font-bold">/{targets.calories}</span>
                  </div>
                  <div className="mt-2">
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="bg-orange-500 h-full rounded-full transition-all duration-550"
                        style={{ width: `${Math.min((todayCalories / targets.calories) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono font-semibold mt-1 hidden sm:block">
                      {Math.round((todayCalories / targets.calories) * 100)}% daily limit
                    </span>
                  </div>
                </div>

                {/* Protein Progress Card */}
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5 sm:p-4.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-505 flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="hidden xs:inline">Protein</span>
                      <span className="inline xs:hidden">Prot</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-400 hidden lg:inline">Goal: {targets.protein}g</span>
                  </div>
                  <div className="flex items-baseline gap-0.5 mt-0.5 font-mono">
                    <span className="text-sm sm:text-2xl md:text-3xl font-black text-emerald-600 leading-none">{todayProtein}g</span>
                    <span className="text-[9px] sm:text-xs text-slate-400 font-bold">/{targets.protein}g</span>
                  </div>
                  <div className="mt-2">
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-550"
                        style={{ width: `${Math.min((todayProtein / targets.protein) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-emerald-600 font-mono font-semibold mt-1 hidden sm:block">
                      {Math.round((todayProtein / targets.protein) * 100)}% proteins
                    </span>
                  </div>
                </div>

                {/* Fiber Progress Card */}
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5 sm:p-4.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-505 flex items-center gap-1">
                      <Apple className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>Fiber</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-400 hidden lg:inline">Aim: {targets.fiber}g</span>
                  </div>
                  <div className="flex items-baseline gap-0.5 mt-0.5 font-mono">
                    <span className="text-sm sm:text-2xl md:text-3xl font-black text-teal-650 leading-none">{todayFiber}g</span>
                    <span className="text-[9px] sm:text-xs text-slate-400 font-bold">/{targets.fiber}g</span>
                  </div>
                  <div className="mt-2">
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-500 h-full rounded-full transition-all duration-550"
                        style={{ width: `${Math.min((todayFiber / targets.fiber) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-teal-605 font-mono font-semibold mt-1 hidden sm:block">
                      {Math.round((todayFiber / targets.fiber) * 100)}% fiber
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Food Scan & Consult Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-sans font-black uppercase text-slate-900 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-600" />
                    Meal Digitizer & Food Photo Reader
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Capture raw plate meals or upload box product labels to analyze macros & elements
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => stopCamera()}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
                      !isCameraActive
                        ? "bg-white text-slate-950 border border-slate-200/80 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                      isCameraActive
                        ? "bg-white text-slate-950 border border-slate-200/80 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-600" /> Live Webcam
                  </button>
                </div>
              </div>

              {cameraError && (
                <div className="bg-amber-50 border border-amber-200 text-amber-850 text-xs py-2.5 px-3.5 rounded-xl font-medium leading-relaxed font-mono">
                  ⚠️ {cameraError}
                </div>
              )}

              {isCameraActive ? (
                /* Live Webcam stream block */
                <div className="bg-slate-900 rounded-xl overflow-hidden relative flex flex-col justify-end min-h-[320px] border border-slate-800 shadow-inner group">
                  <video
                    id="webcam-preview"
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Grid Target assist overlay */}
                  <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-xl pointer-events-none flex items-center justify-center">
                    <div className="w-4/5 h-3/4 border border-dashed border-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-[10px] text-white/50 font-mono tracking-widest bg-black/40 px-2.5 py-1 rounded uppercase">
                        Align food / label
                      </span>
                    </div>
                  </div>

                  {/* Controls bar over darken layer */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between gap-3 logic-webcam-controls z-30 font-mono">
                    <button
                      type="button"
                      onClick={() => stopCamera()}
                      className="bg-white/10 hover:bg-white/25 border border-white/10 text-white font-bold px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => capturePhoto()}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 active:scale-95 animate-pulse"
                    >
                      <Camera className="w-4 h-4" />
                      Capture Snapshot
                    </button>

                    <div className="w-16 hidden sm:block" />
                  </div>
                </div>
              ) : (
                /* Standard upload / preview block */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[190px] relative ${
                    isDragOver
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
                  }`}
                >
                  <input
                    id="food-file-input"
                    type="file"
                    accept="image/*"
                    onChange={onFileSelectHandler}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {imagePreviewUrl ? (
                    /* Active photo loaded */
                    <div className="space-y-3.5 py-1">
                      <img
                        src={imagePreviewUrl}
                        alt="Meal Scan Preview"
                        className="max-h-28 mx-auto rounded-lg border border-slate-200 object-cover shadow-sm"
                      />
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs text-emerald-700 font-mono font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Food Photo Loaded!
                        </span>
                        <button
                          id="reset-image-btn"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePreviewUrl("");
                            setImageBase64("");
                            setImageMime("");
                          }}
                          className="text-[10px] text-red-650 uppercase font-mono hover:underline font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Blank placeholder state */
                    <div className="space-y-2 select-none">
                      <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 mx-auto shadow-inner">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 font-sans">
                          Drag & drop a food/label photo here, or <span className="text-emerald-700 underline font-semibold">browse</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">
                          Supports PNG, JPG, WEBP camera captures or label crops
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Manual Type Box query input */}
              <div className="space-y-2">
                <label className="text-[10.5px] font-mono uppercase tracking-widest font-extrabold text-slate-400 block">
                  Confirmatory Query / Manual Search
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1 font-mono">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="search-query-field"
                      type="text"
                      placeholder="Type Indian meal name, e.g., 2 Rotis with Paneer Bhurji..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") executeNutritionAnalyzer();
                      }}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-10 pr-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm outline-none focus:border-slate-300 focus:bg-white transition-all font-mono"
                    />
                  </div>
                  <button
                    id="analyze-trigger-btn"
                    onClick={() => executeNutritionAnalyzer()}
                    disabled={isAnalyzing}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-black px-6 py-3 sm:py-3.5 rounded-xl text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Activity className="w-3.5 h-3.5" />
                        Analyze
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Loading placeholder screen */}
            {isAnalyzing && (
              <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-4" id="analyzer-loader">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin" />
                  <Activity className="w-6 h-6 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <h4 className="text-slate-800 font-bold text-sm">CALCULATING GYM METRICS...</h4>
                  <p className="text-xs text-slate-500 font-mono mt-1 w-full max-w-sm mx-auto">
                    {loadingMsg}
                  </p>
                </div>
              </div>
            )}

            {/* Results Screen Segment Block */}
            {!isAnalyzing && analysisResult && (
              <div className="animate-fade-in space-y-6" id="analysis-results">
                {/* Visual Specifications Panel */}
                <NutritionSpecs
                  data={analysisResult}
                  onLog={handleLogMealToHistory}
                  isLogging={false}
                />

                {/* Healthier Alternatives bottom scroll widget */}
                <HealthierAlternatives
                  alternatives={analysisResult.healthierAlternatives}
                  onSelectAlternative={handleSelectAlternativeSubstitute}
                  isLoadingAlt={isAnalyzing}
                />
              </div>
            )}

            {/* If no analysis active yet, show high-tech landing card */}
            {!isAnalyzing && !analysisResult && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center shadow-sm" id="empty-landing-view">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto shadow-sm">
                    <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-bold text-sm sm:text-base uppercase tracking-wider font-mono">
                      Ready to Analyze Meal Levels
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-sans">
                      Provide a food photo (labeled box or raw plate meal) or write down descriptions of what you consumed. We will resolve all macros, essential cellular ions, and trace minerals automatically.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById("food-file-input")?.click();
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-4.5 py-2.5 rounded-xl shadow-xs hover:shadow-sm transition-all uppercase tracking-wider font-mono active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Select Food Image
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Gym Presets (Indian) Helper Panel placed beautifully at the bottom of the active tab */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3" id="gym-presets-panel">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-emerald-600" /> Dynamic Gym Presets helper (Indian)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Click shortcut helper to evaluate key nutrient elements
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
                {gymPresets.map((preset, index) => (
                  <button
                    key={index}
                    id={`preset-btn-${index}`}
                    onClick={() => triggerPresetSearch(preset.name)}
                    disabled={isAnalyzing}
                    className="text-left bg-slate-50 border border-slate-200 hover:border-emerald-500/30 p-2 sm:p-2.5 rounded-xl transition-all duration-200 hover:bg-emerald-50/10 flex flex-col justify-between cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <span className="text-[11px] sm:text-xs font-extrabold text-slate-800 tracking-tight block truncate">
                      {preset.name}
                    </span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-mono text-emerald-650 font-bold mt-1 inline-block">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: DETAILED FITNESS HISTORY LOGS */
          <div className="animate-fade-in">
            <FitnessHistoryLogs logs={logs} onDeleteLog={handleDeleteLogItem} syncStatus={syncStatus} />
          </div>
        )}
      </main>

      {/* Global Footer credited to user */}
      <footer className="bg-white border-t border-slate-200 py-5 text-center shrink-0" id="global-footer">
        <div className="max-w-7xl mx-auto px-4 text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand logo situated elegant and small */}
          <div className="w-36 sm:w-40 transition-all duration-300 opacity-80 hover:opacity-100 shrink-0">
            <InnovanceLogo variant="full" />
          </div>

          <div className="text-center sm:text-right space-y-1">
            <p className="font-semibold text-slate-500 text-[11px] flex items-center justify-center sm:justify-end gap-1 flex-wrap leading-tight">
              Made by: <span className="font-bold text-slate-700">Kunal Thakkar</span>
            </p>
            <p className="text-[10px] text-slate-400 font-medium leading-normal">
              © {new Date().getFullYear()} Innovance TechLabs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-xs font-sans">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-xl relative animate-fade-in">
            <h3 className="text-sm font-sans font-black uppercase text-slate-900 mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-600" />
              Configure Gemini API Key
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              To use Vital on static hosting (like GitHub Pages) without an active Express backend, you can provide your own Gemini API key. It will be saved securely in your browser's <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">localStorage</code>.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={settingsKeyInput}
                  onChange={(e) => setSettingsKeyInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2 rounded-lg text-xs font-mono outline-none focus:border-slate-400 focus:bg-white transition-all"
                />
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed font-mono">
                  You can get a free key from the <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold">Google AI Studio console</a>.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:text-slate-800 text-[11px] font-bold font-mono rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveApiKey(settingsKeyInput)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold font-mono rounded-lg transition-colors"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
