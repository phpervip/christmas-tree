import React, { useState, Suspense, useContext, useEffect, useRef } from 'react';
import { TreeContextType, AppState, TreeContext, PointerCoords } from './types';
import Experience from './components/Experience';
import GestureInput from './components/GestureInput';
import TechEffects from './components/TechEffects';
import { AnimatePresence, motion } from 'framer-motion';

// 语言上下文
type Language = 'zh' | 'en' | 'tr';
const LanguageContext = React.createContext<{
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
}>({
  language: 'zh',
  setLanguage: () => {},
});

// --- 梦幻光标组件 ---
const DreamyCursor: React.FC<{ pointer: PointerCoords | null, progress: number }> = ({ pointer, progress }) => {
    if (!pointer) return null;
    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[200]"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: 1,
                scale: 1,
                left: `${pointer.x * 100}%`,
                top: `${pointer.y * 100}%`
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            style={{ x: "-50%", y: "-50%" }}
        >
            {/* 核心光点 */}
            <div className={`rounded-full transition-all duration-300 ${progress > 0.8 ? 'w-4 h-4 bg-emerald-400 shadow-[0_0_20px_#34d399]' : 'w-2 h-2 bg-amber-200 shadow-[0_0_15px_#fcd34d]'}`} />

            {/* 进度光环 - 魔法符文风格 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/20 animate-spin-slow"></div>

            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 -rotate-90 overflow-visible">
                <defs>
                    <linearGradient id="magicGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>
                {/* 倒计时圆环 */}
                <circle
                    cx="24" cy="24" r="20"
                    fill="none"
                    stroke="url(#magicGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 * (1 - progress)}
                    filter="url(#glow)"
                    className="transition-[stroke-dashoffset] duration-75 ease-linear"
                />
            </svg>

            {/* 粒子拖尾装饰 (CSS 动画) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-emerald-500/10 to-amber-500/10 rounded-full blur-xl animate-pulse"></div>
        </motion.div>
    );
};

// --- 祝福生成表单 ---
const BlessingForm: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [to, setTo] = useState('');
    const [from, setFrom] = useState('');
    
    // 获取语言状态
    const language = useContext(LanguageContext);

    // 根据语言获取文本
    const getText = (zh: string, en: string, tr: string) => {
        switch (language) {
            case 'en': return en;
            case 'tr': return tr;
            default: return zh;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (to.trim() && from.trim()) {
            // 生成新的URL
            const url = new URL(window.location.href);
            url.searchParams.set('to', to.trim());
            url.searchParams.set('from', from.trim());
            window.location.href = url.toString();
        }
    };

    return (
        <>
            {/* 按钮 */}
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-red-500 to-green-500 text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 cinzel"
            >
                🎁 {getText('生成祝福链接', 'Generate Blessing Link', 'Kutsal Bağlantı Oluştur')}
            </button>

            {/* 弹窗 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="bg-gradient-to-br from-red-900 to-green-900 p-8 rounded-xl shadow-2xl max-w-md w-full border-2 border-gold"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-center mb-6 cinzel text-yellow-300">
                                🎄 {getText('制作祝福链接', 'Create Blessing Link', 'Kutsal Bağlantı Oluştur')} 🎄
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-yellow-200 mb-2 cinzel">
                                        {getText('祝福对象 (To):', 'Recipient (To):', 'Alıcı (Kime):')}
                                    </label>
                                    <input
                                        type="text"
                                        value={to}
                                        onChange={(e) => setTo(e.target.value)}
                                        placeholder={getText('输入收祝福的人...', 'Enter recipient\'s name...', 'Alıcının adını girin...')}
                                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-yellow-500/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-yellow-200 mb-2 cinzel">
                                        {getText('祝福来源 (From):', 'Sender (From):', 'Gönderen (Kimden):')}
                                    </label>
                                    <input
                                        type="text"
                                        value={from}
                                        onChange={(e) => setFrom(e.target.value)}
                                        placeholder={getText('输入送祝福的人...', 'Enter sender\'s name...', 'Gönderenin adını girin...')}
                                        className="w-full px-4 py-2 rounded-lg bg-black/30 border border-yellow-500/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />
                                </div>
                                
                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                                    >
                                        {getText('取消', 'Cancel', 'İptal')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 px-4 bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white rounded-lg transition-all duration-200"
                                    >
                                        {getText('生成链接', 'Generate Link', 'Bağlantı Oluştur')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// --- 照片弹窗 ---
const PhotoModal: React.FC<{ url: string | null, onClose: () => void }> = ({ url, onClose }) => {
    if (!url) return null;
    return (
        <motion.div
            id="photo-modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8, y: 50, rotate: -5 }}
                animate={{ scale: 1, y: 0, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, y: 100 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative max-w-4xl max-h-full bg-white p-3 rounded shadow-[0_0_50px_rgba(255,215,0,0.3)] border-8 border-white"
                onClick={(e) => e.stopPropagation()}
            >
                <img src={url} alt="Memory" className="max-h-[80vh] object-contain rounded shadow-inner" />
                <div className="absolute -bottom-12 w-full text-center text-red-300/70 cinzel text-sm">
                    ❄️ Precious Moment ❄️ Tap to close
                </div>
            </motion.div>
        </motion.div>
    );
}

const AppContent: React.FC = () => {
    const { state, setState, webcamEnabled, setWebcamEnabled, pointer, hoverProgress, selectedPhotoUrl, setSelectedPhotoUrl, clickTrigger } = useContext(TreeContext) as TreeContextType;
    
    // 解析URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const toParam = urlParams.get('to');
    const fromParam = urlParams.get('from');
    
    // 语言状态
    const { language, setLanguage } = useContext(LanguageContext);
    
    // 定义支持的语言列表
    const languages = [
        { code: 'zh', name: '中文' },
        { code: 'en', name: 'English' },
        { code: 'tr', name: 'Türkçe' }
    ];
    
    // 根据语言获取文本
    const getText = (zh: string, en: string, tr: string) => {
        switch (language) {
            case 'en': return en;
            case 'tr': return tr;
            default: return zh;
        }
    };

    useEffect(() => {
        if (selectedPhotoUrl && pointer) {
            const x = pointer.x * window.innerWidth;
            const y = pointer.y * window.innerHeight;
            const element = document.elementFromPoint(x, y);
            if (element) {
                const isImage = element.tagName === 'IMG';
                const isBackdrop = element.id === 'photo-modal-backdrop';
                if (isBackdrop || isImage) setSelectedPhotoUrl(null);
            }
        }
    }, [clickTrigger]);

    return (
        <main className="relative w-full h-screen bg-black text-white overflow-hidden cursor-none">
            {/* 摄像头背景层 (z-0) */}
            {webcamEnabled && <GestureInput />}

            {/* 3D 场景层 (z-10) */}
            <div className="absolute inset-0 z-10">
                <Suspense fallback={<div className="flex items-center justify-center h-full text-red-400 cinzel animate-pulse text-2xl">🎄 Loading Christmas Magic... ❄️</div>}>
                    <Experience />
                </Suspense>
            </div>

            {/* 科技感特效层 (z-20) */}
            {webcamEnabled && <TechEffects />}

            {/* UI 层 (z-30) */}
            <div className="absolute inset-0 z-30 flex flex-col justify-between p-8">
                <header className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold cinzel text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-green-200 to-amber-100 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                            🎄 {getText('美好回忆', 'BEAUTIFUL MEMORIES', 'GÜZEL HATIRALAR')} ❄️
                        </h1>
                        <p className="text-red-400/80 cinzel tracking-widest text-sm mt-2">
                            {state === 'CHAOS' ? 
                                (toParam || fromParam ? 
                                    `✨ ${getText('亲爱的朋友', 'DEAR FRIEND', 'SEVGİLİ ARKADAŞ')} ${toParam ? ` ${toParam}` : ''} // ${getText('祝你好运气', 'WISHING YOU ALL THE BEST', 'SİZE EN İYİLERİNİ DİLERİM')}${fromParam ? ` from ${fromParam}` : ''} ✨` : 
                                    getText('✨ 散落的记忆 // 探索你的旅程 ✨', '✨ SCATTERED MEMORIES // EXPLORE YOUR JOURNEY ✨', '✨ DAĞILMIŞ HATIRALAR // YOLCULUĞUNU KEŞFET ✨')) : 
                                (toParam || fromParam ? 
                                    `🎁 ${getText('快乐之树', 'HAPPY TREE', 'NEŞELİ AĞAÇ')}${toParam ? ` to ${toParam}` : ''} // ${getText('健康和平繁荣', 'HEALTH PEACE PROSPERITY', 'SAĞLIK BARIŞ RefAH')}${fromParam ? ` from ${fromParam}` : ''} 🎁` : 
                                    getText('🎁 记忆之树 // 爱的时间线 🎁', '🎁 MEMORY TREE // TIMELINE OF LOVE 🎁', '🎁 HATIRA AĞACI // AŞK ZAMAN ÇİZELGESİ 🎁'))}
                        </p>
                    </div>
                    
                    {/* 语言选择器 */}
                    <div className="relative">
                        <button className="flex items-center space-x-1 bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                            <span>{languages.find(lang => lang.code === language)?.name || 'Language'}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        
                        {/* 下拉菜单 */}
                        <div className="absolute right-0 mt-2 w-48 bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg py-2 hidden hover:block z-50">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => setLanguage(lang.code as any)}
                                    className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-700 ${
                                        language === lang.code ? 'bg-gray-700 text-yellow-400' : ''
                                    }`}
                                >
                                    <span className="ml-2">{lang.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </header>
                
                {/* 商务合作联络方式 */}
                <div className="flex justify-center pointer-events-auto">
                    <a 
                        href="https://tech.xiuxinwenhua.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-center cinzel text-lg text-blue-300 hover:text-blue-100 underline"
                    >
                        {getText('商务合作', 'Business Cooperation', 'İş Birliği')}
                    </a>
                </div>
            </div>

            {/* 祝福生成表单 */}
            <BlessingForm />

            {/* 光标层 (z-200) */}
            <DreamyCursor pointer={pointer} progress={hoverProgress} />

            {/* 弹窗层 (z-100) */}
            <AnimatePresence>
                {selectedPhotoUrl && <PhotoModal url={selectedPhotoUrl} onClose={() => setSelectedPhotoUrl(null)} />}
            </AnimatePresence>
        </main>
    );
};

const App: React.FC = () => {
    const [state, setState] = useState<AppState>('CHAOS');
    const [rotationSpeed, setRotationSpeed] = useState<number>(0.3); // 固定基础旋转速度
    const [rotationBoost, setRotationBoost] = useState<number>(0); // 额外加速度
    const [webcamEnabled, setWebcamEnabled] = useState<boolean>(true);
    const [pointer, setPointer] = useState<PointerCoords | null>(null);
    const [hoverProgress, setHoverProgress] = useState<number>(0);
    const [clickTrigger, setClickTrigger] = useState<number>(0);
    const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
    const [panOffset, setPanOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [zoomOffset, setZoomOffset] = useState<number>(0);
    // 语言状态
    const [language, setLanguage] = useState<Language>('zh');

    return (
        <TreeContext.Provider value={{
            state, setState,
            rotationSpeed, setRotationSpeed,
            webcamEnabled, setWebcamEnabled,
            pointer, setPointer,
            hoverProgress, setHoverProgress,
            clickTrigger, setClickTrigger,
            selectedPhotoUrl, setSelectedPhotoUrl,
            panOffset, setPanOffset,
            rotationBoost, setRotationBoost,
            zoomOffset, setZoomOffset
        }}>
            <LanguageContext.Provider value={{ language, setLanguage }}>
                <AppContent />
                <BlessingForm />
            </LanguageContext.Provider>
        </TreeContext.Provider>
    );
};

export default App;