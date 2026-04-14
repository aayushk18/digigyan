import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, Loader2 } from 'lucide-react';

import { useRouter } from 'next/navigation'; // For App Router (Next.js 13/14+)
import { useApp } from '@/context/AppContext';

const ManualEntry = ({ onBack }) => {
    const [categories, setCategories] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);

    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);

    const { config } = useApp();

    const PR_APP_KEY = config.PR_APP_KEY;
    const PR_TOKEN = config.PR_TOKEN;

    // 1. Fetch Categories on Mount
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const response = await fetch('https://apis.tlmate.com/content-api/categories-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        CBT_REQUEST_DATA: { PR_APP_KEY, PR_TOKEN }
                    })
                });
                const result = await response.json();
                if (result.STATUS === "SUCCESS") {
                    setCategories(result.DATA);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // 2. Fetch Classes when Category is Selected
    const handleCategorySelect = async (category) => {
        setSelectedCategory(category);
        setSelectedClass(null);
        setClasses([]);
        setLoadingClasses(true);

        try {
            const response = await fetch('https://apis.tlmate.com/content-api/classes-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    CBT_REQUEST_DATA: {
                        PR_CATEGORY_ID: category.PR_CATEGORY_ID.toString(),
                        PR_TOKEN,
                        PR_APP_KEY
                    }
                })
            });
            const result = await response.json();
            if (result.STATUS === "SUCCESS") {
                setClasses(result.DATA);
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
        } finally {
            setLoadingClasses(false);
        }
    };




    // Inside your ManualEntry component:
    const router = useRouter();

    const handleContinue = () => {
        if (selectedCategory && selectedClass) {
            // In Next.js, we use router.push()
            router.push(`/subjects?categoryid=${selectedCategory.PR_CATEGORY_ID}&classid=${selectedClass.PR_CLASS_ID}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-white rounded-full border border-transparent hover:border-slate-200 transition-all"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <h1 className="text-2xl font-bold text-slate-800">Manual Entry Setup</h1>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Step 1: Select Series (Category) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold">1</div>
                        <h2 className="font-semibold text-slate-700">Select Book Series</h2>
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {loadingCategories ? (
                            <div className="flex flex-col items-center py-10 text-slate-400">
                                <Loader2 className="animate-spin mb-2" />
                                <p className="text-sm">Loading series...</p>
                            </div>
                        ) : (
                            categories.map((cat) => (
                                <button
                                    key={cat.PR_CATEGORY_ID}
                                    onClick={() => handleCategorySelect(cat)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedCategory?.PR_CATEGORY_ID === cat.PR_CATEGORY_ID
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                        : 'border-slate-100 hover:border-indigo-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <BookOpen size={18} />
                                        <span className="font-medium">{cat.PR_NAME}</span>
                                    </div>
                                    <ChevronRight size={16} className={selectedCategory?.PR_CATEGORY_ID === cat.PR_CATEGORY_ID ? 'opacity-100' : 'opacity-30'} />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Step 2: Select Class */}
                <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all ${!selectedCategory ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold">2</div>
                        <h2 className="font-semibold text-slate-700">Select Class</h2>
                    </div>

                    {loadingClasses ? (
                        <div className="flex flex-col items-center py-12 text-slate-400">
                            <Loader2 className="animate-spin mb-2" />
                            <p className="text-sm">Fetching classes...</p>
                        </div>
                    ) : selectedCategory ? (
                        <div className="grid grid-cols-2 gap-3">
                            {classes.map((cls) => (
                                <button
                                    key={cls.PR_CLASS_ID}
                                    onClick={() => setSelectedClass(cls)}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${selectedClass?.PR_CLASS_ID === cls.PR_CLASS_ID
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                        : 'border-slate-100 hover:border-emerald-200 text-slate-600'
                                        }`}
                                >
                                    {cls.PR_NAME}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400 italic">
                            Please select a series first
                        </div>
                    )}

                    {selectedClass && (
                        <button onClick={handleContinue} className="w-full mt-8 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-100 animate-in fade-in slide-in-from-bottom-2">
                            Continue with {selectedClass.PR_NAME}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ManualEntry;