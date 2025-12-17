import React from 'react';
import { CheckCircle, Share2, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuccessParams() {
    const navigate = useNavigate();

    const handleShare = async () => {
        const shareData = {
            title: 'Poprzyj projekt uchwały obywatelskiej!',
            text: 'Właśnie podpisałem(am) projekt uchwały. Ty też możesz to zrobić online!',
            url: window.location.origin,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback
            try {
                await navigator.clipboard.writeText(shareData.url);
                alert('Link został skopiowany do schowka!');
            } catch (err) {
                console.error('Clipboard failed', err);
            }
        }
    };

    return (
        <div className="text-center py-10">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle className="w-12 h-12" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-4">Dziękujemy!</h1>
            <p className="text-lg text-slate-600 max-w-lg mx-auto mb-8">
                Twój podpis został pomyślnie zweryfikowany i dodany do listy poparcia.
                Jesteś częścią pozytywnej zmiany w Poznaniu.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                    <Home size={18} />
                    Wróć na stronę główną
                </button>
                <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md font-medium transition-colors"
                >
                    <Share2 size={18} />
                    Udostępnij inicjatywę
                </button>
            </div>
        </div>
    );
}
