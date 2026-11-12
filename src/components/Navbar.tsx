import { ChefHat, Volume2, VolumeX, Type, Sparkles } from 'lucide-react';
import { playClickSound } from '../utils/sound';

interface NavbarProps {
  onGoHome: () => void;
  onOpenChat: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  extraLargeText: boolean;
  onToggleTextSize: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onGoHome,
  onOpenChat,
  voiceEnabled,
  onToggleVoice,
  extraLargeText,
  onToggleTextSize,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b-4 border-amber-200 sticky top-0 z-40 px-3 sm:px-6 py-3 shadow-xs">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and Home Button */}
        <button
          onClick={() => {
            playClickSound();
            onGoHome();
          }}
          className="flex items-center gap-2.5 p-2 rounded-2xl hover:bg-amber-50 transition-colors cursor-pointer group text-left"
          aria-label="Επιστροφή στην αρχική σελίδα"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none font-comfortaa">
              Ο Βοηθός μου
            </h1>
            <span className="text-xs sm:text-sm font-bold text-amber-600 block mt-0.5">
              στην Κουζίνα
            </span>
          </div>
        </button>

        {/* Accessibility Quick Controls */}
        <div className="flex items-center gap-2">
          {/* Gemini Chat Button */}
          <button
            onClick={() => {
              playClickSound();
              onOpenChat();
            }}
            className="min-h-[48px] px-3 sm:px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm sm:text-base rounded-2xl flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer border border-amber-300"
            aria-label="Άνοιγμα βοηθού Google Gemini"
            title="Ρώτησε τον βοηθό Gemini"
          >
            <Sparkles className="w-5 h-5 text-yellow-200" />
            <span className="hidden sm:inline">Βοηθός Gemini</span>
          </button>
          {/* Audio narration toggle */}
          <button
            onClick={() => {
              playClickSound();
              onToggleVoice();
            }}
            className={`min-h-[48px] px-3 sm:px-4 rounded-2xl border-2 font-extrabold text-sm sm:text-base flex items-center gap-2 transition-transform active:scale-95 cursor-pointer ${
              voiceEnabled
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                : 'bg-slate-100 border-slate-300 text-slate-500'
            }`}
            aria-label={voiceEnabled ? 'Απενεργοποίηση φωνής' : 'Ενεργοποίηση φωνής'}
            title={voiceEnabled ? 'Φωνή ενεργή' : 'Φωνή ανενεργή'}
          >
            {voiceEnabled ? (
              <>
                <Volume2 className="w-5 h-5 text-emerald-600" />
                <span className="hidden sm:inline">Φωνή</span>
              </>
            ) : (
              <>
                <VolumeX className="w-5 h-5 text-slate-400" />
                <span className="hidden sm:inline">Σίγαση</span>
              </>
            )}
          </button>

          {/* Text Size Toggle */}
          <button
            onClick={() => {
              playClickSound();
              onToggleTextSize();
            }}
            className={`min-h-[48px] px-3 sm:px-4 rounded-2xl border-2 font-extrabold text-sm sm:text-base flex items-center gap-2 transition-transform active:scale-95 cursor-pointer ${
              extraLargeText
                ? 'bg-amber-100 border-amber-400 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
            aria-label={extraLargeText ? 'Κανονικά γράμματα' : 'Πολύ μεγάλα γράμματα'}
            title="Μέγεθος γραμμάτων"
          >
            <Type className="w-5 h-5" />
            <span className="hidden md:inline">{extraLargeText ? 'Κανονικό' : 'Μεγάλα'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
