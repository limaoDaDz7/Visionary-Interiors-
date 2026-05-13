/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  RefreshCcw, 
  Image as ImageIcon,
  MessageSquare,
  ShoppingBag,
  ArrowLeftRight,
  Download,
  Share2,
  Heart,
  Save,
  Lock,
  Unlock,
  Sun,
  Moon,
  Zap,
  CheckCircle2,
  Info
} from 'lucide-react';
import { 
  chatWithDesigner, 
  reimagineRoom, 
  detectRoomType, 
  getShoppableItems, 
  Message, 
  ShoppableItem 
} from './services/geminiService';

const STYLES = [
  { id: 'mid-century', name: 'Mid-Century Modern', icon: '🛋️', description: 'Clean lines, organic curves, and functional design.', premium: false },
  { id: 'scandinavian', name: 'Scandinavian', icon: '❄️', description: 'Minimalism, functionality, and a connection to nature.', premium: false },
  { id: 'minimalist', name: 'Minimalist', icon: '⬜', description: 'Simplicity, neutral palettes, and open spaces.', premium: false },
  { id: 'industrial', name: 'Industrial', icon: '🏭', description: 'Raw materials, exposed structures, and urban vibes.', premium: true },
  { id: 'japandi', name: 'Japandi', icon: '🎋', description: 'Japanese minimalism meets Scandinavian functionality.', premium: true },
  { id: 'luxury', name: 'Contemporary Luxury', icon: '💎', description: 'High-end materials, sophisticated palettes, and elegance.', premium: true },
  { id: 'bohemian', name: 'Bohemian', icon: '🌿', description: 'Eclectic, colorful, and full of personality.', premium: true },
  { id: 'coastal', name: 'Coastal', icon: '🌊', description: 'Light, airy, and inspired by the seaside.', premium: true },
];

