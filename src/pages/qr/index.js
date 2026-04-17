"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import QrScanner from '@/components/QrScanner';



export default function ScanPage() {
    const [scanResult, setScanResult] = useState(null);

    return (
        <main className="flex flex-col items-center p-10">
            <h1 className="text-2xl font-bold mb-4">QR Code Scanner</h1>

            {!scanResult ? (
                <QrScanner onResult={(res) => setScanResult(res)} />
            ) : (
                <div className="text-center">
                    <p className="bg-green-100 p-4 rounded text-green-800 mb-4">
                        <strong>Scanned:</strong> {scanResult}
                    </p>
                    <button
                        onClick={() => setScanResult(null)}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Scan Again
                    </button>
                </div>
            )}
        </main>
    );
}