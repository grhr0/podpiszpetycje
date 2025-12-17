import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, FileText, CheckCircle, AlertOctagon } from 'lucide-react';

const API_URL = 'https://shy-pets-push.loca.lt/api';

export default function Step4Upload() {
    const navigate = useNavigate();
    const location = useLocation();
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Data from previous steps or empty
    const [formData, setFormData] = useState({
        full_name: '',
        address: '',
        pesel: ''
    });

    useEffect(() => {
        if (!location.state?.user_data) {
            // If no data, redirect to Step 1
            // But checking if maybe we just loaded?
            // Safer to redirect
            navigate('/krok-1');
            return;
        }
        setFormData(location.state.user_data);
    }, [location.state, navigate]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Musisz wybrać plik PDF.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const data = new FormData();
        data.append('file', file);
        data.append('full_name', formData.full_name);
        data.append('address', formData.address);
        data.append('pesel', formData.pesel);

        try {
            const response = await axios.post(`${API_URL}/verify-pdf/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/sukces');
        } catch (err) {
            console.error(err);
            let msg = "Weryfikacja nie powiodła się. Sprawdź czy plik jest poprawnie podpisany.";

            if (err.response?.data) {
                if (err.response.data.error) {
                    msg = err.response.data.error;
                } else if (err.response.data.non_field_errors) {
                    msg = err.response.data.non_field_errors.join(', ');
                } else {
                    // It might be field errors like {"pesel": ["Error..."]}
                    msg = JSON.stringify(err.response.data);
                }
            }
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900">Krok 4: Wyślij i Zweryfikuj</h2>
                <p className="text-slate-500 mt-2">Prześlij podpisany plik PDF, aby zakończyć proces.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Upload Zone */}
                <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${file ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}`}>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="document-upload"
                    />

                    {!file ? (
                        <label htmlFor="document-upload" className="cursor-pointer block">
                            <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-slate-700">Kliknij, aby wybrać plik</p>
                            <p className="text-sm text-slate-400 mt-2">lub upuść go tutaj (max 10MB)</p>
                        </label>
                    ) : (
                        <div className="flex flex-col items-center">
                            <FileText className="w-12 h-12 text-green-600 mb-2" />
                            <p className="font-bold text-slate-800">{file.name}</p>
                            <button
                                type="button"
                                onClick={() => setFile(null)}
                                className="text-xs text-red-500 underline mt-2 hover:text-red-600"
                            >
                                Usuń i wybierz inny
                            </button>
                        </div>
                    )}
                </div>

                {/* Error Box */}
                {
                    error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex gap-3 text-sm items-start">
                            <AlertOctagon size={20} className="shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold">Błąd weryfikacji</p>
                                <p>{typeof error === 'object' ? JSON.stringify(error) : error}</p>
                            </div>
                        </div>
                    )
                }

                <button
                    type="submit"
                    disabled={isSubmitting || !file}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all shadow-md 
                        ${(isSubmitting || !file) ? 'bg-slate-300 text-slate-500' : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'}`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            Weryfikacja kryptograficzna...
                        </span>
                    ) : 'Wyślij i Zatwierdź'}
                </button>
            </form >
        </div >
    );
}
