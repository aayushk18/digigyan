import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Printer, FileText, X, Trash2, ArrowRight, ArrowLeft,
    Settings, Eye, CheckCircle2, GraduationCap, BookOpen, Download, Wand2
} from 'lucide-react';



import tgData from '../../datas/tg2.json';

const TestGenerator = () => {
    const allChapters = tgData.PR_TG_DATA[0].TG_QUESTIONS.Chapter_list;
    const chapterOptions = allChapters.map(ch => ch.Chapter_name);

    const allQuestionTypes = useMemo(() => {
        const types = new Set();
        allChapters.forEach(ch => {
            ch.Questions_type.forEach(section => types.add(section.type));
        });
        return Array.from(types);
    }, [allChapters]);


    // Main View States
    const [activeChapters, setActiveChapters] = useState([]);
    const [activeFilters, setActiveFilters] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [previewMode, setPreviewMode] = useState('student');

    // Auto-Generate States
    const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
    const [autoDetails, setAutoDetails] = useState({
        testName: '', duration: '', fullMarks: '', schoolName: '', className: '', subject: ''
    });
    const [autoConfig, setAutoConfig] = useState({});

    // Mark Management State
    const [typeMarks, setTypeMarks] = useState({});

    // Standard Test Details Form State
    const [testDetails, setTestDetails] = useState({
        testName: '', duration: '', schoolName: '', className: '', subject: '', fullMarks: ''
    });

    // --- AUTO GENERATOR LOGIC ---

    // 1. Calculate available questions dynamically
    const availableQuestionsByType = useMemo(() => {
        const pool = activeChapters.length > 0
            ? allChapters.filter(ch => activeChapters.includes(ch.Chapter_name))
            : allChapters;

        const counts = {};
        pool.forEach(ch => {
            ch.Questions_type.forEach(qt => {
                if (!counts[qt.type]) counts[qt.type] = { total: 0, questions: [] };
                counts[qt.type].total += qt.Questions.length;
                qt.Questions.forEach(q => counts[qt.type].questions.push({
                    question: q, chapterName: ch.Chapter_name, questionType: qt.type
                }));
            });
        });
        return counts;
    }, [allChapters, activeChapters]);

    // 2. Safely initialize Auto Config
    useEffect(() => {
        setAutoConfig(prev => {
            const initialConfig = { ...prev };
            Object.keys(availableQuestionsByType).forEach(type => {
                if (!initialConfig[type]) {
                    initialConfig[type] = { selected: false, count: 1, mark: 1 };
                }
            });
            return initialConfig;
        });
    }, [availableQuestionsByType]);

    // 3. Auto Generate Handlers
    const handleAutoConfigChange = (type, field, value) => {
        setAutoConfig(prev => ({
            ...prev,
            [type]: { ...prev[type], [field]: value }
        }));
    };

    // FIXED: Strict immutability to ensure React detects the state change
    const handleSelectAllAutoTypes = (checked) => {
        setAutoConfig(prev => {
            const updated = {};
            Object.keys(prev).forEach(type => {
                updated[type] = { ...prev[type], selected: checked };
            });
            return updated;
        });
    };

    const calculatedAutoTotal = useMemo(() => {
        return Object.values(autoConfig).reduce((sum, conf) => {
            if (conf.selected) return sum + (conf.count * conf.mark);
            return sum;
        }, 0);
    }, [autoConfig]);

    const executeAutoGenerate = () => {
        let newlySelected = [];
        let newTypeMarks = {};

        Object.entries(autoConfig).forEach(([type, config]) => {
            if (config.selected && config.count > 0) {
                // Clone the pool to safely shuffle
                const pool = [...availableQuestionsByType[type].questions];

                // Fisher-Yates Shuffle for true randomness
                for (let i = pool.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [pool[i], pool[j]] = [pool[j], pool[i]];
                }

                newlySelected = [...newlySelected, ...pool.slice(0, parseInt(config.count))];
                newTypeMarks[type] = parseFloat(config.mark);
            }
        });

        setSelectedQuestions(newlySelected);
        setTypeMarks(newTypeMarks);
        setTestDetails({
            testName: autoDetails.testName,
            duration: autoDetails.duration,
            schoolName: autoDetails.schoolName,
            className: autoDetails.className,
            subject: autoDetails.subject,
            fullMarks: autoDetails.fullMarks
        });

        // Clear Auto Modal and immediately open Step 2 Preview
        setIsAutoModalOpen(false);
        setModalStep(2);
        setIsModalOpen(true);
    };

    // --- EXISTING LOGIC ---

    const selectedTypesSummary = useMemo(() => {
        const summary = {};
        selectedQuestions.forEach(q => {
            if (!summary[q.questionType]) summary[q.questionType] = 0;
            summary[q.questionType] += 1;
        });
        return summary;
    }, [selectedQuestions]);

    const totalMarks = useMemo(() => {
        return Object.entries(selectedTypesSummary).reduce((sum, [type, count]) => {
            const markPerQuest = typeMarks[type] || 0;
            return sum + (count * Number(markPerQuest));
        }, 0);
    }, [selectedTypesSummary, typeMarks]);

    const groupedSummary = useMemo(() => {
        const summary = {};
        selectedQuestions.forEach(item => {
            if (!summary[item.chapterName]) summary[item.chapterName] = {};
            if (!summary[item.chapterName][item.questionType]) summary[item.chapterName][item.questionType] = 0;
            summary[item.chapterName][item.questionType] += 1;
        });
        return summary;
    }, [selectedQuestions]);

    const displayedChapters = useMemo(() => {
        return allChapters
            .filter(ch => activeChapters.includes(ch.Chapter_name))
            .map(ch => ({
                ...ch,
                Questions_type: ch.Questions_type.filter(section => activeFilters.includes(section.type))
            }))
            .filter(ch => ch.Questions_type.length > 0);
    }, [allChapters, activeChapters, activeFilters]);

    useEffect(() => {
        const newTypeMarks = { ...typeMarks };
        let changed = false;
        Object.keys(selectedTypesSummary).forEach(type => {
            if (newTypeMarks[type] === undefined) {
                newTypeMarks[type] = 1;
                changed = true;
            }
        });
        if (changed) setTypeMarks(newTypeMarks);
    }, [selectedTypesSummary]);

    const toggleChapter = (chapterName) => setActiveChapters(prev => prev.includes(chapterName) ? prev.filter(c => c !== chapterName) : [...prev, chapterName]);
    const toggleFilter = (type) => setActiveFilters(prev => prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type]);

    const toggleQuestionSelection = (question, chapterName, questionType) => {
        setSelectedQuestions(prev => {
            const isAlreadySelected = prev.some(item => item.question === question);
            if (isAlreadySelected) return prev.filter(item => item.question !== question);
            return [...prev, { question, chapterName, questionType }];
        });
    };

    const handleTypeMarkChange = (type, value) => setTypeMarks(prev => ({ ...prev, [type]: value }));
    const handleDetailsChange = (e) => setTestDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleAutoDetailsChange = (e) => setAutoDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));


    const handleDownloadPDF = async () => {
        const html2pdf = (await import('html2pdf.js')).default;
        const originalElement = document.getElementById('paper-content');

        if (!originalElement) return console.error("Paper content not found!");

        const elementClone = originalElement.cloneNode(true);
        const images = elementClone.getElementsByTagName('img');

        const convertImageToBase64 = (imgElement) => {
            return new Promise((resolve) => {
                if (imgElement.src.startsWith('data:image')) return resolve();
                const tempImage = new Image();
                tempImage.crossOrigin = 'Anonymous';
                tempImage.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = tempImage.naturalWidth || tempImage.width;
                    canvas.height = tempImage.naturalHeight || tempImage.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(tempImage, 0, 0);
                    try { imgElement.src = canvas.toDataURL('image/png'); } catch (e) { }
                    resolve();
                };
                tempImage.onerror = resolve;
                tempImage.src = imgElement.src;
            });
        };

        await Promise.all(Array.from(images).map(convertImageToBase64));

        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `${testDetails.testName || 'Test_Paper'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                onclone: (clonedDoc) => {
                    clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach(s => s.remove());
                    const clonedPaper = clonedDoc.getElementById('paper-content');
                    if (clonedPaper) {
                        clonedPaper.style.backgroundColor = '#ffffff';
                        clonedPaper.style.color = '#000000';
                    }
                }
            },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(elementClone).save();
    };

    const handleDownloadWord = async () => {
        const originalElement = document.getElementById('paper-content');
        if (!originalElement) return;

        const elementClone = originalElement.cloneNode(true);
        const images = elementClone.getElementsByTagName('img');

        const convertImageToBase64 = (imgElement) => {
            return new Promise((resolve) => {
                if (imgElement.src.startsWith('data:image')) return resolve();
                const tempImage = new Image();
                tempImage.crossOrigin = 'Anonymous';
                tempImage.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = tempImage.naturalWidth || tempImage.width;
                    canvas.height = tempImage.naturalHeight || tempImage.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(tempImage, 0, 0);
                    try { imgElement.src = canvas.toDataURL('image/png'); } catch (e) { }
                    resolve();
                };
                tempImage.onerror = resolve;
                tempImage.src = imgElement.src;
            });
        };

        await Promise.all(Array.from(images).map(convertImageToBase64));

        const content = elementClone.outerHTML;
        const sourceHTML = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="utf-8"><title>${testDetails.testName || 'Test Paper'}</title>
            <style>body { font-family: Arial, sans-serif; color: black; background: white; } table { border-collapse: collapse; } img { max-width: 100%; height: auto; }</style>
            </head><body>${content}</body></html>
        `;

        const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/vnd.ms-word;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${testDetails.testName || 'Test_Paper'}.doc`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 100);
    };

    const isAutoDetailsValid = useMemo(() => {
        return (
            autoDetails.testName.trim() !== '' &&
            autoDetails.duration.trim() !== '' &&
            autoDetails.schoolName.trim() !== '' &&
            autoDetails.className.trim() !== '' &&
            autoDetails.subject.trim() !== '' &&
            calculatedAutoTotal > 0
        );
    }, [autoDetails, calculatedAutoTotal]);
    // --- VALIDATION LOGIC ---
    const isTestDetailsValid = useMemo(() => {
        return (
            testDetails.testName.trim() !== '' &&
            testDetails.duration.trim() !== '' &&
            testDetails.schoolName.trim() !== '' &&
            testDetails.className.trim() !== '' &&
            testDetails.subject.trim() !== ''
        );
    }, [testDetails]);



    // --- MATCH SHUFFLE LOGIC ---
    const shuffledMatchAnswers = useMemo(() => {
        const matches = {};
        Object.entries(groupedSummary).forEach(([chapter, types]) => {
            Object.keys(types).forEach(type => {
                if (type.toLowerCase().includes('match')) {
                    // Collect all answers for this specific Chapter + Type group
                    const pool = selectedQuestions
                        .filter(q => q.chapterName === chapter && q.questionType === type)
                        .map(q => q.question.Answer);

                    // Fisher-Yates Shuffle for true randomness
                    for (let i = pool.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [pool[i], pool[j]] = [pool[j], pool[i]];
                    }

                    // Store the shuffled array with a unique key
                    matches[`${chapter}-${type}`] = pool;
                }
            });
        });
        return matches;
    }, [selectedQuestions, groupedSummary]);



    return (
        <div className="min-h-screen bg-[#F0F4FF] p-4 md:p-8 font-['Nunito',_sans-serif] text-[#2D3436] print:bg-white print:p-0">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
                
                /* EXTREME STICKER CLASSES */
                .sticker-card { 
                    background: white; border-radius: 40px; border: 6px solid white; 
                    box-shadow: 0 20px 40px rgba(108, 92, 231, 0.08); 
                    transition: transform 0.3s, box-shadow 0.3s; 
                }
                .sticker-card:hover { 
                    box-shadow: 0 25px 50px rgba(108, 92, 231, 0.15); 
                }
                
                .bouncy-btn { 
                    font-weight: 900; border: 4px solid white; border-radius: 25px; 
                    cursor: pointer; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                    display: inline-flex; align-items: center; justify-content: center; gap: 8px; 
                    box-shadow: 0 8px 15px rgba(0,0,0,0.1); outline: none;
                }
                .bouncy-btn:hover:not(:disabled) { transform: scale(1.05) rotate(-2deg); box-shadow: 0 12px 20px rgba(0,0,0,0.15); }
                .bouncy-btn:active:not(:disabled) { transform: scale(0.95); }
                .bouncy-btn:disabled { opacity: 0.6; filter: grayscale(1); cursor: not-allowed; box-shadow: none; }
                
                .chunky-input { 
                    width: 100%; padding: 15px 20px; border-radius: 20px; border: 4px solid transparent; 
                    background: #F8F9FF; font-weight: 800; color: #2D3436; transition: all 0.3s; 
                    outline: none; box-shadow: 0 5px 15px rgba(0,0,0,0.03); 
                }
                .chunky-input:focus { 
                    border-color: #FFD93D; transform: scale(1.02); background: white;
                    box-shadow: 0 10px 25px rgba(255, 217, 61, 0.15); 
                }

                .floating { animation: floating 3s ease-in-out infinite; }
                @keyframes floating { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

                /* Custom Scrollbar for sidebars */
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #E0DAFF; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #6C5CE7; }
            `}</style>

            {/* ---------------- MAIN VIEW ---------------- */}
            <div className="print:hidden">
                <motion.header
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    // Replaced card classes with full-width sticky topbar classes
                    className="sticky top-0 z-50 w-full mb-10 flex flex-col rounded-b-[50px] md:flex-row items-center justify-between px-6 py-5 md:px-10 border-b-[8px] border-white"
                    style={{
                        background: "#714dffff", // Vibrant, beautiful blue
                        boxShadow: "0 15px 30px rgba(77, 150, 255, 0.25)",
                        margin: "-16px -16px 30px -16px", // Pulls it flush to the edges if your parent has padding
                        '@media (min-width: 768px)': {
                            margin: "-32px -32px 40px -32px" // Adjusts for desktop padding
                        }
                    }}
                >
                    <div className="flex flex-col items-center md:items-start mb-4 md:mb-0 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-3 leading-none">
                            <span className="floating drop-shadow-md">📝</span> Question Bank
                        </h1>
                        <p className="font-bold text-[14px] md:text-[16px] mt-2 text-[#EBF4FF] tracking-wide uppercase drop-shadow-sm">
                            Select magic questions to build your paper! ✨
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-end gap-4 w-full md:w-auto">
                        {activeChapters.length > 0 && (
                            <button
                                onClick={() => setIsAutoModalOpen(true)}
                                className="bouncy-btn group"
                                style={{
                                    background: "#FFD93D",
                                    color: "#2D3436",
                                    padding: "14px 28px",
                                    fontSize: "16px",
                                    border: "4px solid white",
                                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
                                }}
                            >
                                <Wand2 size={22} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
                                Auto Generate
                            </button>
                        )}

                        <button
                            onClick={() => { setModalStep(1); setIsModalOpen(true); }}
                            disabled={selectedQuestions.length === 0}
                            className="bouncy-btn"
                            style={{
                                background: selectedQuestions.length > 0 ? "white" : "rgba(255,255,255,0.2)", // White when active
                                color: selectedQuestions.length > 0 ? "#4D96FF" : "rgba(255,255,255,0.7)", // Blue text to match topbar
                                padding: "14px 28px",
                                fontSize: "16px",
                                borderColor: selectedQuestions.length > 0 ? "white" : "transparent",
                                boxShadow: selectedQuestions.length > 0 ? "0 10px 20px rgba(0,0,0,0.1)" : "none"
                            }}
                        >
                            <FileText size={20} strokeWidth={3} />
                            Manual Paper ({selectedQuestions.length})
                        </button>
                    </div>
                </motion.header>

                <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* --- SIDEBAR FILTERS --- */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Selected Questions Panel */}
                        <div className="sticker-card flex flex-col max-h-[400px]">
                            <div className="flex items-center px-5 justify-between mb-4">
                                <h2 className="text-2xl  font-black tracking-tight">Questions ({selectedQuestions.length})</h2>
                                {selectedQuestions.length > 0 && (
                                    <button onClick={() => setSelectedQuestions([])} className="text-xs font-black text-[#FF6B6B] hover:text-red-700 bg-[#FFF0F0] px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors">
                                        <Trash2 size={14} /> Clear All
                                    </button>
                                )}
                            </div>
                            <div className="overflow-y-auto pr-2 -mr-2 space-y-3 flex-1">
                                {selectedQuestions.length === 0 ? (
                                    <div className="text-center py-10">
                                        <span className="text-4xl opacity-50 mb-2 block floating">🗑️</span>
                                        <div className="text-[15px] text-[#A29BFE] font-bold">Your cart is empty.</div>
                                    </div>
                                ) : (
                                    <AnimatePresence>
                                        {selectedQuestions.map((item, idx) => (
                                            <motion.div
                                                key={`selected-${idx}`} initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                                className="flex items-start gap-3 p-4 bg-[#F8F9FF] border-[3px] border-[#E0DAFF] shadow-sm rounded-[25px] group hover:border-[#6C5CE7] transition-all"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] uppercase font-black text-white bg-[#6C5CE7] px-2 py-1 rounded-[10px] inline-block mb-2 tracking-wider truncate max-w-full shadow-sm">
                                                        {item.chapterName.split('.')[0]} • {item.questionType}
                                                    </p>
                                                    <div className="text-sm font-bold text-[#2D3436] line-clamp-2 [&_img]:h-8 [&_img]:w-auto [&_img]:inline-block [&_img]:ml-1" dangerouslySetInnerHTML={{ __html: item.question.Title }} />
                                                </div>
                                                <button onClick={() => toggleQuestionSelection(item.question, item.chapterName, item.questionType)} className="text-[#A29BFE] hover:text-white hover:bg-[#FF6B6B] p-2 rounded-xl transition-colors"><X size={16} strokeWidth={3} /></button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>

                        {/* Chapters Panel */}
                        <div className="sticker-card">
                            <div className="flex items-center justify-between px-5 mb-5 border-b-[3px] border-dashed border-[#F0F4FF] pb-3">
                                <h2 className="text-2xl font-black tracking-tight">Chapters 📖</h2>
                                <button onClick={() => setActiveChapters(chapterOptions)} className="text-[13px] text-[#6C5CE7] bg-[#E0DAFF] px-3 py-1 rounded-full font-black hover:bg-[#6C5CE7] hover:text-white transition-colors">Select All</button>
                            </div>
                            <div className="flex flex-col gap-4 max-h-60 overflow-y-auto pr-2">
                                {chapterOptions.map(chapter => (
                                    <label key={chapter} className="flex items-start gap-3 cursor-pointer group bg-[#F8F9FF] p-3 rounded-[20px] border-[3px] border-transparent hover:border-[#FFD93D] transition-all">
                                        <input type="checkbox" checked={activeChapters.includes(chapter)} onChange={() => toggleChapter(chapter)} className="mt-1 w-6 h-6 accent-[#6C5CE7] cursor-pointer" />
                                        <span className="text-[15px] font-bold text-[#636E72] group-hover:text-[#2D3436]">{chapter}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Question Types Panel */}
                        <div className="sticker-card">
                            <div className="flex items-center justify-between px-5 mb-5 border-b-[3px] border-dashed border-[#F0F4FF] pb-3">
                                <h2 className="text-2xl font-black tracking-tight">Types 🧩</h2>
                                <button onClick={() => setActiveFilters(allQuestionTypes)} className="text-[13px] text-[#6C5CE7] bg-[#E0DAFF] px-3 py-1 rounded-full font-black hover:bg-[#6C5CE7] hover:text-white transition-colors">Select All</button>
                            </div>
                            <div className="flex flex-col gap-4 max-h-60 overflow-y-auto pr-2">
                                {allQuestionTypes.map(option => (
                                    <label key={option} className="flex items-center gap-3 cursor-pointer group bg-[#F8F9FF] p-3 rounded-[20px] border-[3px] border-transparent hover:border-[#55EFC4] transition-all">
                                        <input type="checkbox" checked={activeFilters.includes(option)} onChange={() => toggleFilter(option)} className="w-6 h-6 accent-[#55EFC4] cursor-pointer" />
                                        <span className="text-[15px] font-bold text-[#636E72] group-hover:text-[#2D3436]">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- MAIN QUESTION AREA --- */}
                    <div className="lg:col-span-8 sticker-card !p-8 md:!p-12 !border-8">
                        {displayedChapters.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="floating text-7xl mb-4">🧐</div>
                                <h2 className="text-2xl font-black text-[#2D3436]">No Magic Found!</h2>
                                <p className="text-[#6C5CE7] font-bold mt-2">Please select at least one Chapter and Question Type.</p>
                            </div>
                        ) : (
                            displayedChapters.map((chapter) => (
                                <div key={chapter.Chapter_name} className="mb-14">
                                    <div className="bg-[#E0DAFF] p-5 rounded-[25px] mb-8 border-4 border-white shadow-md inline-block">
                                        <h2 className="text-2xl font-black tracking-tight text-[#6C5CE7] m-0 leading-none">📂 {chapter.Chapter_name}</h2>
                                    </div>
                                    {chapter.Questions_type.map((section) => {
                                        const isMatch = section.type.toLowerCase().includes('match');
                                        return (
                                            <div key={section.type} className="mb-10 pl-2">
                                                <h3 className="text-xl font-black tracking-tight mb-6 pb-2 border-b-4 border-dashed border-[#F0F4FF] text-[#2D3436] inline-block">
                                                    🧩 {section.type}
                                                </h3>
                                                <div className="space-y-5">
                                                    {section.Questions.map((q, qIdx) => {
                                                        const isSelected = selectedQuestions.some(item => item.question === q);
                                                        return (
                                                            <div
                                                                key={qIdx}
                                                                onClick={() => toggleQuestionSelection(q, chapter.Chapter_name, section.type)}
                                                                className={`relative p-6 rounded-[30px] transition-all cursor-pointer border-4 ${isSelected ? 'border-[#FFD93D] bg-[#FFF9E6] shadow-[0_10px_20px_rgba(255,217,61,0.15)] transform scale-[1.01]' : 'border-transparent hover:border-[#E0DAFF] hover:bg-[#F8F9FF]'}`}
                                                            >
                                                                <div className="absolute left-5 top-7">
                                                                    <input type="checkbox" checked={isSelected} readOnly className="w-6 h-6 accent-[#FFD93D] border-2 border-white rounded cursor-pointer pointer-events-none shadow-sm" />
                                                                </div>
                                                                <div className="pl-12">
                                                                    <p className="text-[13px] font-black text-[#A29BFE] mb-2 uppercase tracking-wide">{q.Header}</p>
                                                                    <div className="text-[17px] font-bold text-[#2D3436] leading-relaxed flex items-start gap-3 [&_img]:max-w-full [&_img]:rounded-xl [&_img]:mt-2 [&_img]:border-4 [&_img]:border-white [&_img]:shadow-sm">
                                                                        <span className="bg-white text-[#2D3436] px-2.5 py-1 rounded-[10px] shadow-sm font-black border-2 border-[#F0F4FF]">{qIdx + 1}.</span>
                                                                        <div className={isMatch ? "flex flex-wrap items-center gap-12 mt-1" : "mt-1"}>
                                                                            <div dangerouslySetInnerHTML={{ __html: q.Title }} />
                                                                            {isMatch && q.Answer !== "Not Available" && <div dangerouslySetInnerHTML={{ __html: q.Answer }} />}
                                                                        </div>
                                                                    </div>

                                                                    {q.Option && (
                                                                        <div className="mt-4 text-[#636E72] font-bold pl-4 border-l-[4px] border-[#E0DAFF] bg-white p-3 rounded-2xl">
                                                                            {q.Option.split('|').map((opt, oIdx) => <div key={oIdx} className="py-1 flex items-center gap-2"><span className="w-2 h-2 bg-[#6C5CE7] rounded-full"></span>{opt.trim()}</div>)}
                                                                        </div>
                                                                    )}

                                                                    {!isMatch && q.Answer !== "Not Available" && (
                                                                        <div className="mt-5 pt-4 border-t-[3px] border-dashed border-[#E0DAFF] flex items-start gap-3">
                                                                            <span className="bg-[#55EFC4] text-[#00b894] px-3 py-1 rounded-[12px] text-[11px] font-black mt-0.5 uppercase tracking-wider border-2 border-white shadow-sm">Answer</span>
                                                                            <div className="text-[15px] text-[#2D3436] font-bold [&_img]:max-h-32 [&_img]:rounded-xl [&_img]:border-4 [&_img]:border-white [&_img]:shadow-sm" dangerouslySetInnerHTML={{ __html: q.Answer }} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>

            {/* ---------------- NEW AUTO GENERATE MODAL ---------------- */}
            <AnimatePresence>
                {isAutoModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3436]/60 backdrop-blur-md p-4 md:p-8 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#F0F4FF] rounded-[50px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col border-[8px] border-white"
                        >
                            <div className="flex items-center justify-between p-6 md:p-8 bg-[#FFD93D] border-b-4 border-white">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2 rounded-[15px] shadow-sm"><Wand2 className="text-[#D6A317]" size={28} /></div>
                                    <h2 className="text-3xl font-black text-[#2D3436] tracking-tight">Auto Magic 🪄</h2>
                                </div>
                                <button onClick={() => setIsAutoModalOpen(false)} className="bg-white/50 hover:bg-white text-[#D6A317] p-2 rounded-[15px] transition-colors shadow-sm"><X size={24} strokeWidth={3} /></button>
                            </div>

                            <div className="p-6 md:p-10 overflow-y-auto max-h-[65vh]">
                                <div className="space-y-8">

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <input type="text" name="testName" placeholder="Test Name 📝" value={autoDetails.testName} onChange={handleAutoDetailsChange} className="chunky-input" />
                                        <input type="text" name="duration" placeholder="Duration ⏱️" value={autoDetails.duration} onChange={handleAutoDetailsChange} className="chunky-input" />
                                        <div className="relative">
                                            <input type="text" name="fullMarks" placeholder="Full Marks 💯" value={autoDetails.fullMarks} onChange={handleAutoDetailsChange} className="chunky-input pr-24" />
                                            {calculatedAutoTotal > 0 && (
                                                <span className="absolute right-4 top-3.5 text-[11px] font-black text-white bg-[#6C5CE7] px-3 py-1.5 rounded-full shadow-sm border-2 border-white">Calc: {calculatedAutoTotal}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-black text-[#2D3436] mb-4 flex justify-between items-end border-b-[3px] border-dashed border-[#E0DAFF] pb-3">
                                            <span>Blueprint Details 🏗️</span>
                                            <span className="text-[11px] font-black text-[#6C5CE7] bg-[#E0DAFF] px-4 py-1.5 rounded-full border-2 border-white shadow-sm uppercase tracking-wider">
                                                {activeChapters.length > 0 ? 'Selected Chapters' : 'All Chapters'}
                                            </span>
                                        </h3>

                                        <div className="bg-white border-[4px] border-white rounded-[30px] overflow-hidden shadow-[0_10px_30px_rgba(108,92,231,0.08)]">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-[#F8F9FF] border-b-[4px] border-white">
                                                    <tr>
                                                        <th className="p-5 text-center w-16">
                                                            <input type="checkbox" className="w-6 h-6 accent-[#6C5CE7] cursor-pointer" onChange={(e) => handleSelectAllAutoTypes(e.target.checked)} />
                                                        </th>
                                                        <th className="p-5 text-[12px] font-black text-[#A29BFE] uppercase tracking-widest">Question Type</th>
                                                        <th className="p-5 text-[12px] font-black text-[#A29BFE] uppercase tracking-widest text-center w-32">Qty</th>
                                                        <th className="p-5 text-[12px] font-black text-[#A29BFE] uppercase tracking-widest text-center w-32">Marks/Q</th>
                                                        <th className="p-5 text-[12px] font-black text-[#A29BFE] uppercase tracking-widest text-right w-24">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y-[4px] divide-white">
                                                    {Object.entries(availableQuestionsByType).map(([type, data]) => {
                                                        const conf = autoConfig[type] || { selected: false, count: 1, mark: 1 };
                                                        return (
                                                            <tr key={type} className={`transition-colors ${conf.selected ? 'bg-[#FFF9E6]' : 'bg-[#F0F4FF] hover:bg-[#E0DAFF]/30'}`}>
                                                                <td className="p-5 text-center">
                                                                    <input
                                                                        type="checkbox" checked={conf.selected}
                                                                        onChange={(e) => handleAutoConfigChange(type, 'selected', e.target.checked)}
                                                                        className="w-6 h-6 accent-[#FFD93D] cursor-pointer"
                                                                    />
                                                                </td>
                                                                <td className="p-5">
                                                                    <span className="font-black text-[#2D3436] text-[15px]">{type}</span>
                                                                    <span className="ml-3 text-[11px] font-bold text-white bg-[#A29BFE] px-2 py-1 rounded-full">{data.total} avail</span>
                                                                </td>
                                                                <td className="p-5">
                                                                    <select
                                                                        disabled={!conf.selected} value={conf.count}
                                                                        onChange={(e) => handleAutoConfigChange(type, 'count', Number(e.target.value))}
                                                                        className="w-full px-3 py-2 rounded-[12px] bg-white border-[3px] border-transparent focus:border-[#FFD93D] disabled:bg-gray-200 outline-none font-black text-[#2D3436] cursor-pointer shadow-sm"
                                                                    >
                                                                        {Array.from({ length: data.total }, (_, i) => i + 1).map(num => (
                                                                            <option key={num} value={num}>{num}</option>
                                                                        ))}
                                                                    </select>
                                                                </td>
                                                                <td className="p-5">
                                                                    <input
                                                                        type="number" min="0.5" step="0.5"
                                                                        disabled={!conf.selected} value={conf.mark}
                                                                        onChange={(e) => handleAutoConfigChange(type, 'mark', Number(e.target.value))}
                                                                        className="w-full text-center px-3 py-2 rounded-[12px] bg-white border-[3px] border-transparent focus:border-[#FFD93D] disabled:bg-gray-200 outline-none font-black text-[#2D3436] shadow-sm"
                                                                    />
                                                                </td>
                                                                <td className="p-5 text-right font-black text-xl text-[#6C5CE7]">
                                                                    {conf.selected ? (conf.count * conf.mark) : 0}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-black text-[#2D3436] mb-4 border-b-[3px] border-dashed border-[#E0DAFF] pb-3">School Tags 🏫</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                            <input type="text" name="schoolName" placeholder="School Name" value={autoDetails.schoolName} onChange={handleAutoDetailsChange} className="chunky-input md:col-span-3" />
                                            <input type="text" name="className" placeholder="Class" value={autoDetails.className} onChange={handleAutoDetailsChange} className="chunky-input" />
                                            <input type="text" name="subject" placeholder="Subject" value={autoDetails.subject} onChange={handleAutoDetailsChange} className="chunky-input md:col-span-2" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 bg-white flex justify-between items-center border-t-4 border-[#F0F4FF]">
                                <button onClick={() => setIsAutoModalOpen(false)} className="px-6 py-3 text-[#A29BFE] font-black hover:bg-[#F0F4FF] rounded-[20px] transition-colors">Cancel</button>
                                <button
                                    onClick={executeAutoGenerate}
                                    disabled={!isAutoDetailsValid}
                                    className="bouncy-btn"
                                    style={{
                                        background: !isAutoDetailsValid ? "#E0DAFF" : "#6C5CE7",
                                        color: "white",
                                        padding: "14px 30px",
                                        fontSize: "16px"
                                    }}
                                >
                                    Create Magic ✨ <ArrowRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ---------------- EXISTING MODAL OVERLAY (Manual Step 1 / Step 2 Preview) ---------------- */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D3436]/60 backdrop-blur-md p-4 md:p-8 print:p-0 print:bg-white print:block overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#F0F4FF] rounded-[50px] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-full border-[8px] border-white print:shadow-none print:max-w-none print:rounded-none print:border-none"
                        >
                            <div className="flex items-center justify-between p-6 md:p-8 bg-[#6C5CE7] border-b-4 border-white print:hidden">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2 rounded-[15px] shadow-sm">
                                        {modalStep === 1 ? <Settings className="text-[#6C5CE7]" size={28} /> : <Eye className="text-[#6C5CE7]" size={28} />}
                                    </div>
                                    <h2 className="text-3xl font-black text-white tracking-tight">
                                        {modalStep === 1 ? 'Configure Paper' : 'Paper Preview  '}
                                    </h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="bg-white/20 hover:bg-white text-white hover:text-[#6C5CE7] p-2 rounded-[15px] transition-colors shadow-sm"><X size={24} strokeWidth={3} /></button>
                            </div>

                            <div className="p-6 md:p-10 overflow-y-auto flex-1 print:p-0">

                                {modalStep === 1 && (
                                    <div className="space-y-10 animate-in fade-in duration-300">
                                        <div>
                                            <h3 className="text-xl font-black text-[#2D3436] mb-4 flex items-center gap-2 border-b-[3px] border-dashed border-[#E0DAFF] pb-3">
                                                <span className="text-2xl">🛍️</span> Your Selection
                                            </h3>
                                            <div className="bg-white rounded-[30px] p-6 border-[4px] border-white shadow-[0_10px_30px_rgba(108,92,231,0.08)]">
                                                {Object.entries(groupedSummary).map(([chap, types]) => (
                                                    <div key={chap} className="mb-6 last:mb-0 bg-[#F8F9FF] p-4 rounded-[20px] border-2 border-[#E0DAFF]">
                                                        <h4 className="font-black text-[#6C5CE7] mb-3 text-lg">📂 {chap}</h4>
                                                        <div className="flex flex-wrap gap-3">
                                                            {Object.entries(types).map(([type, count]) => (
                                                                <span key={type} className="text-[14px] bg-white border-2 border-[#FFD93D] text-[#2D3436] px-4 py-2 rounded-[15px] font-bold shadow-sm">
                                                                    {type}: <strong className="text-[#6C5CE7] text-[16px] ml-1">{count} Qs</strong>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <h3 className="text-xl font-black text-[#2D3436] mb-4 border-b-[3px] border-dashed border-[#E0DAFF] pb-3">Title & Time ⏳</h3>
                                                <div className="space-y-5">
                                                    <input type="text" name="testName" placeholder="Test Name * " value={testDetails.testName} onChange={handleDetailsChange} className="chunky-input" />
                                                    <input type="text" name="duration" placeholder="Duration (e.g. 2 Hours)" value={testDetails.duration} onChange={handleDetailsChange} className="chunky-input" />
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-black text-[#2D3436] mb-4 border-b-[3px] border-dashed border-[#E0DAFF] pb-3">Assign Marks 💯</h3>
                                                <div className="bg-white border-[4px] border-white rounded-[30px] overflow-hidden shadow-[0_10px_30px_rgba(108,92,231,0.08)]">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="bg-[#F8F9FF] border-b-[4px] border-white">
                                                            <tr>
                                                                <th className="p-4 text-[12px] font-black text-[#A29BFE] uppercase tracking-widest">Question Type</th>
                                                                <th className="p-4 text-[12px] font-black text-[#A29BFE] uppercase tracking-widest text-center">Qty</th>
                                                                <th className="p-4 text-[12px] font-black text-[#A29BFE] uppercase tracking-widest w-32 text-center">Marks/Q</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y-[4px] divide-white">
                                                            {Object.entries(selectedTypesSummary).map(([type, count]) => (
                                                                <tr key={type} className="bg-[#F0F4FF] hover:bg-[#E0DAFF]/30 transition-colors">
                                                                    <td className="p-4"><span className="font-black text-[#2D3436] text-[14px]">{type}</span></td>
                                                                    <td className="p-4 text-center"><span className="text-white bg-[#A29BFE] px-3 py-1 rounded-full font-black text-[12px] shadow-sm">{count}</span></td>
                                                                    <td className="p-4">
                                                                        <input type="number" min="0.5" step="0.5" value={typeMarks[type] || ''} onChange={(e) => handleTypeMarkChange(type, e.target.value)} className="w-full text-center px-3 py-2 rounded-[12px] bg-white border-[3px] border-transparent focus:border-[#FFD93D] outline-none font-black text-[#6C5CE7] shadow-sm" />
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    <div className="bg-[#FFD93D] p-5 flex justify-between items-center border-t-[4px] border-white">
                                                        <span className="text-[#2D3436] font-black text-[14px] uppercase tracking-widest">Total Paper Marks</span>
                                                        <span className="text-4xl font-black text-[#2D3436] bg-white px-4 py-1 rounded-[15px] shadow-sm border-2 border-white">{totalMarks}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-black text-[#2D3436] mb-4 border-b-[3px] border-dashed border-[#E0DAFF] pb-3">School Tags 🏫</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                <input type="text" name="schoolName" placeholder="School Name" value={testDetails.schoolName} onChange={handleDetailsChange} className="chunky-input md:col-span-3" />
                                                <input type="text" name="className" placeholder="Class" value={testDetails.className} onChange={handleDetailsChange} className="chunky-input" />
                                                <input type="text" name="subject" placeholder="Subject" value={testDetails.subject} onChange={handleDetailsChange} className="chunky-input md:col-span-2" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {modalStep === 2 && (
                                    <div className="animate-in fade-in duration-300 print:m-0">
                                        <div className="flex justify-center mb-8 print:hidden">
                                            <div className="flex bg-white p-2 rounded-[25px] shadow-[0_10px_25px_rgba(0,0,0,0.05)] border-4 border-white">
                                                <button onClick={() => setPreviewMode('student')} className={`flex items-center gap-2 px-8 py-3 rounded-[18px] font-black transition-all ${previewMode === 'student' ? 'bg-[#FFD93D] text-[#2D3436] shadow-sm' : 'text-[#A29BFE] hover:text-[#6C5CE7] hover:bg-[#F0F4FF]'}`}>
                                                    <GraduationCap size={20} strokeWidth={3} /> Student View
                                                </button>
                                                <button onClick={() => setPreviewMode('teacher')} className={`flex items-center gap-2 px-8 py-3 rounded-[18px] font-black transition-all ${previewMode === 'teacher' ? 'bg-[#55EFC4] text-[#00b894] shadow-sm' : 'text-[#A29BFE] hover:text-[#6C5CE7] hover:bg-[#F0F4FF]'}`}>
                                                    <BookOpen size={20} strokeWidth={3} /> Teacher Key
                                                </button>
                                            </div>
                                        </div>

                                        {/* CLIPBOARD CONTAINER FOR PREVIEW */}
                                        <div className="bg-white rounded-[40px] border-[6px] border-white shadow-[0_20px_50px_rgba(108,92,231,0.1)] p-4 md:p-8 mx-auto max-w-4xl relative print:border-none print:shadow-none print:p-0 print:rounded-none">

                                            {/* Decorative Clipboard Clip (Hidden on print) */}
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-8 bg-gray-200 rounded-t-[20px] border-4 border-white shadow-md print:hidden z-10 flex justify-center">
                                                <div className="w-16 h-3 bg-gray-300 rounded-full mt-2"></div>
                                            </div>

                                            <div id="paper-content" className="bg-white print:w-full p-4 pt-8">
                                                {/* ACTUAL PRINTABLE CONTENT REMAINS UNSTYLED / INLINE STYLED AS ORIGINAL */}
                                                <div style={{
                                                    textAlign: "center",
                                                    marginBottom: "40px",
                                                    paddingBottom: "24px",
                                                    borderBottom: "2px solid #1f2937"
                                                }}>
                                                    <h1 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px 0', color: '#000' }}>
                                                        {testDetails.schoolName}
                                                    </h1>
                                                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333333', margin: '0 0 20px 0' }}>
                                                        {testDetails.testName}
                                                    </h2>

                                                    <table style={{ width: '100%', fontSize: '14px', fontWeight: 'bold', borderCollapse: 'collapse', color: '#000' }}>
                                                        <tbody>
                                                            <tr>
                                                                <td style={{ textAlign: 'left', paddingBottom: '8px' }}>
                                                                    Class: <span style={{ minWidth: '100px', display: 'inline-block' }}>{testDetails.className}</span>
                                                                </td>
                                                                <td style={{ textAlign: 'right', paddingBottom: '8px' }}>
                                                                    Time: <span style={{ minWidth: '80px', display: 'inline-block' }}>{testDetails.duration}</span>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ textAlign: 'left', paddingBottom: '8px' }}>
                                                                    Subject: <span style={{ minWidth: '100px', display: 'inline-block' }}>{testDetails.subject}</span>
                                                                </td>
                                                                <td style={{ textAlign: 'right', paddingBottom: '8px' }}>
                                                                    Max Marks: <span style={{ minWidth: '80px', display: 'inline-block', textAlign: 'center' }}>{testDetails.fullMarks || totalMarks}</span>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {Object.entries(groupedSummary).map(([chapter, types]) => (
                                                    <div key={chapter} style={{ marginBottom: '30px' }}>
                                                        {Object.keys(types).map((type) => {
                                                            const questionsForType = selectedQuestions.filter(q => q.chapterName === chapter && q.questionType === type);
                                                            if (questionsForType.length === 0) return null;

                                                            const isMatchGroup = type.toLowerCase().includes('match');
                                                            const markForThisType = typeMarks[type] || 1;

                                                            // Get the shuffled pool for this specific group
                                                            const currentShuffledPool = shuffledMatchAnswers[`${chapter}-${type}`] || [];

                                                            return (
                                                                <div key={type} style={{ marginBottom: '30px', color: '#000' }}>
                                                                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 15px 0', paddingBottom: '5px', borderBottom: '1px solid #eee' }}>
                                                                        {type}
                                                                    </h3>
                                                                    <div style={{ display: 'block' }}>
                                                                        {questionsForType.map((item, qIdx) => {
                                                                            const currentHeader = item.question.Header?.trim();
                                                                            const prevHeader = qIdx > 0 ? questionsForType[qIdx - 1].question.Header?.trim() : null;
                                                                            const showHeader = currentHeader && currentHeader !== prevHeader;

                                                                            return (
                                                                                <React.Fragment key={qIdx}>
                                                                                    {showHeader && (
                                                                                        <p style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                                                                                            {currentHeader}
                                                                                        </p>
                                                                                    )}

                                                                                    <table style={{ width: '100%', marginBottom: '10px', borderCollapse: 'collapse' }}>
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <td style={{ width: '30px', verticalAlign: 'top', fontWeight: 'bold', fontSize: '15px' }}>{qIdx + 1}.</td>
                                                                                                <td style={{ verticalAlign: 'top' }}>
                                                                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                {/* LEFT COLUMN: The Question/Image */}
                                                                                                                <td style={{ verticalAlign: 'top', width: isMatchGroup ? '45%' : 'auto' }}>
                                                                                                                    <div className="word-export-html" dangerouslySetInnerHTML={{ __html: item.question.Title }} />
                                                                                                                </td>

                                                                                                                {/* MIDDLE: Matching Labels (Optional but helpful) */}
                                                                                                                {isMatchGroup && (
                                                                                                                    <td style={{ width: '10%', textAlign: 'center', fontWeight: 'bold', color: '#888' }}>

                                                                                                                    </td>
                                                                                                                )}

                                                                                                                {/* RIGHT COLUMN: Shuffled Answer/Image */}
                                                                                                                {isMatchGroup && (
                                                                                                                    <td style={{ verticalAlign: 'top', width: '45%' }}>
                                                                                                                        {/* We take the answer from the SHUFFLED pool using the current index */}
                                                                                                                        <div className="word-export-html" dangerouslySetInnerHTML={{ __html: currentShuffledPool[qIdx] }} />
                                                                                                                    </td>
                                                                                                                )}

                                                                                                                {/* MARKS COLUMN */}
                                                                                                                <td style={{ width: '50px', verticalAlign: 'top', textAlign: 'right', fontWeight: 'bold', fontSize: '14px' }}>
                                                                                                                    [{markForThisType}]
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </tbody>
                                                                                                    </table>

                                                                                                    {/* Standard MCQ Options */}
                                                                                                    {item.question.Option && !isMatchGroup && (
                                                                                                        <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
                                                                                                            <tbody>
                                                                                                                {item.question.Option.split('|').reduce((result, value, index, array) => {
                                                                                                                    if (index % 2 === 0) result.push(array.slice(index, index + 2));
                                                                                                                    return result;
                                                                                                                }, []).map((pair, rowIdx) => (
                                                                                                                    <tr key={rowIdx}>
                                                                                                                        <td style={{ width: '50%', padding: '4px 0', verticalAlign: 'top' }}>{pair[0]?.trim()}</td>
                                                                                                                        <td style={{ width: '50%', padding: '4px 0', verticalAlign: 'top' }}>{pair[1]?.trim() || ''}</td>
                                                                                                                    </tr>
                                                                                                                ))}
                                                                                                            </tbody>
                                                                                                        </table>
                                                                                                    )}

                                                                                                    {/* TEACHER KEY: Show the ACTUAL correct Answer even for Match types */}
                                                                                                    {previewMode === 'teacher' && item.question.Answer !== "Not Available" && (
                                                                                                        <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#F0FDF4', borderLeft: '4px solid #22C55E', fontSize: '13px' }}>
                                                                                                            <strong>Correct Target: </strong>
                                                                                                            <span dangerouslySetInnerHTML={{ __html: item.question.Answer }} />
                                                                                                        </div>
                                                                                                    )}
                                                                                                </td>
                                                                                            </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                </React.Fragment>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}

                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 md:p-8 bg-white flex justify-between items-center border-t-[6px] border-[#F0F4FF] rounded-b-[40px] print:hidden">
                                {modalStep === 1 ? (
                                    <>
                                        <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[#A29BFE] font-black hover:bg-[#F0F4FF] rounded-[20px] transition-colors">Cancel</button>
                                        <button disabled={!isTestDetailsValid} onClick={() => setModalStep(2)} className="bouncy-btn" style={{ background: !isTestDetailsValid ? "#E0DAFF" : "#6C5CE7", color: "white", padding: "14px 30px", fontSize: "16px" }}>
                                            Next Step <ArrowRight size={20} strokeWidth={3} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setModalStep(1)} className="bouncy-btn" style={{ background: "#F1F2F6", color: "#636E72", padding: "12px 24px", fontSize: "15px", border: "none" }}>
                                            <ArrowLeft size={18} strokeWidth={3} /> Back to Edit
                                        </button>
                                        <div className="flex flex-wrap gap-3">
                                            <button onClick={handleDownloadWord} className="bouncy-btn" style={{ background: "#74B9FF", color: "white", padding: "12px 24px", fontSize: "15px" }}>
                                                <FileText size={18} strokeWidth={3} /> Word (.doc)
                                            </button>
                                            <button onClick={handleDownloadPDF} className="bouncy-btn" style={{ background: "#FF6B6B", color: "white", padding: "12px 24px", fontSize: "15px" }}>
                                                <Download size={18} strokeWidth={3} /> Download PDF
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );

};

export default TestGenerator;






