const MOODS = ['Balanced', 'Cozy', 'Bright', 'Luxury', 'Warm', 'Cool'];

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [reimaginedImage, setReimaginedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [roomType, setRoomType] = useState<string | null>(null);
  const [shoppableItems, setShoppableItems] = useState<ShoppableItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPremium, setIsPremium] = useState(() => localStorage.getItem('isPremium') === 'true');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setOriginalImage(base64);
        setReimaginedImage(null);
        setShoppableItems([]);
        const detected = await detectRoomType(base64);
        setRoomType(detected);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReimagine = async () => {
    if (!originalImage) return;
    if (selectedStyle.premium && !isPremium) {
      setShowPremiumModal(true);
      return;
    }

    setIsGenerating(true);
    const result = await reimagineRoom(originalImage, selectedStyle.name, selectedMood);
    if (result) {
      setReimaginedImage(result);
      const items = await getShoppableItems(selectedStyle.name, roomType || 'Room');
      setShoppableItems(items);
    } else {
      setReimaginedImage(`https://picsum.photos/seed/${selectedStyle.id}/1200/800`);
    }
    setIsGenerating(false);
  };

  const handleSurpriseMe = () => {
    const randomStyle = STYLES[Math.floor(Math.random() * STYLES.length)];
    setSelectedStyle(randomStyle);
    handleReimagine();
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const userMsg: Message = { role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsChatting(true);

    try {
      const response = await chatWithDesigner(inputText, messages, originalImage || undefined);
      if (response) {
        setMessages(prev => [...prev, { role: 'model', text: response }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsChatting(false);
    }
  };

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  const handleUnlock = () => {
    if (unlockCode === 'Lima2406') {
      setIsPremium(true);
      localStorage.setItem('isPremium', 'true');
      setShowPremiumModal(false);
      setUnlockCode('');
    } else {
      alert('Invalid code. Please send proof of payment to +55 19 98310-3671');
    }
  };

  const handleDownload = () => {
    if (!reimaginedImage) return;
    const link = document.createElement('a');
    link.href = reimaginedImage;
    link.download = `visionary-interior-${selectedStyle.id}.png`;
    link.click();
  };

  const toggleFavorite = () => {
    if (favorites.includes(selectedStyle.id)) {
      setFavorites(favorites.filter(id => id !== selectedStyle.id));
    } else {
      setFavorites([...favorites, selectedStyle.id]);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0F0F1A] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full ${isDarkMode ? 'bg-rose-500/10' : 'bg-rose-500/5'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full ${isDarkMode ? 'bg-purple-500/10' : 'bg-purple-500/5'}`} />
      </div>

      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors ${isDarkMode ? 'border-white/5 bg-[#0F0F1A]/80' : 'border-slate-200 bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Visionary Interiors
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {!isPremium && (
              <button 
                onClick={() => setShowPremiumModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white text-sm font-bold rounded-full hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
              >
                <Zap className="w-4 h-4 fill-current" />
                Go Premium
              </button>
            )}
            {isPremium && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 text-sm font-bold rounded-full border border-green-500/20">
                <CheckCircle2 className="w-4 h-4" />
                Premium Active
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase ${
              isDarkMode ? 'bg-white/5 border-white/10 text-rose-400' : 'bg-rose-50 border-rose-100 text-rose-500'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Transformation
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1]"
          >
            Reimagine Your Space <br />
            <span className={isDarkMode ? 'text-white/40' : 'text-slate-300'}>In Seconds.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-lg max-w-xl mx-auto ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}
          >
            Upload a photo and let our AI consultant transform it. Refine every detail with natural conversation.
          </motion.p>
        </section>

        {/* Workspace */}
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Image & Styles */}
          <div className="lg:col-span-8 space-y-8">
            {/* Image Viewer */}
            <div className={`relative aspect-[16/10] rounded-3xl overflow-hidden border group transition-colors ${
              isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl'
            }`}>
              {!originalImage ? (
                <label className={`absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  isDarkMode ? 'hover:bg-white/[0.07]' : 'hover:bg-slate-50'
                }`}>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                    isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                  }`}>
                    <Upload className={`w-8 h-8 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`} />
                  </div>
                  <span className={`text-lg font-medium ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>Upload your room photo</span>
                  <span className={`text-sm mt-2 ${isDarkMode ? 'text-white/30' : 'text-slate-300'}`}>JPG, PNG up to 10MB</span>
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
              ) : (
                <div 
                  ref={sliderRef}
                  className="relative w-full h-full cursor-col-resize select-none overflow-hidden"
                  onMouseMove={(e) => isDragging && handleSliderMove(e)}
                  onTouchMove={(e) => isDragging && handleSliderMove(e)}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                  onTouchStart={() => setIsDragging(true)}
                  onTouchEnd={() => setIsDragging(false)}
                >
                  {/* Original Image */}
                  <img 
                    src={originalImage} 
                    alt="Original" 
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Reimagined Image */}
                  {reimaginedImage && (
                    <div 
                      className="absolute inset-0 w-full h-full overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <img 
                        src={reimaginedImage} 
                        alt="Reimagined" 
                        className="absolute inset-0 w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {/* Watermark for Free Users */}
                      {!isPremium && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 select-none">
                          <span className="text-6xl font-black rotate-[-45deg] border-4 border-white px-8 py-4">VISIONARY FREE</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Slider Handle */}
                  {reimaginedImage && (
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-white z-10"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center">
                        <ArrowLeftRight className="w-5 h-5 text-black" />
                      </div>
                    </div>
                  )}

                  {/* Loading Overlay */}
                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20"
                      >
                        <RefreshCcw className="w-12 h-12 text-rose-500 animate-spin mb-4" />
                        <p className="text-xl font-semibold text-white">Reimagining your space...</p>
                        <p className="text-white/40 text-sm mt-2">Gemini is analyzing and redesigning</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Controls */}
                  <div className="absolute top-6 right-6 flex gap-2 z-30">
                    <button 
                      onClick={handleDownload}
                      disabled={!reimaginedImage}
                      className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl hover:bg-black/60 transition-colors disabled:opacity-50"
                      title="Download"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl hover:bg-black/60 transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      onClick={() => setOriginalImage(null)}
                      className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl hover:bg-black/60 transition-colors"
                      title="Reset"
                    >
                      <RefreshCcw className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Labels */}
                  {reimaginedImage && (
                    <>
                      <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest z-30 text-white">
                        Original
                      </div>
                      <div className="absolute bottom-6 right-6 px-4 py-2 bg-rose-500/80 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest z-30 text-white">
                        {selectedStyle.name}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Advanced Controls */}
            <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-lg'}`}>
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">Mood Selector</label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map(mood => (
                      <button
                        key={mood}
                        onClick={() => setSelectedMood(mood)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          selectedMood === mood 
                            ? 'bg-rose-500 text-white' 
                            : isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSurpriseMe}
                    disabled={!originalImage || isGenerating}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                      isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    Surprise Me
                  </button>
                  <button
                    onClick={toggleFavorite}
                    className={`p-3 rounded-2xl border transition-all ${
                      favorites.includes(selectedStyle.id)
                        ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                        : isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(selectedStyle.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Style Carousel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Choose a Style</h3>
                {roomType && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-purple-500/20">
                    Detected: {roomType}
                  </div>
                )}
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`flex-shrink-0 w-64 p-6 rounded-2xl border transition-all text-left group relative overflow-hidden ${
                      selectedStyle.id === style.id 
                        ? 'bg-rose-500/10 border-rose-500/50 ring-1 ring-rose-500/20' 
                        : isDarkMode ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    {style.premium && !isPremium && (
                      <div className="absolute top-3 right-3">
                        <Lock className="w-4 h-4 text-rose-500/50" />
                      </div>
                    )}
                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{style.icon}</div>
                    <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                      {style.name}
                      {style.premium && <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded">PRO</span>}
                    </h4>
                    <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>{style.description}</p>
                  </button>
                ))}
              </div>
              <button
                disabled={!originalImage || isGenerating}
                onClick={handleReimagine}
                className="w-full py-5 bg-gradient-to-r from-rose-500 to-purple-600 rounded-2xl font-bold text-lg shadow-xl shadow-rose-500/20 hover:shadow-rose-500/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-white"
              >
                <Sparkles className="w-6 h-6" />
                Reimagine Now
              </button>
            </div>

            {/* Shoppable Items */}
            <AnimatePresence>
              {shoppableItems.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Shop the Look</h3>
                    <ShoppingBag className="w-5 h-5 opacity-40" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {shoppableItems.map((item, i) => (
                      <div key={i} className={`p-4 rounded-2xl border group transition-all ${
                        isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/[0.08]' : 'bg-white border-slate-200 hover:shadow-md'
                      }`}>
                        <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-slate-100">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <h4 className="font-bold text-sm line-clamp-1 mb-1">{item.name}</h4>
                        <p className="text-rose-500 font-bold text-xs mb-3">{item.price}</p>
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`block w-full py-2 rounded-lg text-center text-[10px] font-bold uppercase tracking-widest transition-colors ${
                            isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'
                          }`}
                        >
                          View Product
                        </a>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Chat Interface */}
          <div className={`lg:col-span-4 flex flex-col h-[800px] border rounded-3xl overflow-hidden ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl'
          }`}>
            <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-bold">Design Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Visionary AI</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <p className="text-sm max-w-[200px]">
                    Ask me to refine the design or find similar items for your space.
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-rose-500 text-white rounded-tr-none' 
                      : isDarkMode ? 'bg-white/10 text-white/90 rounded-tl-none border border-white/5' : 'bg-slate-100 text-slate-800 rounded-tl-none'
                  }`}>
                    {msg.text.split('\n').map((line, j) => (
                      <p key={j} className={j > 0 ? 'mt-2' : ''}>
                        {line.split(/(\[.*?\]\(.*?\))/g).map((part, k) => {
                          const match = part.match(/\[(.*?)\]\((.*?)\)/);
                          if (match) {
                            return (
                              <a 
                                key={k} 
                                href={match[2]} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-md text-rose-300 hover:bg-white/20 transition-colors font-medium"
                              >
                                <ShoppingBag className="w-3 h-3" />
                                {match[1]}
                              </a>
                            );
                          }
                          return part;
                        })}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
              {isChatting && (
                <div className="flex justify-start">
                  <div className={`p-4 rounded-2xl rounded-tl-none border flex gap-1 ${isDarkMode ? 'bg-white/10 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                    <div className="w-1.5 h-1.5 bg-rose-500/40 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-rose-500/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-rose-500/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className={`p-6 border-t ${isDarkMode ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50/50 border-slate-100'}`}>
              <div className="relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Refine the design..."
                  className={`w-full border rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-1 transition-all ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/10 focus:border-rose-500/50 focus:ring-rose-500/20' 
                      : 'bg-white border-slate-200 focus:border-rose-500/50 focus:ring-rose-500/20'
                  }`}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isChatting}
                  className="absolute right-2 top-2 bottom-2 w-10 bg-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-600 transition-colors disabled:opacity-50 active:scale-90 text-white"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Premium Modal */}
      <AnimatePresence>
        {showPremiumModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`max-w-md w-full p-8 rounded-[32px] border relative ${
                isDarkMode ? 'bg-[#1A1A2E] border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <button 
                onClick={() => setShowPremiumModal(false)}
                className="absolute top-6 right-6 opacity-40 hover:opacity-100 transition-opacity"
              >
                <RefreshCcw className="w-5 h-5 rotate-45" />
              </button>

              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-rose-500/20 rounded-3xl flex items-center justify-center mx-auto">
                  <Zap className="w-10 h-10 text-rose-500 fill-current" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black tracking-tight">Unlock Visionary Pro</h3>
                  <p className="opacity-60">Get full access to all styles, HD renders, and unlimited redesigns.</p>
                </div>

                <div className={`p-6 rounded-2xl border text-left space-y-4 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">One-time Payment</span>
                    <span className="text-2xl font-black text-rose-500">R$ 30</span>
                  </div>
                  <div className="space-y-2 text-sm opacity-60">
                    <p>🇧🇷 Envie o comprovante para: <br /><strong>+55 19 98310-3671</strong></p>
                    <p>🇺🇸 Send proof of payment to: <br /><strong>+55 19 98310-3671</strong></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={unlockCode}
                      onChange={(e) => setUnlockCode(e.target.value)}
                      placeholder="Enter Unlock Code"
                      className={`w-full py-4 px-6 rounded-2xl border focus:outline-none focus:ring-1 transition-all text-center font-bold tracking-widest ${
                        isDarkMode ? 'bg-white/5 border-white/10 focus:border-rose-500' : 'bg-slate-100 border-slate-200 focus:border-rose-500'
                      }`}
                    />
                  </div>
                  <button 
                    onClick={handleUnlock}
                    className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20"
                  >
                    Activate Now
                  </button>
                </div>
                
                <div className="w-full h-4" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className={`border-t py-12 transition-colors ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-slate-200 bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold tracking-tight">Visionary Interiors</span>
          </div>
          <p className="opacity-20 text-sm">© 2026 Visionary Interiors AI. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="opacity-40 hover:opacity-100 transition-colors text-sm">Privacy</a>
            <a href="#" className="opacity-40 hover:opacity-100 transition-colors text-sm">Terms</a>
            <a href="#" className="opacity-40 hover:opacity-100 transition-colors text-sm">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
