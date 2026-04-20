import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Printer, FileText, X, Trash2, ArrowRight, ArrowLeft,
    Settings, Eye, CheckCircle2, GraduationCap, BookOpen, Hash, Download
} from 'lucide-react';




// Adjust this path based on your folder structure
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

    // --- NEW: Mark Management State ---
    const [typeMarks, setTypeMarks] = useState({});

    // Test Details Form State
    const [testDetails, setTestDetails] = useState({
        testName: '', duration: '', schoolName: '', className: '', subject: ''
    });

    // Extract unique types from selected questions for the marks table
    const selectedTypesSummary = useMemo(() => {
        const summary = {};
        selectedQuestions.forEach(q => {
            if (!summary[q.questionType]) summary[q.questionType] = 0;
            summary[q.questionType] += 1;
        });
        return summary; // returns { "MCQ": 5, "True/False": 2 }
    }, [selectedQuestions]);

    // Calculate total marks based on type-wise weights
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

    // Initialize/Sync marks when questions are selected
    useEffect(() => {
        const newTypeMarks = { ...typeMarks };
        let changed = false;
        Object.keys(selectedTypesSummary).forEach(type => {
            if (newTypeMarks[type] === undefined) {
                newTypeMarks[type] = 1; // Default 1 mark
                changed = true;
            }
        });
        if (changed) setTypeMarks(newTypeMarks);
    }, [selectedTypesSummary]);

    // Toggles & Handlers
    const toggleChapter = (chapterName) => {
        setActiveChapters(prev => prev.includes(chapterName) ? prev.filter(c => c !== chapterName) : [...prev, chapterName]);
    };

    const toggleFilter = (type) => {
        setActiveFilters(prev => prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type]);
    };

    const toggleQuestionSelection = (question, chapterName, questionType) => {
        setSelectedQuestions(prev => {
            const isAlreadySelected = prev.some(item => item.question === question);
            if (isAlreadySelected) return prev.filter(item => item.question !== question);
            return [...prev, { question, chapterName, questionType }];
        });
    };

    const handleTypeMarkChange = (type, value) => {
        setTypeMarks(prev => ({ ...prev, [type]: value }));
    };

    const handleDetailsChange = (e) => {
        const { name, value } = e.target;
        setTestDetails(prev => ({ ...prev, [name]: value }));
    };

    const handlePrint = () => {
        window.print();
    };

    const openGenerateModal = () => {
        if (selectedQuestions.length > 0) {
            setModalStep(1);
            setIsModalOpen(true);
        }
    };


    // ... existing toggle/handler functions ...

    const handleDownloadPDF = async () => {
        // Dynamically import the library only when the button is clicked
        const html2pdf = (await import('html2pdf.js')).default;

        const element = document.getElementById('paper-content');

        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `${testDetails.testName || 'Test_Paper'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        // Generate and save the PDF
        html2pdf().set(opt).from(element).save();
    };

    const handleDownloadWord = async () => {
        const originalElement = document.getElementById('paper-content');

        if (!originalElement) {
            console.error("Paper content not found!");
            return;
        }

        // 1. Clone the element so we don't modify the live UI on the screen
        const elementClone = originalElement.cloneNode(true);
        const images = elementClone.getElementsByTagName('img');

        // 2. Helper function to convert images to Base64
        const convertImageToBase64 = (imgElement) => {
            return new Promise((resolve) => {
                // If it's already base64, skip it
                if (imgElement.src.startsWith('data:image')) {
                    resolve();
                    return;
                }

                const tempImage = new Image();
                tempImage.crossOrigin = 'Anonymous'; // Prevents CORS security blocks

                tempImage.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = tempImage.naturalWidth || tempImage.width;
                    canvas.height = tempImage.naturalHeight || tempImage.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(tempImage, 0, 0);

                    try {
                        // Replace the src with the raw base64 data
                        imgElement.src = canvas.toDataURL('image/png');
                    } catch (e) {
                        console.warn("Could not convert image to base64. Keeping original.", e);
                    }
                    resolve();
                };

                tempImage.onerror = () => {
                    resolve(); // Resolve anyway so a broken image doesn't stop the whole download
                };

                tempImage.src = imgElement.src;
            });
        };

        // 3. Wait for all images in the clone to finish converting
        const imagePromises = Array.from(images).map(convertImageToBase64);
        await Promise.all(imagePromises);

        // 4. Capture the updated HTML with embedded images
        const content = elementClone.outerHTML;

        // Wrap the HTML in Microsoft's specific Office XML tags
        const header = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                  xmlns:w="urn:schemas-microsoft-com:office:word" 
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <title>${testDetails.testName || 'Test Paper'}</title>
                <style>
                    body { font-family: Arial, sans-serif; color: black; background: white; }
                    table { border-collapse: collapse; }
                    /* Ensure images don't exceed page width in Word */
                    img { max-width: 100%; height: auto; }
                </style>
            </head>
            <body>
        `;

        const footer = "</body></html>";
        const sourceHTML = header + content + footer;

        // Use the strict Microsoft Word MIME type
        const blob = new Blob(['\ufeff', sourceHTML], {
            type: 'application/vnd.ms-word;charset=utf-8'
        });

        // Trigger the download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${testDetails.testName || 'Test_Paper'}.doc`;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    };



    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 font-sans text-gray-900 print:bg-white print:p-0">

            {/* ---------------- MAIN VIEW (Hidden on Print) ---------------- */}
            <div className="print:hidden">
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="sticky top-4 z-40 mx-auto max-w-6xl mb-12 flex flex-col md:flex-row items-center justify-between p-6 bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/40"
                >
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Question Bank</h1>
                        <p className="text-gray-500 font-medium mt-1">Select questions to build your paper</p>
                    </div>

                    <button
                        onClick={openGenerateModal}
                        disabled={selectedQuestions.length === 0}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg active:scale-95 mt-6 md:mt-0 ${selectedQuestions.length > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        <FileText size={20} />
                        Generate Paper ({selectedQuestions.length})
                    </button>
                </motion.header>

                <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar: Filters & Selection */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Selected Questions Box */}
                        <div className="bg-white/60 backdrop-blur-lg p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col max-h-[350px]">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold tracking-tight">Selected ({selectedQuestions.length})</h2>
                                {selectedQuestions.length > 0 && (
                                    <button onClick={() => setSelectedQuestions([])} className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors">
                                        <Trash2 size={14} /> Clear All
                                    </button>
                                )}
                            </div>
                            <div className="overflow-y-auto pr-2 -mr-2 space-y-2 flex-1">
                                {selectedQuestions.length === 0 ? (
                                    <div className="text-sm text-gray-500 font-medium">No questions selected yet.</div>
                                ) : (
                                    <AnimatePresence>
                                        {selectedQuestions.map((item, idx) => (
                                            <motion.div
                                                key={`selected-${idx}`}
                                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                                                exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.9 }}
                                                className="flex items-start gap-3 p-3 bg-white border border-gray-100 shadow-sm rounded-xl group"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block mb-1 tracking-wider truncate max-w-full">
                                                        {item.chapterName.split('.')[0]} • {item.questionType}
                                                    </p>
                                                    <div
                                                        className="text-sm font-medium text-gray-800 line-clamp-2 [&_img]:h-8 [&_img]:w-auto [&_img]:inline-block [&_img]:ml-1"
                                                        dangerouslySetInnerHTML={{ __html: item.question.Title }}
                                                    />
                                                </div>
                                                <button onClick={() => toggleQuestionSelection(item.question, item.chapterName, item.questionType)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg">
                                                    <X size={16} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>

                        {/* Chapters Filter */}
                        <div className="bg-white/60 backdrop-blur-lg p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold tracking-tight">Chapters</h2>
                                <button onClick={() => setActiveChapters(chapterOptions)} className="text-sm text-blue-600 font-medium hover:underline">All</button>
                            </div>
                            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
                                {chapterOptions.map(chapter => (
                                    <label key={chapter} className="flex items-start gap-3 cursor-pointer group">
                                        <input type="checkbox" checked={activeChapters.includes(chapter)} onChange={() => toggleChapter(chapter)} className="mt-1 w-5 h-5 text-blue-600 border-2 rounded accent-blue-600" />
                                        <span className="text-[15px] font-medium text-gray-700 group-hover:text-gray-900">{chapter}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Question Types Filter */}
                        <div className="bg-white/60 backdrop-blur-lg p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold tracking-tight">Question Types</h2>
                                <button onClick={() => setActiveFilters(allQuestionTypes)} className="text-sm text-blue-600 font-medium hover:underline">All</button>
                            </div>
                            <div className="flex flex-col gap-3">
                                {allQuestionTypes.map(option => (
                                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked={activeFilters.includes(option)} onChange={() => toggleFilter(option)} className="w-5 h-5 text-blue-600 border-2 rounded accent-blue-600" />
                                        <span className="text-[15px] font-medium text-gray-700 group-hover:text-gray-900">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Question Selection Area */}
                    <div className="lg:col-span-8 bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        {displayedChapters.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 font-medium">Please select at least one Chapter and Question Type.</div>
                        ) : (
                            displayedChapters.map((chapter) => (
                                <div key={chapter.Chapter_name} className="mb-14">
                                    <div className="bg-blue-50/50 p-4 rounded-2xl mb-8 border border-blue-100/50">
                                        <h2 className="text-2xl font-black tracking-tight text-blue-900">{chapter.Chapter_name}</h2>
                                    </div>
                                    {chapter.Questions_type.map((section) => {
                                        const isMatch = section.type.toLowerCase().includes('match');

                                        return (
                                            <div key={section.type} className="mb-10 pl-2">
                                                <h3 className="text-xl font-bold tracking-tight mb-6 pb-2 border-b-2 border-gray-100 text-gray-800">{section.type}</h3>
                                                <div className="space-y-4">
                                                    {section.Questions.map((q, qIdx) => {
                                                        const isSelected = selectedQuestions.some(item => item.question === q);
                                                        return (
                                                            <div
                                                                key={qIdx}
                                                                onClick={() => toggleQuestionSelection(q, chapter.Chapter_name, section.type)}
                                                                className={`relative p-5 rounded-2xl transition-all cursor-pointer border-2 ${isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-transparent hover:bg-gray-50'}`}
                                                            >
                                                                <div className="absolute left-4 top-6">
                                                                    <input type="checkbox" checked={isSelected} readOnly className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded cursor-pointer pointer-events-none accent-blue-600" />
                                                                </div>
                                                                <div className="pl-10">
                                                                    <p className="text-sm font-semibold text-gray-500 mb-1">{q.Header}</p>
                                                                    <div className="text-lg font-medium text-gray-900 leading-relaxed flex items-start gap-2 [&_img]:max-w-full [&_img]:rounded-md [&_img]:mt-2">
                                                                        <span>{qIdx + 1}.</span>
                                                                        <div className={isMatch ? "flex flex-wrap items-center gap-12" : ""}>
                                                                            <div dangerouslySetInnerHTML={{ __html: q.Title }} />
                                                                            {isMatch && q.Answer !== "Not Available" && (
                                                                                <div dangerouslySetInnerHTML={{ __html: q.Answer }} />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {q.Option && (
                                                                        <div className="mt-3 text-gray-600 font-medium pl-4 border-l-2 border-gray-200">
                                                                            {q.Option.split('|').map((opt, oIdx) => <div key={oIdx} className="py-1">{opt.trim()}</div>)}
                                                                        </div>
                                                                    )}
                                                                    {!isMatch && q.Answer !== "Not Available" && (
                                                                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-start gap-2">
                                                                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold mt-1 uppercase">Ans</span>
                                                                            <div className="text-sm text-gray-700 font-medium [&_img]:max-h-32 [&_img]:rounded-md" dangerouslySetInnerHTML={{ __html: q.Answer }} />
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

            {/* ---------------- MODAL OVERLAY ---------------- */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 md:p-8 print:p-0 print:bg-white print:block overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-full print:shadow-none print:max-w-none print:rounded-none"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 print:hidden">
                                <div className="flex items-center gap-3">
                                    {modalStep === 1 ? <Settings className="text-blue-600" /> : <Eye className="text-blue-600" />}
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {modalStep === 1 ? 'Configure Test Paper' : 'Paper Preview'}
                                    </h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 md:p-10 overflow-y-auto flex-1 print:p-0">

                                {/* ---------------- STEP 1: CONFIGURATION (UPDATED) ---------------- */}
                                {modalStep === 1 && (
                                    <div className="space-y-10 animate-in fade-in duration-300">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" /> Selection Summary</h3>
                                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                                {Object.entries(groupedSummary).map(([chap, types]) => (
                                                    <div key={chap} className="mb-4 last:mb-0">
                                                        <h4 className="font-bold text-gray-700 mb-2">{chap}</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.entries(types).map(([type, count]) => (
                                                                <span key={type} className="text-sm bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-medium shadow-sm">
                                                                    {type}: <strong className="text-blue-600">{count} Qs</strong>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Paper Details Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 mb-4">Paper Details</h3>
                                                <div className="space-y-4">
                                                    <input type="text" name="testName" placeholder="Test Name (e.g. Unit Test 1)" value={testDetails.testName} onChange={handleDetailsChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                                                    <input type="text" name="duration" placeholder="Duration (e.g. 2 Hours)" value={testDetails.duration} onChange={handleDetailsChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                                                </div>
                                            </div>

                                            {/* --- NEW: Question Type-wise Marks --- */}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 mb-4">Assign Marks (By Type)</h3>
                                                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="p-4 text-xs font-bold text-gray-500 border-b uppercase tracking-wider">Question Type</th>
                                                                <th className="p-4 text-xs font-bold text-gray-500 border-b uppercase tracking-wider text-center">Qty</th>
                                                                <th className="p-4 text-xs font-bold text-gray-500 border-b uppercase tracking-wider w-32 text-center">Marks / Q</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {Object.entries(selectedTypesSummary).map(([type, count]) => (
                                                                <tr key={type} className="hover:bg-gray-50/50 transition-colors">
                                                                    <td className="p-4">
                                                                        <span className="font-bold text-gray-800 text-sm">{type}</span>
                                                                    </td>
                                                                    <td className="p-4 text-center">
                                                                        <span className="text-gray-500 font-bold">{count}</span>
                                                                    </td>
                                                                    <td className="p-4">
                                                                        <div className="relative">
                                                                            <input
                                                                                type="number"
                                                                                min="0.5"
                                                                                step="0.5"
                                                                                value={typeMarks[type] || ''}
                                                                                onChange={(e) => handleTypeMarkChange(type, e.target.value)}
                                                                                className="w-full text-center px-3 py-2 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    <div className="bg-blue-50/50 p-4 flex justify-between items-center border-t border-blue-100">
                                                        <span className="text-blue-900 font-bold text-sm uppercase tracking-wider">Total Paper Marks</span>
                                                        <span className="text-2xl font-black text-blue-700">{totalMarks}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-4">School & Subject Info</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <input type="text" name="schoolName" placeholder="School Name" value={testDetails.schoolName} onChange={handleDetailsChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium md:col-span-3" />
                                                <input type="text" name="className" placeholder="Class" value={testDetails.className} onChange={handleDetailsChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                                                <input type="text" name="subject" placeholder="Subject" value={testDetails.subject} onChange={handleDetailsChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium md:col-span-2" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ---------------- STEP 2: PREVIEW & PRINT ---------------- */}
                                {modalStep === 2 && (
                                    <div className="animate-in fade-in duration-300 print:m-0">

                                        {/* Toggle Buttons (Keeping Tailwind here since these don't get printed) */}
                                        <div className="flex justify-center mb-8 print:hidden">
                                            <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner">
                                                <button onClick={() => setPreviewMode('student')} className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all ${previewMode === 'student' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                                    <GraduationCap size={18} /> Student View
                                                </button>
                                                <button onClick={() => setPreviewMode('teacher')} className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all ${previewMode === 'teacher' ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>
                                                    <BookOpen size={18} /> Teacher Key
                                                </button>
                                            </div>
                                        </div>

                                        {/* PAPER CONTENT - INLINE STYLED FOR EXPORT */}
                                        <div id="paper-content" className="max-w-4xl mx-auto bg-white print:w-full p-8">


                                            {/* Header section using a table structure for better MS Word compatibility */}
                                            <div className="text-center mb-10 pb-6 border-b-2 border-gray-800">                                                <h1 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px 0' }}>
                                                {testDetails.schoolName || 'YOUR SCHOOL NAME'}
                                            </h1>
                                                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333333', margin: '0 0 20px 0' }}>
                                                    {testDetails.testName || 'EXAMINATION PAPER'}
                                                </h2>

                                                <table style={{ width: '100%', fontSize: '14px', fontWeight: 'bold', borderCollapse: 'collapse' }}>
                                                    <tbody>
                                                        <tr>
                                                            <td style={{ textAlign: 'left', paddingBottom: '8px' }}>
                                                                Class: <span style={{ borderBottom: '1px solid #000', minWidth: '100px', display: 'inline-block' }}>{testDetails.className}</span>
                                                            </td>
                                                            <td style={{ textAlign: 'right', paddingBottom: '8px' }}>
                                                                Time: <span style={{ borderBottom: '1px solid #000', minWidth: '80px', display: 'inline-block' }}>{testDetails.duration}</span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ textAlign: 'left' }}>
                                                                Subject: <span style={{ borderBottom: '1px solid #000', minWidth: '100px', display: 'inline-block' }}>{testDetails.subject}</span>
                                                            </td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                Max Marks: <span style={{ borderBottom: '1px solid #000', minWidth: '80px', display: 'inline-block', textAlign: 'center' }}>{totalMarks}</span>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Questions Loop */}
                                            {Object.entries(groupedSummary).map(([chapter, types]) => (
                                                <div key={chapter} style={{ marginBottom: '30px' }}>
                                                    {Object.keys(types).map((type) => {
                                                        const questionsForType = selectedQuestions.filter(q => q.chapterName === chapter && q.questionType === type);
                                                        if (questionsForType.length === 0) return null;

                                                        const isMatchGroup = type.toLowerCase().includes('match');
                                                        const markForThisType = typeMarks[type] || 1;

                                                        return (
                                                            <div key={type} style={{ marginBottom: '30px' }}>
                                                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 15px 0', paddingBottom: '5px', borderBottom: '2px solid #000000' }}>
                                                                    {type}
                                                                </h3>

                                                                <div style={{ display: 'block' }}>
                                                                    {questionsForType.map((item, qIdx) => (
                                                                        <table key={qIdx} style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td style={{ width: '30px', verticalAlign: 'top', fontWeight: 'bold', fontSize: '15px' }}>
                                                                                        {qIdx + 1}.
                                                                                    </td>
                                                                                    <td style={{ verticalAlign: 'top', fontSize: '15px', lineHeight: '1.5' }}>

                                                                                        {/* Header Note */}
                                                                                        {item.question.Header && (
                                                                                            <p style={{ margin: '0 0 5px 0', fontSize: '13px', fontWeight: '600', color: '#555555' }}>
                                                                                                {item.question.Header}
                                                                                            </p>
                                                                                        )}

                                                                                        {/* Question Title & Marks */}
                                                                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td style={{ verticalAlign: 'top' }}>
                                                                                                        <div className="word-export-html" dangerouslySetInnerHTML={{ __html: item.question.Title }} />

                                                                                                        {/* Match Group Answer Column */}
                                                                                                        {isMatchGroup && item.question.Answer !== "Not Available" && (
                                                                                                            <div style={{ marginTop: '10px' }} className="word-export-html" dangerouslySetInnerHTML={{ __html: item.question.Answer }} />
                                                                                                        )}
                                                                                                    </td>
                                                                                                    <td style={{ width: '50px', verticalAlign: 'top', textAlign: 'right', fontWeight: 'bold', fontSize: '14px' }}>
                                                                                                        [{markForThisType}]
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>

                                                                                        {/* Options (MCQ) */}
                                                                                        {item.question.Option && (
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

                                                                                        {/* Teacher Answer Key */}
                                                                                        {!isMatchGroup && previewMode === 'teacher' && item.question.Answer !== "Not Available" && (
                                                                                            <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #10b981', backgroundColor: '#ecfdf5', borderRadius: '4px', color: '#065f46' }}>
                                                                                                <strong>Ans: </strong>
                                                                                                <span className="word-export-html" dangerouslySetInnerHTML={{ __html: item.question.Answer }} />
                                                                                            </div>
                                                                                        )}

                                                                                        {/* Student Writing Space */}
                                                                                        {!isMatchGroup && !item.question.Option && previewMode === 'student' && (
                                                                                            <div style={{ marginTop: '30px', borderBottom: '1px dotted #888888', width: '100%' }}></div>
                                                                                        )}

                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Buttons */}
                            <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center print:hidden rounded-b-3xl">
                                {modalStep === 1 ? (
                                    <>
                                        <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                                        <button onClick={() => setModalStep(2)} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md">
                                            Next Step <ArrowRight size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setModalStep(1)} className="flex items-center gap-2 px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">
                                            <ArrowLeft size={18} /> Back to Edit
                                        </button>

                                        {/* REPLACED PRINT BUTTON WITH THESE TWO */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleDownloadWord}
                                                className="flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200 transition-colors shadow-sm"
                                            >
                                                <FileText size={18} /> Word (.doc)
                                            </button>
                                            <button
                                                onClick={handleDownloadPDF}
                                                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-md"
                                            >
                                                <Download size={18} /> Download PDF
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};



export default TestGenerator;
































// import React, { useState, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//     Printer, FileText, X, Trash2, ArrowRight, ArrowLeft,
//     Settings, Eye, CheckCircle2, GraduationCap, BookOpen
// } from 'lucide-react';

// // Adjust this path based on your folder structure
// import tgData from '../../datas/tg2.json';

// const TestGenerator = () => {
//     const allChapters = tgData.PR_TG_DATA[0].TG_QUESTIONS.Chapter_list;
//     const chapterOptions = allChapters.map(ch => ch.Chapter_name);

//     const allQuestionTypes = useMemo(() => {
//         const types = new Set();
//         allChapters.forEach(ch => {
//             ch.Questions_type.forEach(section => types.add(section.type));
//         });
//         return Array.from(types);
//     }, [allChapters]);

//     // Main View States
//     const [activeChapters, setActiveChapters] = useState([]);
//     const [activeFilters, setActiveFilters] = useState([]);
//     const [selectedQuestions, setSelectedQuestions] = useState([]);

//     // Modal States
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [modalStep, setModalStep] = useState(1);
//     const [previewMode, setPreviewMode] = useState('student');

//     // Test Details Form State
//     const [testDetails, setTestDetails] = useState({
//         testName: '', duration: '', schoolName: '', className: '', subject: ''
//     });

//     const totalMarks = useMemo(() => {
//         return selectedQuestions.reduce((sum, item) => sum + (Number(item.marks) || 0), 0);
//     }, [selectedQuestions]);

//     const groupedSummary = useMemo(() => {
//         const summary = {};
//         selectedQuestions.forEach(item => {
//             if (!summary[item.chapterName]) summary[item.chapterName] = {};
//             if (!summary[item.chapterName][item.questionType]) summary[item.chapterName][item.questionType] = 0;
//             summary[item.chapterName][item.questionType] += 1;
//         });
//         return summary;
//     }, [selectedQuestions]);

//     const displayedChapters = useMemo(() => {
//         return allChapters
//             .filter(ch => activeChapters.includes(ch.Chapter_name))
//             .map(ch => ({
//                 ...ch,
//                 Questions_type: ch.Questions_type.filter(section => activeFilters.includes(section.type))
//             }))
//             .filter(ch => ch.Questions_type.length > 0);
//     }, [allChapters, activeChapters, activeFilters]);

//     // Toggles & Handlers
//     const toggleChapter = (chapterName) => {
//         setActiveChapters(prev => prev.includes(chapterName) ? prev.filter(c => c !== chapterName) : [...prev, chapterName]);
//     };

//     const toggleFilter = (type) => {
//         setActiveFilters(prev => prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type]);
//     };

//     const toggleQuestionSelection = (question, chapterName, questionType) => {
//         setSelectedQuestions(prev => {
//             const isAlreadySelected = prev.some(item => item.question === question);
//             if (isAlreadySelected) return prev.filter(item => item.question !== question);
//             return [...prev, { question, chapterName, questionType, marks: 1 }];
//         });
//     };

//     const handleMarkChange = (index, value) => {
//         const newSelected = [...selectedQuestions];
//         newSelected[index].marks = value;
//         setSelectedQuestions(newSelected);
//     };

//     const handleDetailsChange = (e) => {
//         const { name, value } = e.target;
//         setTestDetails(prev => ({ ...prev, [name]: value }));
//     };

//     const handlePrint = () => {
//         window.print();
//     };

//     const openGenerateModal = () => {
//         if (selectedQuestions.length > 0) {
//             setModalStep(1);
//             setIsModalOpen(true);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 font-sans text-gray-900 print:bg-white print:p-0">

//             {/* ---------------- MAIN VIEW (Hidden on Print) ---------------- */}
//             <div className="print:hidden">
//                 <motion.header
//                     initial={{ y: -20, opacity: 0 }}
//                     animate={{ y: 0, opacity: 1 }}
//                     className="sticky top-4 z-40 mx-auto max-w-6xl mb-12 flex flex-col md:flex-row items-center justify-between p-6 bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/40"
//                 >
//                     <div>
//                         <h1 className="text-3xl font-bold tracking-tight text-gray-900">Question Bank</h1>
//                         <p className="text-gray-500 font-medium mt-1">Select questions to build your paper</p>
//                     </div>

//                     <button
//                         onClick={openGenerateModal}
//                         disabled={selectedQuestions.length === 0}
//                         className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg active:scale-95 mt-6 md:mt-0 ${selectedQuestions.length > 0
//                             ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'
//                             : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
//                             }`}
//                     >
//                         <FileText size={20} />
//                         Generate Paper ({selectedQuestions.length})
//                     </button>
//                 </motion.header>

//                 <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
//                     <div className="lg:col-span-4 space-y-6">

//                         {/* Selected Questions Box */}
//                         <div className="bg-white/60 backdrop-blur-lg p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col max-h-[350px]">
//                             <div className="flex items-center justify-between mb-4">
//                                 <h2 className="text-xl font-bold tracking-tight">Selected ({selectedQuestions.length})</h2>
//                                 {selectedQuestions.length > 0 && (
//                                     <button onClick={() => setSelectedQuestions([])} className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors">
//                                         <Trash2 size={14} /> Clear All
//                                     </button>
//                                 )}
//                             </div>
//                             <div className="overflow-y-auto pr-2 -mr-2 space-y-2 flex-1">
//                                 {selectedQuestions.length === 0 ? (
//                                     <div className="text-sm text-gray-500 font-medium">No questions selected yet.</div>
//                                 ) : (
//                                     <AnimatePresence>
//                                         {selectedQuestions.map((item, idx) => (
//                                             <motion.div
//                                                 key={`selected-${idx}`}
//                                                 initial={{ opacity: 0, height: 0, marginBottom: 0 }}
//                                                 animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
//                                                 exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.9 }}
//                                                 className="flex items-start gap-3 p-3 bg-white border border-gray-100 shadow-sm rounded-xl group"
//                                             >
//                                                 <div className="flex-1 min-w-0">
//                                                     <p className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block mb-1 tracking-wider truncate max-w-full">
//                                                         {item.chapterName.split('.')[0]} • {item.questionType}
//                                                     </p>
//                                                     <div
//                                                         className="text-sm font-medium text-gray-800 line-clamp-2 [&_img]:h-8 [&_img]:w-auto [&_img]:inline-block [&_img]:ml-1"
//                                                         dangerouslySetInnerHTML={{ __html: item.question.Title }}
//                                                     />
//                                                 </div>
//                                                 <button onClick={() => toggleQuestionSelection(item.question, item.chapterName, item.questionType)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg">
//                                                     <X size={16} />
//                                                 </button>
//                                             </motion.div>
//                                         ))}
//                                     </AnimatePresence>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Chapters Filter */}
//                         <div className="bg-white/60 backdrop-blur-lg p-6 rounded-3xl shadow-sm border border-gray-100">
//                             <div className="flex items-center justify-between mb-5">
//                                 <h2 className="text-xl font-bold tracking-tight">Chapters</h2>
//                                 <button onClick={() => setActiveChapters(chapterOptions)} className="text-sm text-blue-600 font-medium hover:underline">All</button>
//                             </div>
//                             <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
//                                 {chapterOptions.map(chapter => (
//                                     <label key={chapter} className="flex items-start gap-3 cursor-pointer group">
//                                         <input type="checkbox" checked={activeChapters.includes(chapter)} onChange={() => toggleChapter(chapter)} className="mt-1 w-5 h-5 text-blue-600 border-2 rounded accent-blue-600" />
//                                         <span className="text-[15px] font-medium text-gray-700 group-hover:text-gray-900">{chapter}</span>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Question Types Filter */}
//                         <div className="bg-white/60 backdrop-blur-lg p-6 rounded-3xl shadow-sm border border-gray-100">
//                             <div className="flex items-center justify-between mb-5">
//                                 <h2 className="text-xl font-bold tracking-tight">Question Types</h2>
//                                 <button onClick={() => setActiveFilters(allQuestionTypes)} className="text-sm text-blue-600 font-medium hover:underline">All</button>
//                             </div>
//                             <div className="flex flex-col gap-3">
//                                 {allQuestionTypes.map(option => (
//                                     <label key={option} className="flex items-center gap-3 cursor-pointer group">
//                                         <input type="checkbox" checked={activeFilters.includes(option)} onChange={() => toggleFilter(option)} className="w-5 h-5 text-blue-600 border-2 rounded accent-blue-600" />
//                                         <span className="text-[15px] font-medium text-gray-700 group-hover:text-gray-900">{option}</span>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Right Column: Question Selection Area */}
//                     <div className="lg:col-span-8 bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
//                         {displayedChapters.length === 0 ? (
//                             <div className="text-center py-12 text-gray-400 font-medium">Please select at least one Chapter and Question Type.</div>
//                         ) : (
//                             displayedChapters.map((chapter) => (
//                                 <div key={chapter.Chapter_name} className="mb-14">
//                                     <div className="bg-blue-50/50 p-4 rounded-2xl mb-8 border border-blue-100/50">
//                                         <h2 className="text-2xl font-black tracking-tight text-blue-900">{chapter.Chapter_name}</h2>
//                                     </div>
//                                     {chapter.Questions_type.map((section) => {
//                                         // Logic to check if this is a Match question
//                                         const isMatch = section.type.toLowerCase().includes('match');

//                                         return (
//                                             <div key={section.type} className="mb-10 pl-2">
//                                                 <h3 className="text-xl font-bold tracking-tight mb-6 pb-2 border-b-2 border-gray-100 text-gray-800">{section.type}</h3>
//                                                 <div className="space-y-4">
//                                                     {section.Questions.map((q, qIdx) => {
//                                                         const isSelected = selectedQuestions.some(item => item.question === q);
//                                                         return (
//                                                             <div
//                                                                 key={qIdx}
//                                                                 onClick={() => toggleQuestionSelection(q, chapter.Chapter_name, section.type)}
//                                                                 className={`relative p-5 rounded-2xl transition-all cursor-pointer border-2 ${isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-transparent hover:bg-gray-50'}`}
//                                                             >
//                                                                 <div className="absolute left-4 top-6">
//                                                                     <input type="checkbox" checked={isSelected} readOnly className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded cursor-pointer pointer-events-none accent-blue-600" />
//                                                                 </div>
//                                                                 <div className="pl-10">
//                                                                     <p className="text-sm font-semibold text-gray-500 mb-1">{q.Header}</p>

//                                                                     <div className="text-lg font-medium text-gray-900 leading-relaxed flex items-start gap-2 [&_img]:max-w-full [&_img]:rounded-md [&_img]:mt-2">
//                                                                         <span>{qIdx + 1}.</span>

//                                                                         {/* If Match, render Title and Answer side by side */}
//                                                                         <div className={isMatch ? "flex flex-wrap items-center gap-12" : ""}>
//                                                                             <div dangerouslySetInnerHTML={{ __html: q.Title }} />
//                                                                             {isMatch && q.Answer !== "Not Available" && (
//                                                                                 <div dangerouslySetInnerHTML={{ __html: q.Answer }} />
//                                                                             )}
//                                                                         </div>
//                                                                     </div>

//                                                                     {q.Option && (
//                                                                         <div className="mt-3 text-gray-600 font-medium pl-4 border-l-2 border-gray-200">
//                                                                             {q.Option.split('|').map((opt, oIdx) => <div key={oIdx} className="py-1">{opt.trim()}</div>)}
//                                                                         </div>
//                                                                     )}

//                                                                     {/* Standard Answer key for non-match questions in main view */}
//                                                                     {!isMatch && q.Answer !== "Not Available" && (
//                                                                         <div className="mt-4 pt-3 border-t border-gray-100 flex items-start gap-2">
//                                                                             <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold mt-1 uppercase">Ans</span>
//                                                                             <div className="text-sm text-gray-700 font-medium [&_img]:max-h-32 [&_img]:rounded-md" dangerouslySetInnerHTML={{ __html: q.Answer }} />
//                                                                         </div>
//                                                                     )}
//                                                                 </div>
//                                                             </div>
//                                                         )
//                                                     })}
//                                                 </div>
//                                             </div>
//                                         )
//                                     })}
//                                 </div>
//                             ))
//                         )}
//                     </div>
//                 </main>
//             </div>

//             {/* ---------------- MODAL OVERLAY ---------------- */}
//             <AnimatePresence>
//                 {isModalOpen && (
//                     <motion.div
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 md:p-8 print:p-0 print:bg-white print:block overflow-y-auto"
//                     >
//                         <motion.div
//                             initial={{ scale: 0.95, y: 20 }}
//                             animate={{ scale: 1, y: 0 }}
//                             exit={{ scale: 0.95, y: 20 }}
//                             className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-full print:shadow-none print:max-w-none print:rounded-none"
//                         >

//                             <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 print:hidden">
//                                 <div className="flex items-center gap-3">
//                                     {modalStep === 1 ? <Settings className="text-blue-600" /> : <Eye className="text-blue-600" />}
//                                     <h2 className="text-2xl font-bold text-gray-900">
//                                         {modalStep === 1 ? 'Configure Test Paper' : 'Paper Preview'}
//                                     </h2>
//                                 </div>
//                                 <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors">
//                                     <X size={24} />
//                                 </button>
//                             </div>

//                             <div className="p-6 md:p-10 overflow-y-auto flex-1 print:p-0">

//                                 {/* ---------------- STEP 1: CONFIGURATION ---------------- */}
//                                 {modalStep === 1 && (
//                                     <div className="space-y-10 animate-in fade-in duration-300">

//                                         <div>
//                                             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" /> Selection Summary</h3>
//                                             <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
//                                                 {Object.entries(groupedSummary).map(([chap, types]) => (
//                                                     <div key={chap} className="mb-4 last:mb-0">
//                                                         <h4 className="font-bold text-gray-700 mb-2">{chap}</h4>
//                                                         <div className="flex flex-wrap gap-2">
//                                                             {Object.entries(types).map(([type, count]) => (
//                                                                 <span key={type} className="text-sm bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-medium shadow-sm">
//                                                                     {type}: <strong className="text-blue-600">{count} Qs</strong>
//                                                                 </span>
//                                                             ))}
//                                                         </div>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         </div>

//                                         <div>
//                                             <h3 className="text-lg font-bold text-gray-800 mb-4">Paper Details</h3>
//                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                                 <input type="text" name="testName" placeholder="Test Name (e.g. Unit Test 1)" value={testDetails.testName} onChange={handleDetailsChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
//                                                 <input type="text" name="duration" placeholder="Duration (e.g. 2 Hours)" value={testDetails.duration} onChange={handleDetailsChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
//                                             </div>
//                                         </div>

//                                         <div>
//                                             <h3 className="text-lg font-bold text-gray-800 mb-4">Assign Marks</h3>
//                                             <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
//                                                 <div className="max-h-[300px] overflow-y-auto">
//                                                     <table className="w-full text-left border-collapse">
//                                                         <thead className="bg-gray-50 sticky top-0 z-10">
//                                                             <tr>
//                                                                 <th className="p-4 text-sm font-bold text-gray-500 border-b">Question</th>
//                                                                 <th className="p-4 text-sm font-bold text-gray-500 border-b w-32 text-center">Marks</th>
//                                                             </tr>
//                                                         </thead>
//                                                         <tbody className="divide-y divide-gray-100">
//                                                             {selectedQuestions.map((item, idx) => (
//                                                                 <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
//                                                                     <td className="p-4">
//                                                                         <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mr-2 tracking-wider">{item.questionType}</span>
//                                                                         <div
//                                                                             className="text-sm font-medium text-gray-800 line-clamp-1 mt-1 [&_img]:h-5 [&_img]:w-auto [&_img]:inline-block [&_img]:align-middle [&_img]:mx-1"
//                                                                             dangerouslySetInnerHTML={{ __html: item.question.Title }}
//                                                                         />
//                                                                     </td>
//                                                                     <td className="p-4">
//                                                                         <input
//                                                                             type="number"
//                                                                             min="1"
//                                                                             value={item.marks}
//                                                                             onChange={(e) => handleMarkChange(idx, e.target.value)}
//                                                                             className="w-full text-center px-3 py-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
//                                                                         />
//                                                                     </td>
//                                                                 </tr>
//                                                             ))}
//                                                         </tbody>
//                                                     </table>
//                                                 </div>

//                                                 <div className="bg-gray-50 p-4 flex justify-end items-center gap-4 border-t border-gray-200">
//                                                     <span className="text-gray-500 font-semibold uppercase tracking-wider text-sm">Total Marks</span>
//                                                     <span className="text-2xl font-black text-gray-900 bg-white px-6 py-2 rounded-xl border border-gray-200 shadow-sm">{totalMarks}</span>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div>
//                                             <h3 className="text-lg font-bold text-gray-800 mb-4">School & Subject Info</h3>
//                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                                 <input type="text" name="schoolName" placeholder="School Name" value={testDetails.schoolName} onChange={handleDetailsChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium md:col-span-3" />
//                                                 <input type="text" name="className" placeholder="Class" value={testDetails.className} onChange={handleDetailsChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
//                                                 <input type="text" name="subject" placeholder="Subject" value={testDetails.subject} onChange={handleDetailsChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium md:col-span-2" />
//                                             </div>
//                                         </div>

//                                     </div>
//                                 )}

//                                 {/* ---------------- STEP 2: PREVIEW & PRINT ---------------- */}
//                                 {modalStep === 2 && (
//                                     <div className="animate-in fade-in duration-300 print:m-0">

//                                         <div className="flex justify-center mb-8 print:hidden">
//                                             <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner">
//                                                 <button onClick={() => setPreviewMode('student')} className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all ${previewMode === 'student' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
//                                                     <GraduationCap size={18} /> Student View
//                                                 </button>
//                                                 <button onClick={() => setPreviewMode('teacher')} className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold transition-all ${previewMode === 'teacher' ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>
//                                                     <BookOpen size={18} /> Teacher Key
//                                                 </button>
//                                             </div>
//                                         </div>

//                                         <div className="max-w-4xl mx-auto bg-white print:w-full">
//                                             <div className="text-center mb-10 pb-6 border-b-2 border-gray-800">
//                                                 <h1 className="text-3xl font-black uppercase tracking-wider text-gray-900 mb-2">{testDetails.schoolName || 'YOUR SCHOOL NAME'}</h1>
//                                                 <h2 className="text-xl font-bold text-gray-700 mb-6">{testDetails.testName || 'EXAMINATION PAPER'}</h2>

//                                                 <div className="flex flex-wrap justify-between text-sm font-bold text-gray-800 px-4">
//                                                     <div className="text-left space-y-1">
//                                                         <p>Class: <span className="font-medium border-b border-gray-400 min-w-[100px] inline-block">{testDetails.className}</span></p>
//                                                         <p>Subject: <span className="font-medium border-b border-gray-400 min-w-[100px] inline-block">{testDetails.subject}</span></p>
//                                                     </div>
//                                                     <div className="text-right space-y-1">
//                                                         <p>Time: <span className="font-medium border-b border-gray-400 min-w-[80px] inline-block">{testDetails.duration}</span></p>
//                                                         <p>Max Marks: <span className="font-medium border-b border-gray-400 min-w-[80px] inline-block text-center">{totalMarks}</span></p>
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {Object.entries(groupedSummary).map(([chapter, types]) => (
//                                                 <div key={chapter} className="mb-8">
//                                                     {Object.keys(types).map((type) => {
//                                                         const questionsForType = selectedQuestions.filter(q => q.chapterName === chapter && q.questionType === type);
//                                                         if (questionsForType.length === 0) return null;

//                                                         // Determine if this group is Match the Following
//                                                         const isMatchGroup = type.toLowerCase().includes('match');

//                                                         return (
//                                                             <div key={type} className="mb-8">
//                                                                 <h3 className="text-lg font-bold mb-4 bg-gray-100 py-2 px-3 border-l-4 border-gray-800 print:bg-transparent print:border-b-2 print:border-l-0 print:border-gray-800 print:p-0 print:pb-1">
//                                                                     {type}
//                                                                 </h3>

//                                                                 <div className="space-y-6">
//                                                                     {questionsForType.map((item, qIdx) => (
//                                                                         <div key={qIdx} className="flex gap-3 text-gray-900">
//                                                                             <div className="font-bold">{qIdx + 1}.</div>
//                                                                             <div className="flex-1">
//                                                                                 <div className="flex justify-between items-start gap-4">
//                                                                                     <div>
//                                                                                         {item.question.Header && <p className="text-sm font-semibold text-gray-600 mb-1">{item.question.Header}</p>}

//                                                                                         {/* Renders Title + Answer Side-by-Side if Match Group */}
//                                                                                         <div className={isMatchGroup ? "flex flex-wrap items-center gap-12" : ""}>
//                                                                                             <div
//                                                                                                 className="font-medium leading-relaxed [&_img]:max-w-full [&_img]:rounded-md [&_img]:mt-3 [&_img]:mb-2 [&_img]:block"
//                                                                                                 dangerouslySetInnerHTML={{ __html: item.question.Title }}
//                                                                                             />
//                                                                                             {isMatchGroup && item.question.Answer !== "Not Available" && (
//                                                                                                 <div
//                                                                                                     className="font-medium leading-relaxed [&_img]:max-w-full [&_img]:rounded-md [&_img]:mt-3 [&_img]:mb-2 [&_img]:block"
//                                                                                                     dangerouslySetInnerHTML={{ __html: item.question.Answer }}
//                                                                                                 />
//                                                                                             )}
//                                                                                         </div>

//                                                                                     </div>
//                                                                                     <div className="shrink-0 text-sm font-bold whitespace-nowrap">
//                                                                                         [{item.marks}]
//                                                                                     </div>
//                                                                                 </div>

//                                                                                 {item.question.Option && (
//                                                                                     <div className="mt-3 ml-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[15px]">
//                                                                                         {item.question.Option.split('|').map((opt, oIdx) => <div key={oIdx}>{opt.trim()}</div>)}
//                                                                                     </div>
//                                                                                 )}

//                                                                                 {/* Standard Answer Rendering (Hidden if it's a Match group) */}
//                                                                                 {!isMatchGroup && previewMode === 'teacher' && item.question.Answer !== "Not Available" ? (
//                                                                                     <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg print:border-none print:bg-transparent print:p-0 print:mt-2">
//                                                                                         <div className="text-emerald-800 font-bold flex gap-2">
//                                                                                             <span className="print:hidden bg-emerald-200 text-emerald-900 px-2 rounded text-xs py-0.5 self-start">Ans</span>
//                                                                                             <span className="print:block hidden uppercase text-xs mr-1 mt-1">Ans:</span>
//                                                                                             <div
//                                                                                                 className="[&_img]:max-w-full [&_img]:rounded-md [&_img]:mt-2 [&_img]:block"
//                                                                                                 dangerouslySetInnerHTML={{ __html: item.question.Answer }}
//                                                                                             />
//                                                                                         </div>
//                                                                                     </div>
//                                                                                 ) : (
//                                                                                     !isMatchGroup && !item.question.Option && previewMode === 'student' && (
//                                                                                         <div className="mt-8 border-b border-dotted border-gray-400 w-full"></div>
//                                                                                     )
//                                                                                 )}
//                                                                             </div>
//                                                                         </div>
//                                                                     ))}
//                                                                 </div>
//                                                             </div>
//                                                         )
//                                                     })}
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>

//                             <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center print:hidden rounded-b-3xl">
//                                 {modalStep === 1 ? (
//                                     <>
//                                         <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
//                                         <button onClick={() => setModalStep(2)} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md">
//                                             Next Step <ArrowRight size={18} />
//                                         </button>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <button onClick={() => setModalStep(1)} className="flex items-center gap-2 px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">
//                                             <ArrowLeft size={18} /> Back to Edit
//                                         </button>
//                                         <button onClick={handlePrint} className="flex items-center gap-2 px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg">
//                                             <Printer size={18} /> Print Paper
//                                         </button>
//                                     </>
//                                 )}
//                             </div>
//                         </motion.div>
//                     </motion.div>
//                 )}
//             </AnimatePresence>

//         </div>
//     );
// };

// export default TestGenerator;


























