import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  AlertTriangle,
  AudioLines,
  Camera,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mic,
  Plus,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { askStudyAssistant } from '@/lib/aiAssistant';
import { getStudyLanguage, subscribeToStudyLanguage, type StudyLanguage } from '@/lib/preferences';

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

type Attachment = {
  name: string;
  kind: 'image' | 'document';
  mimeType: string;
  size: number;
  preview?: string;
  base64?: string;
  text?: string;
};

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  const speechWindow = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.readAsDataURL(file);
  });
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.readAsText(file);
  });
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ATTACHMENT_OPTIONS = [
  {
    id: 'camera',
    label: 'Camera',
    hint: 'Take a photo of your question',
    Icon: Camera,
    tile: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'photos',
    label: 'Photos',
    hint: 'PNG, JPG or WebP image',
    Icon: ImageIcon,
    tile: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'files',
    label: 'Files',
    hint: 'PDF, DOC, DOCX or TXT',
    Icon: FileText,
    tile: 'bg-emerald-50 text-emerald-600',
  },
] as const;

export function AskAnythingBox() {
  const [question, setQuestion] = useState('');
  const [submittedQuestion, setSubmittedQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [liveResponse, setLiveResponse] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [language, setLanguage] = useState<StudyLanguage>(() => getStudyLanguage());
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const attachmentRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => subscribeToStudyLanguage(setLanguage), []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (!attachmentOpen) return undefined;
    const closeOnPointer = (event: MouseEvent) => {
      if (!attachmentRef.current?.contains(event.target as Node)) setAttachmentOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAttachmentOpen(false);
    };
    document.addEventListener('mousedown', closeOnPointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnPointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [attachmentOpen]);

  useEffect(() => {
    const reset = () => {
      setQuestion('');
      setSubmittedQuestion('');
      setAnswer(null);
      setError(null);
      setVoiceError(null);
      setAttachment(null);
      setAttachmentOpen(false);
    };
    window.addEventListener('akh:new-chat', reset);
    return () => window.removeEventListener('akh:new-chat', reset);
  }, []);

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const speakAnswer = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setVoiceError('Live Response is not supported in this browser. You can still read the answer on screen.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'Hindi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

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
    recognition.lang = language === 'Hindi' ? 'hi-IN' : 'en-IN';
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

  const toggleLiveResponse = () => {
    if (liveResponse) {
      setLiveResponse(false);
      stopSpeaking();
      return;
    }
    if (!('speechSynthesis' in window)) {
      setVoiceError('Live Response is not supported in this browser. You can still read the answer on screen.');
      return;
    }
    setVoiceError(null);
    setLiveResponse(true);
    if (answer) speakAnswer(answer);
  };

  const pickOption = (id: (typeof ATTACHMENT_OPTIONS)[number]['id']) => {
    setAttachmentOpen(false);
    if (id === 'camera') cameraInputRef.current?.click();
    else if (id === 'photos') photosInputRef.current?.click();
    else filesInputRef.current?.click();
  };

  const acceptImage = async (file?: File) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setError('Choose a PNG, JPG or WebP image.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Images must be smaller than 5 MB.');
      return;
    }
    try {
      const dataUrl = await readAsDataUrl(file);
      setAttachment({
        name: file.name || 'Camera photo',
        kind: 'image',
        mimeType: file.type,
        size: file.size,
        preview: dataUrl,
        base64: dataUrl.split(',')[1] ?? '',
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read the selected image.');
    }
  };

  const acceptDocument = async (file?: File) => {
    if (!file) return;
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!DOCUMENT_EXTENSIONS.includes(extension)) {
      setError('Choose a PDF, DOC, DOCX or TXT file.');
      return;
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      setError('Documents must be smaller than 10 MB.');
      return;
    }
    try {
      const text = extension === '.txt' ? (await readAsText(file)).slice(0, 8000) : undefined;
      setAttachment({
        name: file.name,
        kind: 'document',
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        text,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read the selected document.');
    }
  };

  const handleImageInput = (event: ChangeEvent<HTMLInputElement>) => {
    void acceptImage(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDocumentInput = (event: ChangeEvent<HTMLInputElement>) => {
    void acceptDocument(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = question.trim();
    if ((!trimmed && !attachment) || loading) return;

    const fallbackQuestion = attachment?.kind === 'image'
      ? 'Please explain what is shown in this image.'
      : 'Please summarise the attached document.';
    const askedQuestion = trimmed || fallbackQuestion;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setSubmittedQuestion(askedQuestion);
    try {
      const promptParts = [askedQuestion];
      if (attachment?.kind === 'image') {
        promptParts.push(`An image ("${attachment.name}") is attached. Read the question in the image and answer it.`);
      }
      if (attachment?.kind === 'document') {
        promptParts.push(
          attachment.text
            ? `Attached document "${attachment.name}" content:\n${attachment.text}`
            : `The student attached the document "${attachment.name}", but its contents cannot be read in the browser. Answer from the question text and say what extra detail is needed.`,
        );
      }
      const text = await askStudyAssistant({
        mode: 'ask',
        input: promptParts.join('\n\n'),
        language,
        image:
          attachment?.kind === 'image' && attachment.base64
            ? { mimeType: attachment.mimeType, data: attachment.base64 }
            : undefined,
      });
      setAnswer(text);
      setQuestion('');
      setAttachment(null);
      if (liveResponse) speakAnswer(text);
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
        {attachment && (
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            {attachment.preview ? (
              <img src={attachment.preview} alt="" className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
            ) : (
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{attachment.name}</p>
              <p className="text-xs text-slate-500">
                {attachment.kind === 'image' ? 'Image' : 'Document'} · {formatSize(attachment.size)}
                {attachment.kind === 'document' && !attachment.text ? ' · text extraction unavailable' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              aria-label={`Remove ${attachment.name}`}
              className="rounded-full p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-900"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div ref={attachmentRef} className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setAttachmentOpen((open) => !open)}
              aria-label="Add an attachment"
              aria-expanded={attachmentOpen}
              aria-haspopup="true"
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                attachmentOpen
                  ? 'border-violet-300 bg-violet-50 text-violet-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Plus className={`h-5 w-5 transition-transform ${attachmentOpen ? 'rotate-45' : ''}`} aria-hidden="true" />
            </button>

            {attachmentOpen && (
              <div
                role="menu"
                aria-label="Attach to your question"
                className="absolute bottom-[calc(100%+10px)] left-0 z-30 w-60 origin-bottom-left animate-fade-in rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
              >
                <span
                  className="absolute -bottom-1.5 left-5 h-3 w-3 rotate-45 border-b border-r border-slate-200 bg-white"
                  aria-hidden="true"
                />
                {ATTACHMENT_OPTIONS.map(({ id, label, hint, Icon, tile }) => (
                  <button
                    key={id}
                    type="button"
                    role="menuitem"
                    onClick={() => pickOption(id)}
                    className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-slate-50 focus-visible:bg-slate-50"
                  >
                    <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${tile}`}>
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900">{label}</span>
                      <span className="block truncate text-[11px] font-medium text-slate-500">{hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleImageInput} tabIndex={-1} aria-hidden="true" />
            <input ref={photosInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleImageInput} tabIndex={-1} aria-hidden="true" />
            <input
              ref={filesInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="sr-only"
              onChange={handleDocumentInput}
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>

          <input
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask anything..."
            aria-label="Ask anything"
            maxLength={4000}
            className="min-w-0 flex-1 bg-transparent px-1.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none sm:px-2"
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
            type="button"
            onClick={toggleLiveResponse}
            aria-pressed={liveResponse}
            aria-label={liveResponse ? 'Turn off Live Response' : 'Turn on Live Response'}
            title="Read every answer aloud as it arrives"
            className={`flex h-9 flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-bold transition sm:h-10 sm:px-3 sm:text-xs ${
              liveResponse
                ? 'bg-violet-700 text-white shadow-md shadow-violet-700/25 hover:bg-violet-800'
                : 'border border-slate-200 text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800'
            }`}
          >
            <AudioLines className={`h-4 w-4 ${speaking ? 'animate-pulse' : ''}`} aria-hidden="true" />
            Live Response
          </button>

          <button
            type="submit"
            disabled={(!question.trim() && !attachment) || loading}
            aria-label="Send question"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        <p className="mt-2 px-1 text-[11px] font-medium text-slate-400">
          {liveResponse ? 'Live Response is on — answers are read aloud.' : 'Attach a photo, image or document, or speak your question.'}
        </p>

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
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Your question</p>
              {liveResponse && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                  <span className={`h-1.5 w-1.5 rounded-full ${speaking ? 'animate-pulse bg-rose-500' : 'bg-violet-500'}`} />
                  {speaking ? 'Speaking' : 'Live Response'}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900">{submittedQuestion}</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{answer}</p>
          </div>
        )}
      </form>
    </div>
  );
}
