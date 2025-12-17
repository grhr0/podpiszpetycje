import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Monitor, Smartphone, Check, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export default function Step3Instructions() {
    const location = useLocation();
    const navigate = useNavigate();
    const [method, setMethod] = useState(null); // 'mobile' | 'web'

    // Redirect if no data
    React.useEffect(() => {
        if (!location.state?.user_data) {
            navigate('/krok-1');
        }
    }, [location.state, navigate]);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900">Krok 3: Podpis Elektroniczny</h2>
                <p className="text-slate-500 mt-2">Teraz najważniejszy krok. Wybierz metodę, którą chcesz podpisać dokument.</p>
            </div>

            {/* Method Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => setMethod('mobile')}
                    className={clsx(
                        "p-6 border-2 rounded-xl text-left transition-all hover:shadow-md",
                        method === 'mobile' ? "border-slate-900 bg-slate-50 shadow-md ring-1 ring-slate-900" : "border-slate-200"
                    )}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Smartphone size={24} /></div>
                        <h3 className="font-bold text-lg">Aplikacja mObywatel</h3>
                    </div>
                    <p className="text-sm text-slate-600">Polecane. Użyj telefonu i e-dowodu.</p>
                </button>

                <button
                    onClick={() => setMethod('web')}
                    className={clsx(
                        "p-6 border-2 rounded-xl text-left transition-all hover:shadow-md",
                        method === 'web' ? "border-slate-900 bg-slate-50 shadow-md ring-1 ring-slate-900" : "border-slate-200"
                    )}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Monitor size={24} /></div>
                        <h3 className="font-bold text-lg">Strona Rządowa</h3>
                    </div>
                    <p className="text-sm text-slate-600">Przy użyciu komputera i profilu zaufanego.</p>
                </button>
            </div>

            {/* Instruction Content */}
            {method && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        {method === 'mobile' ? 'Instrukcja mObywatel' : 'Instrukcja Webowa'}
                        <span className="text-xs font-normal px-2 py-1 bg-white border rounded text-slate-500">Metoda {method === 'mobile' ? 'A' : 'B'}</span>
                    </h3>

                    <div className="space-y-2 mb-6 text-sm text-slate-700">
                        <p className="font-medium text-slate-900 mb-2">Wymagania:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            {method === 'mobile' ? (
                                <>
                                    <li>Dowód osobisty z warstwą elektroniczną (po 4.03.2019)</li>
                                    <li>Aplikacja mObywatel w najnowszej wersji</li>
                                    <li>NFC w telefonie</li>
                                </>
                            ) : (
                                <>
                                    <li>Komputer z internetem</li>
                                    <li>Profil Zaufany / e-dowód</li>
                                    <li>Pobrany plik PDF na dysku</li>
                                </>
                            )}
                        </ul>
                    </div>

                    <div className="bg-white p-4 rounded border border-slate-200 mb-6">
                        <ol className="list-decimal pl-5 space-y-3 text-sm text-slate-800 marker:font-bold">
                            {method === 'mobile' ? (
                                <>
                                    <li>Otwórz aplikację mObywatel &rarr; Usługi &rarr; <strong>Podpis kwalifikowany</strong>.</li>
                                    <li>Wybierz pobrany plik PDF.</li>
                                    <li>Wybierz dostawcę (np. Cencert/mSzafir).</li>
                                    <li>Postępuj zgodnie z instrukcjami na ekranie (skanowanie dowodu NFC).</li>
                                    <li><strong>WAŻNE:</strong> Po podpisaniu pobierz <span className="text-red-600 font-bold">NOWY plik PDF</span>.</li>
                                </>
                            ) : (
                                <>
                                    <li>Wejdź na <a href="https://podpis.mobywatel.gov.pl/" target="_blank" className="text-blue-600 underline">podpis.mobywatel.gov.pl</a>.</li>
                                    <li>Zaloguj się i wgraj plik PDF.</li>
                                    <li>Podpisz dokument korzystając z Profilu Zaufanego lub e-dowodu.</li>
                                    <li>Pobierz <span className="text-red-600 font-bold">PODPISANY plik</span> na dysk.</li>
                                </>
                            )}
                        </ol>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => navigate('/krok-4', { state: { user_data: location.state.user_data } })}
                            className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 shadow-md"
                        >
                            Mam podpisany plik &rarr;
                        </button>
                    </div>
                </div>
            )}

            {!method && (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg flex gap-3 text-sm">
                    <AlertTriangle size={20} className="shrink-0" />
                    <p>Wybierz jedną z metod powyżej, aby zobaczyć instrukcje.</p>
                </div>
            )}
        </div>
    );
}
