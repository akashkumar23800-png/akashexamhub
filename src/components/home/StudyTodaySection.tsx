import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronDown,
  ClipboardList,
  Languages,
  Layers,
  Mic,
  NotebookPen,
  Sparkles,
  Square,
} from 'lucide-react';

type StudyTab = 'homework' | 'live-recording' | 'ai-notes' | 'ai-flashcards' | 'ai-quiz' | 'more';

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
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

const TRANSCRIPTION_LANGUAGES = [
  { label: 'English', code: 'en-IN' },
  { label: 'Hindi', code: 'hi-IN' },
  { label: 'Hinglish', code: 'en-IN' },
];

export function StudyTodaySection() {
  const [activeTab, setActiveTab] = useState<StudyTab>('live-recording');
  const [language, setLanguage] = useState(TRANSCRIPTION_LANGUAGES[0]);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!langMenuOpen) return undefined;
    const onPointer = (event: MouseEvent) => {
      if (!langRef.current?.contains(event.target as Node)) setLangMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [langMenuOpen]);

  const toggleRecording = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setSpeechNotice('Live transcription is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    setSpeechNotice(null);
    const recognition = new Recognition();
    recognition.lang = language.code;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((res) => res[0]?.transcript ?? '')
        .join(' ')
        .trim();
      setTranscript(text);
    };
    recognition.onerror = () => {
      setSpeechNotice('Microphone access is needed for live transcription.');
      setRecording(false);
    };
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const tabs: { id: StudyTab; label: string; hasChevron?: boolean }[] = [
    { id: 'homework', label: 'Homework Help' },
    { id: 'live-recording', label: 'Live Recording' },
    { id: 'ai-notes', label: 'AI Notes' },
    { id: 'ai-flashcards', label: 'AI Flashcards' },
    { id: 'ai-quiz', label: 'AI Quiz' },
    { id: 'more', label: 'More', hasChevron: true },
  ];

  return (
    <section className="mx-auto max-w-3xl px-4 pt-10 sm:px-6" aria-labelledby="study-today-heading">
      <h2 id="study-today-heading" className="text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        What Do You Want to Study Today?
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={isActive}
              className={`flex items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'border-violet-400 bg-white text-violet-700 shadow-[0_4px_18px_-4px_rgba(124,58,237,0.22)] ring-1 ring-violet-300/60'
                  : 'border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.hasChevron && <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-3xl border border-slate-200/80 bg-white p-3.5 shadow-[0_12px_36px_-14px_rgba(15,23,42,0.12)] sm:p-5">
        <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-8 text-center sm:px-8 sm:py-10">
          {activeTab === 'live-recording' && (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-[0_12px_28px_-6px_rgba(124,58,237,0.5)]">
                <Mic className={`h-7 w-7 ${recording ? 'animate-pulse' : ''}`} aria-hidden="true" />
              </div>

              <h3 className="mt-5 text-lg font-extrabold text-slate-900">Live Transcription</h3>
              <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                Live transcribe, translate, and summarize — all in real time
              </p>

              <div ref={langRef} className="relative mt-7 inline-block">
                <button
                  type="button"
                  onClick={() => setLangMenuOpen((open) => !open)}
                  aria-expanded={langMenuOpen}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Languages className="h-4 w-4 text-slate-600" aria-hidden="true" />
                  <span>{language.label}</span>
                  <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
                </button>

                {langMenuOpen && (
                  <div className="absolute left-1/2 top-full z-20 mt-1.5 w-40 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                    {TRANSCRIPTION_LANGUAGES.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => {
                          setLanguage(option);
                          setLangMenuOpen(false);
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {option.label}
                        {language.label === option.label && <Check className="h-4 w-4 text-violet-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={toggleRecording}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:opacity-95 ${
                  recording
                    ? 'bg-rose-600 shadow-rose-500/25'
                    : 'bg-gradient-to-r from-[#2dd4bf] via-[#60a5fa] to-[#a855f7] shadow-indigo-500/20'
                }`}
              >
                {recording ? (
                  <>
                    <Square className="h-4 w-4 fill-current" aria-hidden="true" />
                    Stop recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" aria-hidden="true" />
                    Start recording
                  </>
                )}
              </button>

              {speechNotice && (
                <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">{speechNotice}</p>
              )}

              {transcript && (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-left">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Transcript</p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{transcript}</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'homework' && (
            <TabWorkspaceCard
              icon={BookOpen}
              title="Homework Help"
              description="Step-by-step NCERT solutions and explanations in Hindi or English."
              ctaLabel="Open Homework Helper"
              href="#/ai-study-assistant"
            />
          )}

          {activeTab === 'ai-notes' && (
            <TabWorkspaceCard
              icon={NotebookPen}
              title="AI Notes"
              description="Turn any chapter or topic into crisp CBSE revision notes and key definitions."
              ctaLabel="Generate AI Notes"
              href="#/ai-study-assistant"
            />
          )}

          {activeTab === 'ai-flashcards' && (
            <TabWorkspaceCard
              icon={Layers}
              title="AI Flashcards"
              description="Practice key formulas, dates, and concepts with quick recall flashcards."
              ctaLabel="Open Study Material"
              href="#/study-material"
            />
          )}

          {activeTab === 'ai-quiz' && (
            <TabWorkspaceCard
              icon={ClipboardList}
              title="AI Quiz"
              description="Generate chapter-wise MCQs or take a timed CBSE practice test."
              ctaLabel="Start a Practice Quiz"
              href="#/practice"
            />
          )}

          {activeTab === 'more' && (
            <TabWorkspaceCard
              icon={Sparkles}
              title="More Study Tools"
              description="Rewrite answers, draft notes, count words, convert files, and generate citations."
              ctaLabel="Explore All Tools"
              href="#/tools/word-count"
            />
          )}
        </div>
      </div>
    </section>
  );
}

function TabWorkspaceCard({
  icon: Icon,
  title,
  description,
  ctaLabel,
  href,
}: {
  icon: typeof Mic;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
}) {
  return (
    <>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-[0_12px_28px_-6px_rgba(124,58,237,0.5)]">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-lg font-extrabold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">{description}</p>
      <a
        href={href}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2dd4bf] via-[#60a5fa] to-[#a855f7] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-95"
      >
        {ctaLabel} →
      </a>
    </>
  );
}
