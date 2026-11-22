import { useEffect, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { FIELD_CLASS, PRIMARY_BUTTON_CLASS, SECONDARY_BUTTON_CLASS, ERROR_TEXT_CLASS } from '@/components/tools/toolStyles';

const MAX_LENGTH = 3000;

const LANGUAGES = [
  { value: 'en-IN', label: 'English (India)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'hi-IN', label: 'Hindi' },
];

export function TextToAudioTool() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en-IN');
  const [rate, setRate] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const handlePlay = () => {
    if (!supported) {
      setError('Your browser cannot read text aloud. Try Chrome, Edge or Safari.');
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Type or paste some text first.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = language;
    utterance.rate = rate;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (event) => {
      setSpeaking(false);
      if (event.error === 'interrupted' || event.error === 'canceled') return;
      setError('The text could not be read aloud. Try another language or browser.');
    };
    setError(null);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={MAX_LENGTH}
          rows={8}
          placeholder="Paste or type the text you want to hear..."
          aria-label="Text to read aloud"
          className={`${FIELD_CLASS} resize-y leading-relaxed`}
        />
        <p className="mt-2 text-right text-xs tabular-nums text-slate-500">
          {text.length} / {MAX_LENGTH}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-900">Language</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value)} className={FIELD_CLASS}>
            {LANGUAGES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="flex items-center justify-between text-sm font-bold text-slate-900">
            Speed
            <span className="tabular-nums text-slate-600">{rate.toFixed(1)}x</span>
          </span>
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.1}
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
            className="mt-3 w-full accent-slate-900"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handlePlay} className={PRIMARY_BUTTON_CLASS}>
          <Play className="h-4 w-4 fill-current" aria-hidden="true" />
          {speaking ? 'Restart' : 'Play audio'}
        </button>
        <button type="button" onClick={handleStop} disabled={!speaking} className={SECONDARY_BUTTON_CLASS}>
          <Square className="h-4 w-4" aria-hidden="true" />
          Stop
        </button>
      </div>
      {speaking && (
        <p className="text-sm font-semibold text-blue-700" role="status">
          Reading aloud...
        </p>
      )}
      {error && <p className={ERROR_TEXT_CLASS} role="alert">{error}</p>}
    </div>
  );
}
