import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// API base URL - ideally from env
const API_URL = '/api';

export default function Step1Form() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        address: '',
        pesel: '',
    });
    const [gdprConsent, setGdprConsent] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Basic Client-side Validation (PESEL format)
    const validate = () => {
        const newErrors = {};
        if (!formData.full_name.trim()) newErrors.full_name = "To pole jest wymagane.";
        if (!formData.address.trim()) newErrors.address = "To pole jest wymagane.";
        if (!/^\d{11}$/.test(formData.pesel)) newErrors.pesel = "PESEL musi składać się z 11 cyfr.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            // We verify data integrity with backend FIRST before generating PDF
            // OR we just move to Step 2 passing the data via state?
            // Spec says: "Serwer generuje plik... serwuje go...".
            // So we hit the generate endpoint in Step 2 usually.
            // BUT here we want to validate first.
            // Let's assume we pass data to Step 2 via state and trigger download there.
            // Validation step: We could hit a "validate" endpoint if existed, or just trust the generate endpoint.
            // Let's proceed to Step 2 and initiate download immediately.

            // Storing data in history state to pass to next step
            navigate('/krok-2', { state: { user_data: formData } });

        } catch (err) {
            console.error("Submission error", err);
            setErrors({ submit: "Wystąpił błąd. Spróbuj ponownie." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900">Krok 1: Twoje Dane</h2>
                <p className="text-slate-500 mt-2">Wprowadź dane niezbędne do wypełnienia wykazu poparcia.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Imię i nazwisko</label>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-colors ${errors.full_name ? 'border-red-500' : 'border-slate-300'}`}
                        placeholder="Jan Kowalski"
                    />
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Adres zamieszkania (zgodny z rejestrem wyborców)</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-colors ${errors.address ? 'border-red-500' : 'border-slate-300'}`}
                        placeholder="ul. Główna 1/2, 60-001 Poznań"
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                {/* PESEL */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Numer PESEL</label>
                    <input
                        type="text"
                        name="pesel"
                        value={formData.pesel}
                        onChange={handleChange}
                        maxLength={11}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-colors ${errors.pesel ? 'border-red-500' : 'border-slate-300'}`}
                        placeholder="12345678901"
                    />
                    {errors.pesel && <p className="text-red-500 text-xs mt-1">{errors.pesel}</p>}
                </div>

                {/* GDPR Consent */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={gdprConsent}
                            onChange={(e) => setGdprConsent(e.target.checked)}
                            className="mt-1 w-4 h-4 text-slate-900 rounded focus:ring-offset-0 focus:ring-0"
                        />
                        <span className="text-sm text-slate-700">
                            Wyrażam zgodę na przetwarzanie moich danych osobowych w celu poparcia projektu uchwały. Rozumiem, że dane te są wymagane prawnie.
                        </span>
                    </label>
                </div>

                {/* Submit Action */}
                <button
                    type="submit"
                    disabled={!gdprConsent || isSubmitting}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all transform active:scale-[0.98] 
                        ${(!gdprConsent || isSubmitting)
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg'}`}
                >
                    {isSubmitting ? 'Przetwarzanie...' : 'Generuj PDF z wykazem poparcia'}
                </button>
            </form>
        </div>
    );
}
