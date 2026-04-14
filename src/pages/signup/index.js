// src/pages/login.js
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useState } from 'react';

export default function Login() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            <Head>
                <title>DigiGyan | Book Portal Login</title>
            </Head>

            {/* Playful Green-White Gradient Background */}
            <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-green-100 via-white to-green-50">

                {/* Floating decorative blobs for the childish theme */}
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-green-200/40 blur-3xl"
                />
                <motion.div
                    animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        duration: 0.6
                    }}
                    className="z-10 w-full max-w-md p-6"
                >
                    {/* Glassmorphism Card with soft, rounded edges */}
                    <div className="overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/70 p-8 shadow-2xl backdrop-blur-xl">
                        <div className="mb-8 text-center">
                            <motion.div
                                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 0.5 }}
                                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-4xl text-white shadow-lg shadow-green-200"
                            >
                                📚
                            </motion.div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-800">
                                Welcome Back!
                            </h1>
                            <p className="mt-2 text-sm font-medium text-gray-500">
                                Ready to explore new stories today?
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-1">
                                <label className="ml-2 text-sm font-semibold text-gray-600">Username</label>
                                <input
                                    type="text"
                                    placeholder="Enter your magical ID"
                                    className="w-full rounded-2xl border-2 border-transparent bg-white px-5 py-4 text-gray-700 shadow-inner outline-none transition-all focus:border-green-400 focus:bg-green-50/50 focus:ring-4 focus:ring-green-400/20"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="ml-2 text-sm font-semibold text-gray-600">Password</label>
                                <input
                                    type="password"
                                    placeholder="Secret password"
                                    className="w-full rounded-2xl border-2 border-transparent bg-white px-5 py-4 text-gray-700 shadow-inner outline-none transition-all focus:border-green-400 focus:bg-green-50/50 focus:ring-4 focus:ring-green-400/20"
                                />
                            </div>

                            <motion.button
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-400 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-green-300 transition-shadow hover:shadow-xl"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Let's Read!
                                    <motion.span animate={{ x: isHovered ? 5 : 0 }}>
                                        🚀
                                    </motion.span>
                                </span>
                            </motion.button>
                        </form>

                        <div className="mt-6 text-center">
                            <a href="#" className="text-sm font-medium text-green-600 transition-colors hover:text-green-700 hover:underline">
                                Forgot your password?
                            </a>
                        </div>
                    </div>
                </motion.div>
            </section>
        </>
    );
}