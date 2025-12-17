import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const steps = [
    { id: 1, path: '/krok-1', label: 'Dane' },
    { id: 2, path: '/krok-2', label: 'Pobierz' },
    { id: 3, path: '/krok-3', label: 'Podpisz' },
    { id: 4, path: '/krok-4', label: 'Wyślij' },
];

export default function Layout() {
    const location = useLocation();
    const currentStepIndex = steps.findIndex(s => location.pathname.startsWith(s.path));

    return (
        <div className="min-h-screen flex flex-col items-center bg-slate-50 text-slate-900 font-sans">
            <header className="w-full max-w-4xl p-6 mb-8 text-center border-b border-slate-200 bg-white shadow-sm">
                <h1 className="text-2xl font-bold tracking-tight text-slate-800 uppercase mb-2">
                    Inicjatywa Uchwałodawcza
                </h1>
                <p className="text-slate-500 text-sm">Zbiórka podpisów poparcia (Poznań)</p>
            </header>

            <main className="w-full max-w-2xl px-4 pb-20">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center relative z-10">
                        {steps.map((step, idx) => {
                            const isActive = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;
                            return (
                                <div key={step.id} className="flex flex-col items-center flex-1">
                                    <div className={clsx(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                                        isActive ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-300 text-slate-400"
                                    )}>
                                        {step.id}
                                    </div>
                                    <span className={clsx(
                                        "text-xs mt-2 uppercase font-medium tracking-wide",
                                        isCurrent ? "text-slate-900" : "text-slate-400"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {/* Connecting line */}
                    <div className="absolute top-[8.5rem] left-[50%] -translate-x-1/2 w-[calc(100%-4rem)] h-0.5 bg-slate-200 -z-0 hidden md:block max-w-xl">
                        {/* Dynamic fill could be added here */}
                        <div
                            className="h-full bg-slate-900 transition-all duration-300"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg border border-slate-100">
                    <Outlet />
                </div>
            </main>

            <footer className="w-full text-center p-6 text-slate-400 text-sm mt-auto">
                <p>&copy; 2024 Komitet Inicjatywy Uchwałodawczej. Dane przetwarzane zgodnie z RODO.</p>
            </footer>
        </div>
    );
}
