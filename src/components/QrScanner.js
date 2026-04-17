"use client"; // Required for Next.js App Router
import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QrScanner = ({ onResult }) => {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
        });

        scanner.render(
            (decodedText) => {
                onResult(decodedText);
                // Optional: stop scanning after a result
                // scanner.clear(); 
            },
            (error) => {
                // Log errors only if necessary, as this fires constantly
            }
        );

        // Cleanup: Stop the camera when the component unmounts
        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, [onResult]);

    return (
        <div className="w-full max-w-lg mx-auto">
            <div id="reader"></div>
        </div>
    );
};

export default QrScanner;