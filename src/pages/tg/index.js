import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Printer, FileText, X, Trash2, ArrowRight, ArrowLeft,
    Settings, Eye, CheckCircle2, GraduationCap, BookOpen
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

    // Test Details Form State
    const [testDetails, setTestDetails] = useState({
        testName: '', duration: '', schoolName: '', className: '', subject: ''
    });

    const totalMarks = useMemo(() => {
        return selectedQuestions.reduce((sum, item) => sum + (Number(item.marks) || 0), 0);
    }, [selectedQuestions]);

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
            return [...prev, { question, chapterName, questionType, marks: 1 }];
        });
    };

    const handleMarkChange = (index, value) => {
        const newSelected = [...selectedQuestions];
        newSelected[index].marks = value;
        setSelectedQuestions(newSelected);
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
                                        // Logic to check if this is a Match question
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

                                                                        {/* If Match, render Title and Answer side by side */}
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

                                                                    {/* Standard Answer key for non-match questions in main view */}
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

                                {/* ---------------- STEP 1: CONFIGURATION ---------------- */}
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

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-4">Paper Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input type="text" name="testName" placeholder="Test Name (e.g. Unit Test 1)" value={testDetails.testName} onChange={handleDetailsChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                                                <input type="text" name="duration" placeholder="Duration (e.g. 2 Hours)" value={testDetails.duration} onChange={handleDetailsChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-4">Assign Marks</h3>
                                            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                                <div className="max-h-[300px] overflow-y-auto">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead className="bg-gray-50 sticky top-0 z-10">
                                                            <tr>
                                                                <th className="p-4 text-sm font-bold text-gray-500 border-b">Question</th>
                                                                <th className="p-4 text-sm font-bold text-gray-500 border-b w-32 text-center">Marks</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {selectedQuestions.map((item, idx) => (
                                                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                                    <td className="p-4">
                                                                        <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mr-2 tracking-wider">{item.questionType}</span>
                                                                        <div
                                                                            className="text-sm font-medium text-gray-800 line-clamp-1 mt-1 [&_img]:h-5 [&_img]:w-auto [&_img]:inline-block [&_img]:align-middle [&_img]:mx-1"
                                                                            dangerouslySetInnerHTML={{ __html: item.question.Title }}
                                                                        />
                                                                    </td>
                                                                    <td className="p-4">
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            value={item.marks}
                                                                            onChange={(e) => handleMarkChange(idx, e.target.value)}
                                                                            className="w-full text-center px-3 py-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="bg-gray-50 p-4 flex justify-end items-center gap-4 border-t border-gray-200">
                                                    <span className="text-gray-500 font-semibold uppercase tracking-wider text-sm">Total Marks</span>
                                                    <span className="text-2xl font-black text-gray-900 bg-white px-6 py-2 rounded-xl border border-gray-200 shadow-sm">{totalMarks}</span>
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

                                        <div className="max-w-4xl mx-auto bg-white print:w-full">
                                            <div className="text-center mb-10 pb-6 border-b-2 border-gray-800">
                                                <h1 className="text-3xl font-black uppercase tracking-wider text-gray-900 mb-2">{testDetails.schoolName || 'YOUR SCHOOL NAME'}</h1>
                                                <h2 className="text-xl font-bold text-gray-700 mb-6">{testDetails.testName || 'EXAMINATION PAPER'}</h2>

                                                <div className="flex flex-wrap justify-between text-sm font-bold text-gray-800 px-4">
                                                    <div className="text-left space-y-1">
                                                        <p>Class: <span className="font-medium border-b border-gray-400 min-w-[100px] inline-block">{testDetails.className}</span></p>
                                                        <p>Subject: <span className="font-medium border-b border-gray-400 min-w-[100px] inline-block">{testDetails.subject}</span></p>
                                                    </div>
                                                    <div className="text-right space-y-1">
                                                        <p>Time: <span className="font-medium border-b border-gray-400 min-w-[80px] inline-block">{testDetails.duration}</span></p>
                                                        <p>Max Marks: <span className="font-medium border-b border-gray-400 min-w-[80px] inline-block text-center">{totalMarks}</span></p>
                                                    </div>
                                                </div>
                                            </div>

                                            {Object.entries(groupedSummary).map(([chapter, types]) => (
                                                <div key={chapter} className="mb-8">
                                                    {Object.keys(types).map((type) => {
                                                        const questionsForType = selectedQuestions.filter(q => q.chapterName === chapter && q.questionType === type);
                                                        if (questionsForType.length === 0) return null;

                                                        // Determine if this group is Match the Following
                                                        const isMatchGroup = type.toLowerCase().includes('match');

                                                        return (
                                                            <div key={type} className="mb-8">
                                                                <h3 className="text-lg font-bold mb-4 bg-gray-100 py-2 px-3 border-l-4 border-gray-800 print:bg-transparent print:border-b-2 print:border-l-0 print:border-gray-800 print:p-0 print:pb-1">
                                                                    {type}
                                                                </h3>

                                                                <div className="space-y-6">
                                                                    {questionsForType.map((item, qIdx) => (
                                                                        <div key={qIdx} className="flex gap-3 text-gray-900">
                                                                            <div className="font-bold">{qIdx + 1}.</div>
                                                                            <div className="flex-1">
                                                                                <div className="flex justify-between items-start gap-4">
                                                                                    <div>
                                                                                        {item.question.Header && <p className="text-sm font-semibold text-gray-600 mb-1">{item.question.Header}</p>}

                                                                                        {/* Renders Title + Answer Side-by-Side if Match Group */}
                                                                                        <div className={isMatchGroup ? "flex flex-wrap items-center gap-12" : ""}>
                                                                                            <div
                                                                                                className="font-medium leading-relaxed [&_img]:max-w-full [&_img]:rounded-md [&_img]:mt-3 [&_img]:mb-2 [&_img]:block"
                                                                                                dangerouslySetInnerHTML={{ __html: item.question.Title }}
                                                                                            />
                                                                                            {isMatchGroup && item.question.Answer !== "Not Available" && (
                                                                                                <div
                                                                                                    className="font-medium leading-relaxed [&_img]:max-w-full [&_img]:rounded-md [&_img]:mt-3 [&_img]:mb-2 [&_img]:block"
                                                                                                    dangerouslySetInnerHTML={{ __html: item.question.Answer }}
                                                                                                />
                                                                                            )}
                                                                                        </div>

                                                                                    </div>
                                                                                    <div className="shrink-0 text-sm font-bold whitespace-nowrap">
                                                                                        [{item.marks}]
                                                                                    </div>
                                                                                </div>

                                                                                {item.question.Option && (
                                                                                    <div className="mt-3 ml-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[15px]">
                                                                                        {item.question.Option.split('|').map((opt, oIdx) => <div key={oIdx}>{opt.trim()}</div>)}
                                                                                    </div>
                                                                                )}

                                                                                {/* Standard Answer Rendering (Hidden if it's a Match group) */}
                                                                                {!isMatchGroup && previewMode === 'teacher' && item.question.Answer !== "Not Available" ? (
                                                                                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg print:border-none print:bg-transparent print:p-0 print:mt-2">
                                                                                        <div className="text-emerald-800 font-bold flex gap-2">
                                                                                            <span className="print:hidden bg-emerald-200 text-emerald-900 px-2 rounded text-xs py-0.5 self-start">Ans</span>
                                                                                            <span className="print:block hidden uppercase text-xs mr-1 mt-1">Ans:</span>
                                                                                            <div
                                                                                                className="[&_img]:max-w-full [&_img]:rounded-md [&_img]:mt-2 [&_img]:block"
                                                                                                dangerouslySetInnerHTML={{ __html: item.question.Answer }}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    !isMatchGroup && !item.question.Option && previewMode === 'student' && (
                                                                                        <div className="mt-8 border-b border-dotted border-gray-400 w-full"></div>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>
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
                                        <button onClick={handlePrint} className="flex items-center gap-2 px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg">
                                            <Printer size={18} /> Print Paper
                                        </button>
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
// import { Printer, BookOpen, GraduationCap, X, Trash2 } from 'lucide-react';

// // Adjust this path based on your folder structure
// import tgData from '../../datas/tg.json';

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

//     const [activeChapters, setActiveChapters] = useState([]);
//     const [activeFilters, setActiveFilters] = useState([]);

//     // Now stores objects: { question: object, chapterName: string, questionType: string }
//     const [selectedQuestions, setSelectedQuestions] = useState([]);
//     const [viewMode, setViewMode] = useState('student');

//     const displayedChapters = useMemo(() => {
//         return allChapters
//             .filter(ch => activeChapters.includes(ch.Chapter_name))
//             .map(ch => ({
//                 ...ch,
//                 Questions_type: ch.Questions_type.filter(section => activeFilters.includes(section.type))
//             }))
//             .filter(ch => ch.Questions_type.length > 0);
//     }, [allChapters, activeChapters, activeFilters]);

//     const toggleChapter = (chapterName) => {
//         setActiveChapters(prev =>
//             prev.includes(chapterName)
//                 ? prev.filter(c => c !== chapterName)
//                 : [...prev, chapterName]
//         );
//     };

//     const toggleFilter = (type) => {
//         setActiveFilters(prev =>
//             prev.includes(type)
//                 ? prev.filter(item => item !== type)
//                 : [...prev, type]
//         );
//     };

//     // Updated to track the chapter AND the question type alongside the question
//     const toggleQuestionSelection = (question, chapterName, questionType) => {
//         setSelectedQuestions(prev => {
//             const isAlreadySelected = prev.some(item => item.question === question);
//             if (isAlreadySelected) {
//                 return prev.filter(item => item.question !== question);
//             } else {
//                 return [...prev, { question, chapterName, questionType }];
//             }
//         });
//     };

//     const clearSelectedQuestions = () => {
//         setSelectedQuestions([]);
//     };

//     const handlePrint = () => {
//         window.print();
//     };

//     return (
//         <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 font-sans text-gray-900">

//             {/* Header */}
//             <motion.header
//                 initial={{ y: -20, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 className="sticky top-4 z-50 mx-auto max-w-6xl mb-12 flex flex-col md:flex-row items-center justify-between p-6 bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/40"
//             >
//                 <div>
//                     <h1 className="text-3xl font-bold tracking-tight text-gray-900">
//                         Question Bank
//                     </h1>
//                     <p className="text-gray-500 font-medium mt-1">Test Paper Generator</p>
//                 </div>

//                 <div className="flex items-center gap-4 mt-6 md:mt-0">
//                     <div className="flex bg-gray-100/80 p-1 rounded-2xl">
//                         <button
//                             onClick={() => setViewMode('student')}
//                             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${viewMode === 'student' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
//                                 }`}
//                         >
//                             <GraduationCap size={18} />
//                             Student
//                         </button>
//                         <button
//                             onClick={() => setViewMode('teacher')}
//                             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${viewMode === 'teacher' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'
//                                 }`}
//                         >
//                             <BookOpen size={18} />
//                             Teacher
//                         </button>
//                     </div>

//                     <button
//                         onClick={handlePrint}
//                         className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-semibold hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
//                     >
//                         <Printer size={18} />
//                         Print
//                     </button>
//                 </div>
//             </motion.header>

//             <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

//                 {/* Left Column: Filters */}
//                 <div className="lg:col-span-4 print:hidden space-y-6">

//                     {/* Chapter Filter */}
//                     <div className="bg-white/60 backdrop-blur-lg p-6 rounded-3xl shadow-sm border border-gray-100">
//                         <div className="flex items-center justify-between mb-5">
//                             <h2 className="text-xl font-bold tracking-tight">Chapters</h2>
//                             <div className="flex gap-3 text-sm">
//                                 <button
//                                     onClick={() => setActiveChapters(chapterOptions)}
//                                     className="text-blue-600 font-medium hover:underline"
//                                 >
//                                     All
//                                 </button>
//                                 <button
//                                     onClick={() => setActiveChapters([])}
//                                     className="text-gray-400 hover:text-gray-600 transition-colors"
//                                 >
//                                     Clear
//                                 </button>
//                             </div>
//                         </div>
//                         <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2">
//                             {chapterOptions.map(chapter => {
//                                 const isActive = activeChapters.includes(chapter);
//                                 return (
//                                     <label
//                                         key={`side-ch-${chapter}`}
//                                         className="flex items-start gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
//                                     >
//                                         <input
//                                             type="checkbox"
//                                             checked={isActive}
//                                             onChange={() => toggleChapter(chapter)}
//                                             className="mt-0.5 w-5 h-5 shrink-0 text-blue-600 border-2 border-gray-300 rounded cursor-pointer accent-blue-600 transition-all"
//                                         />
//                                         <span className={`text-[15px] font-medium leading-tight transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>
//                                             {chapter}
//                                         </span>
//                                     </label>
//                                 )
//                             })}
//                         </div>
//                     </div>

//                     {/* Question Type Filter */}
//                     <div className="bg-white/60 backdrop-blur-lg p-6 rounded-3xl shadow-sm border border-gray-100">
//                         <div className="flex items-center justify-between mb-5">
//                             <h2 className="text-xl font-bold tracking-tight">Question Types</h2>
//                             <div className="flex gap-3 text-sm">
//                                 <button
//                                     onClick={() => setActiveFilters(allQuestionTypes)}
//                                     className="text-blue-600 font-medium hover:underline"
//                                 >
//                                     All
//                                 </button>
//                                 <button
//                                     onClick={() => setActiveFilters([])}
//                                     className="text-gray-400 hover:text-gray-600 transition-colors"
//                                 >
//                                     Clear
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="flex flex-col gap-3">
//                             {allQuestionTypes.map(option => {
//                                 const isActive = activeFilters.includes(option);
//                                 return (
//                                     <label
//                                         key={`side-type-${option}`}
//                                         className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
//                                     >
//                                         <input
//                                             type="checkbox"
//                                             checked={isActive}
//                                             onChange={() => toggleFilter(option)}
//                                             className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded cursor-pointer accent-blue-600 transition-all"
//                                         />
//                                         <span className={`text-[15px] font-medium transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>
//                                             {option}
//                                         </span>
//                                     </label>
//                                 )
//                             })}
//                         </div>
//                     </div>

//                     {/* Selected Questions Box */}
//                     <div className="bg-white/60 backdrop-blur-lg p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col max-h-[400px]">
//                         <div className="flex items-center justify-between mb-4">
//                             <h2 className="text-xl font-bold tracking-tight">
//                                 Selected ({selectedQuestions.length})
//                             </h2>
//                             {selectedQuestions.length > 0 && (
//                                 <button
//                                     onClick={clearSelectedQuestions}
//                                     className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
//                                 >
//                                     <Trash2 size={14} /> Clear All
//                                 </button>
//                             )}
//                         </div>

//                         <div className="overflow-y-auto pr-2 -mr-2 space-y-2 flex-1">
//                             {selectedQuestions.length === 0 ? (
//                                 <div className="text-sm text-gray-500 font-medium">
//                                     No questions ticked yet.
//                                 </div>
//                             ) : (
//                                 <AnimatePresence>
//                                     {selectedQuestions.map((item, idx) => {
//                                         const q = item.question;
//                                         const shortChapName = item.chapterName.split('.')[0];

//                                         return (
//                                             <motion.div
//                                                 key={`selected-${q.Title}-${idx}`}
//                                                 initial={{ opacity: 0, height: 0, marginBottom: 0 }}
//                                                 animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
//                                                 exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.9 }}
//                                                 transition={{ duration: 0.2 }}
//                                                 className="flex items-start gap-3 p-3 bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden group"
//                                             >
//                                                 <div className="flex-1 min-w-0">
//                                                     {/* UPDATED: Displays Chapter, Question Type, and Header */}
//                                                     <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
//                                                         <span className="text-[9px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
//                                                             {shortChapName}
//                                                         </span>
//                                                         <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded tracking-wide truncate max-w-[120px]">
//                                                             {item.questionType}
//                                                         </span>
//                                                         <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider truncate max-w-[80px]">
//                                                             {q.Header}
//                                                         </span>
//                                                     </div>

//                                                     <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{q.Title}</p>
//                                                 </div>
//                                                 <button
//                                                     // Passing all 3 params in case we need to remove it
//                                                     onClick={() => toggleQuestionSelection(q, item.chapterName, item.questionType)}
//                                                     className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors mt-1 shrink-0"
//                                                     title="Remove question"
//                                                 >
//                                                     <X size={16} strokeWidth={2.5} />
//                                                 </button>
//                                             </motion.div>
//                                         )
//                                     })}
//                                 </AnimatePresence>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Right Column: Main Area */}
//                 <div className="lg:col-span-8 bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 print:shadow-none print:border-none print:p-0">

//                     <div className="hidden print:block mb-8 text-center">
//                         <h1 className="text-3xl font-bold">Examination Paper</h1>
//                         <h2 className="text-xl mt-2 text-gray-600">
//                             {viewMode === 'teacher' ? 'Answer Key' : 'Student Copy'}
//                         </h2>
//                         <div className="w-full h-px bg-gray-200 mt-6"></div>
//                     </div>

//                     {/* ACTIVE FILTER TAGS UI */}
//                     <div className="print:hidden mb-8">
//                         {(activeChapters.length > 0 || activeFilters.length > 0) && (
//                             <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Active Filters</h3>
//                         )}
//                         <div className="flex flex-wrap gap-2">
//                             <AnimatePresence>
//                                 {activeChapters.map(chapter => (
//                                     <motion.button
//                                         key={`tag-${chapter}`}
//                                         initial={{ opacity: 0, scale: 0.8 }}
//                                         animate={{ opacity: 1, scale: 1 }}
//                                         exit={{ opacity: 0, scale: 0.8, width: 0, padding: 0, margin: 0 }}
//                                         onClick={() => toggleChapter(chapter)}
//                                         className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/50 backdrop-blur-md border border-blue-200/60 text-blue-700 rounded-full text-sm font-semibold hover:bg-blue-100/50 transition-colors"
//                                     >
//                                         <span className="truncate max-w-[150px]">{chapter}</span>
//                                         <div className="bg-blue-200/50 rounded-full p-0.5"><X size={12} strokeWidth={3} /></div>
//                                     </motion.button>
//                                 ))}

//                                 {activeFilters.map(filter => (
//                                     <motion.button
//                                         key={`tag-${filter}`}
//                                         initial={{ opacity: 0, scale: 0.8 }}
//                                         animate={{ opacity: 1, scale: 1 }}
//                                         exit={{ opacity: 0, scale: 0.8, width: 0, padding: 0, margin: 0 }}
//                                         onClick={() => toggleFilter(filter)}
//                                         className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100/50 backdrop-blur-md border border-gray-200/60 text-gray-700 rounded-full text-sm font-semibold hover:bg-gray-200/50 transition-colors"
//                                     >
//                                         <span>{filter}</span>
//                                         <div className="bg-gray-200/80 rounded-full p-0.5"><X size={12} strokeWidth={3} /></div>
//                                     </motion.button>
//                                 ))}
//                             </AnimatePresence>
//                         </div>
//                     </div>

//                     {/* Question Display Area */}
//                     {displayedChapters.length === 0 ? (
//                         <div className="text-center py-12 text-gray-400 font-medium print:hidden">
//                             Please select at least one Chapter and Question Type from the filters.
//                         </div>
//                     ) : (
//                         <AnimatePresence mode="popLayout">
//                             {displayedChapters.map((chapter, cIdx) => (
//                                 <motion.div
//                                     key={chapter.Chapter_name}
//                                     initial={{ opacity: 0, y: 20 }}
//                                     animate={{ opacity: 1, y: 0 }}
//                                     exit={{ opacity: 0, scale: 0.95 }}
//                                     transition={{ duration: 0.3 }}
//                                     className="mb-14"
//                                 >
//                                     <div className="bg-gray-50 p-4 rounded-2xl mb-8 border border-gray-100 print:bg-transparent print:border-none print:p-0">
//                                         <h2 className="text-2xl font-black tracking-tight text-blue-900 print:text-black">
//                                             {chapter.Chapter_name}
//                                         </h2>
//                                     </div>

//                                     {chapter.Questions_type.map((section, sIdx) => (
//                                         <div key={section.type} className="mb-10 pl-2 print:pl-0">
//                                             <h3 className="text-xl font-bold tracking-tight mb-6 pb-2 border-b-2 border-gray-100 text-gray-800">
//                                                 {section.type}
//                                             </h3>

//                                             <div className="space-y-4">
//                                                 {section.Questions.map((q, qIdx) => {
//                                                     const isSelected = selectedQuestions.some(item => item.question === q);

//                                                     return (
//                                                         <div
//                                                             key={`${cIdx}-${sIdx}-${qIdx}`}
//                                                             // Pass the type down here!
//                                                             onClick={() => toggleQuestionSelection(q, chapter.Chapter_name, section.type)}
//                                                             className={`group relative p-5 rounded-2xl transition-all cursor-pointer border-2 print:border-none print:p-2 print:mb-4 ${isSelected
//                                                                 ? 'border-blue-500 bg-blue-50/30'
//                                                                 : 'border-transparent hover:bg-gray-50'
//                                                                 }`}
//                                                         >
//                                                             <div className="absolute left-4 top-6 print:hidden">
//                                                                 <input
//                                                                     type="checkbox"
//                                                                     checked={isSelected}
//                                                                     readOnly
//                                                                     className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded cursor-pointer pointer-events-none accent-blue-600"
//                                                                 />
//                                                             </div>

//                                                             <div className="pl-10 print:pl-0">
//                                                                 <p className="text-sm font-semibold text-gray-500 mb-1">{q.Header}</p>
//                                                                 <p className="text-lg font-medium text-gray-900 leading-relaxed">
//                                                                     {qIdx + 1}. {q.Title}
//                                                                 </p>

//                                                                 {q.Option && q.Option.length > 0 && (
//                                                                     <div className="mt-3 text-gray-600 font-medium pl-4 border-l-2 border-gray-200">
//                                                                         {q.Option.split('|').map((opt, oIdx) => (
//                                                                             <div key={oIdx} className="py-1">{opt.trim()}</div>
//                                                                         ))}
//                                                                     </div>
//                                                                 )}

//                                                                 <AnimatePresence>
//                                                                     {viewMode === 'teacher' && q.Answer !== "Not Available" && (
//                                                                         <motion.div
//                                                                             initial={{ opacity: 0, height: 0 }}
//                                                                             animate={{ opacity: 1, height: 'auto' }}
//                                                                             exit={{ opacity: 0, height: 0 }}
//                                                                             className="mt-4 pt-3 border-t border-emerald-100 overflow-hidden"
//                                                                         >
//                                                                             <p className="text-emerald-700 font-semibold flex items-start gap-2">
//                                                                                 <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-sm shrink-0">Ans</span>
//                                                                                 <span>{q.Answer}</span>
//                                                                             </p>
//                                                                         </motion.div>
//                                                                     )}
//                                                                 </AnimatePresence>

//                                                                 {viewMode === 'student' && !q.Option && (
//                                                                     <div className="hidden print:block mt-8 border-b border-gray-300 w-full"></div>
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                     )
//                                                 })}
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </motion.div>
//                             ))}
//                         </AnimatePresence>
//                     )}
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default TestGenerator;