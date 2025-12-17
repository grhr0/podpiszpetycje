import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Download, Loader2 } from 'lucide-react';

const API_URL = 'https://shy-pets-push.loca.lt/api';

export default function Step2Download() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {}; // Expecting { data: { full_name, address, pesel } }
    const [status, setStatus] = useState("loading"); // loading, success, error
    const downloadTriggeredRef = useRef(false); // Use useRef to track if download has been triggered
    const [downloadUrl, setDownloadUrl] = useState(null); // Keep downloadUrl for manual download link

    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (!state?.user_data) { // Check for state.user_data
            navigate('/krok-1'); // Redirect if no data
            return;
        }

        const generateAndDownload = async () => {
            if (downloadTriggeredRef.current) {
                // If download was already triggered, and we have a URL, set status to success
                // This handles cases where the component re-renders but the download shouldn't re-initiate
                if (downloadUrl) {
                    setStatus('success');
                }
                return;
            }

            downloadTriggeredRef.current = true; // Mark download as triggered
            setErrorMessage(null);

            try {
                const response = await axios.post(`${API_URL}/generate-pdf/`, state.user_data, { // Use state.user_data
                    responseType: 'blob'
                });

                // Create Blob URL
                const url = window.URL.createObjectURL(new Blob([response.data]));
                setDownloadUrl(url); // Store URL for manual download

                // Auto-trigger download
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `wykaz-poparcia-${state.user_data.pesel}.pdf`); // Use state.user_data.pesel
                document.body.appendChild(link);
                link.click();
                link.remove();

                setStatus('success');
            } catch (err) {
                console.error("PDF Gen Error", err);
                setStatus('error');
                if (err.response && err.response.data) {
                    // Try to parse blob error if json
                    if (err.response.data instanceof Blob) {
                        const reader = new FileReader();
                        reader.onload = () => {
                            try {
                                const errorJson = JSON.parse(reader.result);
                                setErrorMessage(JSON.stringify(errorJson));
                            } catch (e) {
                                setErrorMessage("Wystąpił nieznany błąd.");
                            }
                        };
                        reader.readAsText(err.response.data);
                    } else {
                        setErrorMessage(JSON.stringify(err.response.data));
                    }
                } else {
                    setErrorMessage(err.message || "Błąd połączenia.");
                }
                downloadTriggeredRef.current = false; // Allow retry if failed
            }
        };

        generateAndDownload();

        // Cleanup
        return () => {
            if (downloadUrl) window.URL.revokeObjectURL(downloadUrl);
        };
    }, [state, navigate, downloadUrl]); // Add state, navigate, and downloadUrl to dependencies

    const handleRetry = () => {
        setStatus("loading");
        downloadTriggeredRef.current = false;
        // Effect will re-run because status changed? No, effect depends on state/navigate.
        // Actually simplicity: we can just manually call the function or force re-render.
        // Easier: just reload logic. But effect dep array is [state, navigate].
        // Let's just reload the page or navigate back and forth?
        // Better: Extract logic or just let the user go back.
        // For now simple fix:
        window.location.reload();
    };

    return (
        <div className="text-center py-10 space-y-6">
            {status === 'loading' && (
                <>
                    <Loader2 className="w-16 h-16 text-slate-900 animate-spin mx-auto" />
                    <h2 className="text-xl font-bold">Generowanie dokumentu...</h2>
                    <p className="text-slate-500">Proszę czekać, przygotowujemy Twój spersonalizowany plik PDF.</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Dokument gotowy!</h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Plik <strong>wykaz-poparcia.pdf</strong> powinien zostać pobrany automatycznie.
                        Jeśli nie, <button onClick={() => window.open(downloadUrl)} className="text-blue-600 underline font-medium">kliknij tutaj</button>.
                    </p>

                    <div className="pt-8 border-t border-slate-100 mt-8">
                        <button
                            onClick={() => navigate('/krok-3', { state: { user_data: state.user_data } })}
                            className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg"
                        >
                            Przejdź do instrukcji podpisywania &rarr;
                        </button>
                    </div>
                </>
            )}

            {status === 'error' && (
                <>
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold">!</span>
                    </div>
                    <h2 className="text-xl font-bold">Błąd generowania</h2>
                    <p className="text-slate-500">
                        Nie udało się wygenerować pliku.
                        {errorMessage && <span className="block mt-2 font-mono text-sm text-red-600 bg-red-50 p-2 rounded">{errorMessage}</span>}
                    </p>
                    <button
                        onClick={handleRetry}
                        className="mt-4 px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                    >
                        Wróć do formularza
                    </button>
                </>
            )}
        </div>
    );
}
