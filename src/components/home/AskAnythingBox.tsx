import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertTriangle, Loader2, Mic, Plus, Send, Sparkles } from 'lucide-react';
import { askStudyAssistant } from '@/lib/aiAssistant';

interface SpeechResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  const speechWindow = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export function AskAnythingBox() {
  const [question, setQuestion] = useState('');
  const [submittedQuestion, setSubmittedQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showUploadNote, setShowUploadNote] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setVoiceError('Voice input is not supported in this browser. Please type your question instead.');
      return;
    }
    setVoiceError(null);
    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim();
      setQuestion(transcript);
    };
    recognition.onerror = () => {
      setVoiceError('We could not hear you. Check that microphone access is allowed and try again.');
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setSubmittedQuestion(trimmed);
    try {
      const text = await askStudyAssistant({ mode: 'ask', input: trimmed });
      setAnswer(text);
      setQuestion('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The AI Study Assistant could not answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-5 text-center">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          AI Study Assistant
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Ask anything about your studies</h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_18px_50px_-18px_rgba(15,23,42,0.25)] sm:p-4"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUploadNote((open) => !open)}
            aria-label="Add a file"
            aria-expanded={showUploadNote}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </button>
          <input
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask anything..."
            aria-label="Ask anything"
            maxLength={4000}
            className="min-w-0 flex-1 bg-transparent px-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={toggleListening}
            aria-label={listening ? 'Stop voice input' : 'Speak your question'}
            aria-pressed={listening}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition ${
              listening
                ? 'animate-pulse bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Mic className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="submit"
            disabled={!question.trim() || loading}
            aria-label="Send question"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        {showUploadNote && (
          <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600" role="status">
            Uploading PDFs and documents is not available yet. Type or speak your question for now.
          </p>
        )}
        {voiceError && (
          <p className="mt-3 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {voiceError}
          </p>
        )}

        {loading && (
          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600" role="status">
            <Loader2 className="h-4 w-4 animate-spin text-blue-700" aria-hidden="true" />
            Thinking about &ldquo;{submittedQuestion}&rdquo;...
          </div>
        )}
        {error && (
          <div className="mt-4 flex items-start gap-3 border-t border-slate-100 pt-4 text-sm text-red-700" role="alert">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}
        {answer && !loading && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Your question</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{submittedQuestion}</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{answer}</p>
          </div>
        )}
      </form>
    </div>
  );
}
