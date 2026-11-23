import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  BookOpen, BrainCircuit, CalendarDays, ClipboardList, GraduationCap,
  Languages, Loader2, MessageCircle, NotebookPen, RefreshCw, Send, Sparkles, Target,
  Trophy, Upload, XCircle,
} from 'lucide-react';
import { askStudyAssistant, type AssistantHistoryItem, type AssistantMode } from '@/lib/aiAssistant';
import { supabase } from '@/lib/supabase';
import { fetchMyAttemptAnswers, fetchMyAttempts } from '@/lib/api';

type Module = 'doubt' | 'planner' | 'quiz' | 'notes' | 'performance' | 'english';
type QuizQuestion = { question: string; options: string[]; correctIndex: number; explanation: string };
type QuizPayload = { title: string; questions: QuizQuestion[] };
type ProgressRow = { chapter: string; is_completed: boolean };

const modules: { id: Module; title: string; description: string; icon: typeof BrainCircuit }[] = [
  { id: 'doubt', title: 'AI Doubt Solver', description: 'Ask questions in Hindi, English or Hinglish.', icon: MessageCircle },
  { id: 'planner', title: 'AI Study Planner', description: 'Build a realistic daily or weekly study plan.', icon: CalendarDays },
  { id: 'quiz', title: 'AI Quiz Generator', description: 'Practice chapter-wise MCQs and check your score.', icon: ClipboardList },
  { id: 'notes', title: 'AI Notes Generator', description: 'Create concise revision notes and key concepts.', icon: NotebookPen },
  { id: 'performance', title: 'Performance Analyzer', description: 'Find patterns in your submitted test results.', icon: Trophy },
  { id: 'english', title: 'AI English Teacher', description: 'Learn grammar, vocabulary and sentence building.', icon: Languages },
];

const moduleRecordType: Record<Exclude<Module, 'doubt'>, string> = {
  planner: 'plan', quiz: 'quiz', notes: 'notes', performance: 'performance', english: 'english',
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}

export function AIStudyAssistantPage() {
  const [active, setActive] = useState<Module>('doubt');
  const [classLevel, setClassLevel] = useState(10);
  const [subject, setSubject] = useState('Science');
  const [chapter, setChapter] = useState('');
  const [language, setLanguage] = useState('Hindi + Hinglish');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [minutes, setMinutes] = useState(120);
  const [topics, setTopics] = useState('');
  const [input, setInput] = useState('');
  const [image, setImage] = useState<{ mimeType: string; data: string } | undefined>();
  const [imageName, setImageName] = useState('');
  const [history, setHistory] = useState<AssistantHistoryItem[]>([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const topicList = useMemo(
    () => topics.split(/\n|,/).map((item) => item.trim()).filter(Boolean).slice(0, 30),
    [topics],
  );

  useEffect(() => {
    const resetChat = () => {
      setActive('doubt');
      setInput('');
      setAnswer('');
      setError('');
      setNotice('');
      setQuiz(null);
      setSelections({});
      setQuizSubmitted(false);
      setHistory([]);
      setImage(undefined);
      setImageName('');
    };
    window.addEventListener('akh:new-chat', resetChat);
    return () => window.removeEventListener('akh:new-chat', resetChat);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadProgress() {
      const { data, error: loadError } = await supabase
        .from('ai_study_progress')
        .select('chapter,is_completed')
        .eq('class_level', classLevel)
        .eq('subject', subject)
        .order('chapter');
      if (!cancelled) {
        if (loadError) setError(loadError.message);
        else setProgress((data || []) as ProgressRow[]);
      }
    }
    void loadProgress();
    return () => { cancelled = true; };
  }, [classLevel, subject]);

  function changeModule(module: Module) {
    setActive(module);
    setInput('');
    setAnswer('');
    setError('');
    setNotice('');
    setQuiz(null);
    setSelections({});
    setQuizSubmitted(false);
    setHistory([]);
    setImage(undefined);
    setImageName('');
  }

  async function saveRecord(type: string, title: string, content: string, metadata: Record<string, unknown> = {}) {
    const { error: saveError } = await supabase.from('ai_study_records').insert({
      record_type: type, title: title.slice(0, 200), content: content.slice(0, 50000), metadata,
    });
    if (saveError) throw new Error(`Generated, but could not save to your account: ${saveError.message}`);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    setError('');
    setNotice('');
    setAnswer('');
    setQuiz(null);
    setQuizSubmitted(false);
    try {
      let requestInput = input.trim();
      let performanceData: unknown;
      if (active === 'performance') {
        const [attempts, answers] = await Promise.all([fetchMyAttempts(), fetchMyAttemptAnswers()]);
        performanceData = { attempts: attempts.slice(-10), answers: answers.slice(-100) };
        requestInput = `${requestInput}\n\nMy submitted test data (analyze only this data): ${JSON.stringify(performanceData)}`;
      }
      const mode: AssistantMode = active;
      const nextHistory = active === 'doubt' ? history.slice(-10) : [];
      const result = await askStudyAssistant({
        mode, input: requestInput, classLevel, subject, chapter, language, difficulty,
        availableMinutes: minutes, topics, history: nextHistory, image: active === 'doubt' ? image : undefined,
      });
      if (active === 'doubt') {
        setHistory([...nextHistory, { role: 'user', text: input.trim() }, { role: 'model', text: result.text }].slice(-12));
      }
      setAnswer(result.text);
      if (active === 'quiz') {
        const parsed = JSON.parse(result.text) as QuizPayload;
        if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length !== 5 ||
          parsed.questions.some((q) => !Array.isArray(q.options) || q.options.length !== 4 || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3)) {
          throw new Error('The generated quiz format was invalid. Please generate it again.');
        }
        setQuiz(parsed);
      } else if (active !== 'doubt') {
        await saveRecord(moduleRecordType[active], `${modules.find((item) => item.id === active)?.title}: ${chapter || subject}`, result.text, {
          classLevel, subject, chapter, language, difficulty: active === 'quiz' ? difficulty : undefined,
          availableMinutes: active === 'planner' ? minutes : undefined,
          attemptsAnalyzed: active === 'performance' ? (performanceData as { attempts: unknown[] }).attempts.length : undefined,
        });
        setNotice('Saved to your account.');
      }
      setInput('');
      setImage(undefined);
      setImageName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function submitQuiz() {
    if (!quiz || quizSubmitted) return;
    const score = quiz.questions.reduce((total, question, index) => total + (selections[index] === question.correctIndex ? 1 : 0), 0);
    setQuizSubmitted(true);
    try {
      await saveRecord('quiz', `${quiz.title} — ${score}/5`, JSON.stringify(quiz), {
        classLevel, subject, chapter, score, total: quiz.questions.length,
        answers: selections, correctIndexes: quiz.questions.map((q) => q.correctIndex),
      });
      setNotice(`Quiz score: ${score}/5. Result saved to your account.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save quiz result.');
    }
  }

  async function toggleProgress(chapterName: string, completed: boolean) {
    setSaving(true);
    setError('');
    const { error: updateError } = await supabase.from('ai_study_progress').upsert({
      class_level: classLevel, subject, chapter: chapterName, is_completed: completed,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,class_level,subject,chapter' });
    if (updateError) setError(updateError.message);
    else setProgress((current) => {
      const found = current.some((row) => row.chapter === chapterName);
      return found
        ? current.map((row) => row.chapter === chapterName ? { ...row, is_completed: completed } : row)
        : [...current, { chapter: chapterName, is_completed: completed }].sort((a, b) => a.chapter.localeCompare(b.chapter));
    });
    setSaving(false);
  }

  async function handleImage(file?: File) {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Choose a PNG, JPG or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }
    try {
      setImage({ mimeType: file.type, data: await fileToBase64(file) });
      setImageName(file.name);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read image.');
    }
  }

  const activeModule = modules.find((item) => item.id === active)!;
  const score = quiz ? quiz.questions.reduce((total, q, index) => total + (selections[index] === q.correctIndex ? 1 : 0), 0) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-6 text-white shadow-xl sm:p-9">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-200"><Sparkles className="h-4 w-4" /> Gemini-powered learning workspace</div>
          <div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">AI Study Assistant</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">Your CBSE learning companion for Classes 6–12. Ask questions, plan study sessions, practice quizzes and track your progress.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-indigo-50">
              <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Class 6–12</div>
              <div className="mt-1 text-xs text-indigo-200">Hindi · English · Hinglish</div>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(({ id, title, description, icon: Icon }) => (
            <button key={id} type="button" onClick={() => changeModule(id)} aria-pressed={active === id}
              className={`rounded-2xl border p-4 text-left transition ${active === id ? 'border-violet-300 bg-violet-50 shadow-sm ring-1 ring-violet-200' : 'border-slate-200 bg-white hover:border-violet-200 hover:shadow-sm'}`}>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active === id ? 'bg-violet-700 text-white' : 'bg-slate-100 text-slate-600'}`}><Icon className="h-5 w-5" /></span>
              <span className="mt-3 block font-bold text-slate-900">{title}</span>
              <span className="mt-1 block text-sm leading-5 text-slate-500">{description}</span>
            </button>
          ))}
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><activeModule.icon className="h-5 w-5" /></span>
              <div><h2 className="text-xl font-extrabold text-slate-900">{activeModule.title}</h2><p className="mt-0.5 text-sm text-slate-500">{activeModule.description}</p></div>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">Class
                  <select value={classLevel} onChange={(e) => setClassLevel(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                    {Array.from({ length: 7 }, (_, i) => i + 6).map((n) => <option key={n} value={n}>Class {n}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-semibold text-slate-700">Subject
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                    {['Science','Mathematics','Social Science','English','Hindi','Physics','Chemistry','Biology','History','Geography','Political Science','Economics'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">Response language
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                    <option>Hindi + Hinglish</option><option>English</option><option>Hindi</option><option>Hinglish</option>
                  </select>
                </label>
                {active === 'quiz' && <label className="block text-sm font-semibold text-slate-700">Difficulty
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                    <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                  </select>
                </label>}
                {active === 'planner' && <label className="block text-sm font-semibold text-slate-700">Study time per day (minutes)
                  <input type="number" min={15} max={720} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                </label>}
              </div>
              {(active === 'planner' || active === 'quiz' || active === 'notes') && <label className="block text-sm font-semibold text-slate-700">Chapter / topic
                <input value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="e.g. Chemical Reactions and Equations" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>}
              {active === 'planner' && <label className="block text-sm font-semibold text-slate-700">Topics or chapters to cover (comma or new line separated)
                <textarea value={topics} onChange={(e) => setTopics(e.target.value)} rows={3} placeholder="Chemical Reactions&#10;Life Processes&#10;Light – Reflection and Refraction" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>}
              <label className="block text-sm font-semibold text-slate-700">
                {active === 'doubt' ? 'Your question' : active === 'planner' ? 'Your study goal and constraints' : active === 'quiz' ? 'Quiz focus / instructions' : active === 'notes' ? 'What should the notes cover?' : active === 'performance' ? 'What would you like to improve?' : 'What do you want to learn?'}
                <textarea value={input} onChange={(e) => setInput(e.target.value)} required rows={active === 'doubt' ? 4 : 3}
                  maxLength={8000} placeholder={active === 'doubt' ? 'Ask your question in Hindi, English or Hinglish...' : active === 'planner' ? 'e.g. I want to revise Science and Maths this week. I have school in the morning.' : active === 'quiz' ? 'Generate 5 NCERT-based questions from this chapter.' : active === 'notes' ? 'Make exam-focused short notes with definitions and important points.' : active === 'performance' ? 'Tell me my weakest topics and what to revise next.' : 'e.g. Teach me Present Perfect Tense from the basics in Hindi.'}
                  className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm leading-6 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
              </label>
              {active === 'doubt' && <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  <Upload className="h-4 w-4" /> Add question image
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => void handleImage(e.target.files?.[0])} />
                </label>
                {imageName && <span className="flex max-w-full items-center gap-2 text-xs text-slate-500"><span className="max-w-[180px] truncate">{imageName}</span><button type="button" onClick={() => { setImage(undefined); setImageName(''); }} aria-label="Remove image"><XCircle className="h-4 w-4" /></button></span>}
                <span className="text-xs text-slate-400">PNG, JPG or WebP · up to 5 MB</span>
              </div>}
              <button type="submit" disabled={loading || !input.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Send className="h-4 w-4" /> {active === 'doubt' ? 'Ask AI' : active === 'quiz' ? 'Generate Quiz' : 'Generate'}</>}
              </button>
            </form>

            {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {notice && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}
            {loading && <div className="mt-5 flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Gemini is preparing your study response...</div>}

            {answer && !quiz && <article className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/50 p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-violet-900"><Sparkles className="h-4 w-4" /> AI Response</div>
              <div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{answer}</div>
            </article>}

            {quiz && <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-extrabold text-slate-900">{quiz.title}</h3><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">{difficulty.toUpperCase()}</span></div>
              {quiz.questions.map((q, index) => <div key={`${index}-${q.question}`} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-bold text-slate-900">{index + 1}. {q.question}</p>
                <div className="mt-3 grid gap-2">
                  {q.options.map((option, optionIndex) => {
                    const selected = selections[index] === optionIndex;
                    const correct = q.correctIndex === optionIndex;
                    const style = quizSubmitted && correct ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : quizSubmitted && selected && !correct ? 'border-red-300 bg-red-50 text-red-800' : selected ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-slate-200 hover:bg-slate-50';
                    return <button key={optionIndex} type="button" disabled={quizSubmitted} onClick={() => setSelections((current) => ({ ...current, [index]: optionIndex }))} className={`rounded-xl border px-3 py-2.5 text-left text-sm ${style}`}>{String.fromCharCode(65 + optionIndex)}. {option}</button>;
                  })}
                </div>
                {quizSubmitted && <p className="mt-3 text-sm leading-6 text-slate-600"><strong>Explanation:</strong> {q.explanation}</p>}
              </div>)}
              {!quizSubmitted ? <button type="button" onClick={() => void submitQuiz()} disabled={Object.keys(selections).length !== quiz.questions.length} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-40">Submit quiz</button> : <div className="rounded-xl bg-emerald-50 p-4 font-bold text-emerald-900">Your score: {score}/{quiz.questions.length}</div>}
            </div>}

            {active === 'doubt' && history.length > 0 && <div className="mt-6 border-t border-slate-100 pt-4">
              <div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-slate-800">Conversation</h3><button type="button" onClick={() => { setHistory([]); setAnswer(''); }} className="text-xs font-bold text-violet-700">New chat</button></div>
              <div className="space-y-3">{history.map((item, index) => <div key={index} className={`rounded-xl p-3 text-sm leading-6 ${item.role === 'user' ? 'ml-5 bg-slate-100 text-slate-800' : 'mr-5 bg-violet-50 text-slate-700'}`}><span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{item.role === 'user' ? 'You' : 'AI Tutor'}</span>{item.text}</div>)}</div>
            </div>}
          </section>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 font-extrabold text-slate-900"><Target className="h-5 w-5 text-violet-700" /> Chapter progress</div>
              <p className="mt-1 text-xs leading-5 text-slate-500">Track completed chapters for your selected class and subject. Your progress is private to your account.</p>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500"><span>{subject} · Class {classLevel}</span><span>{progress.filter((p) => p.is_completed).length}/{progress.length} done</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${progress.length ? (progress.filter((p) => p.is_completed).length / progress.length) * 100 : 0}%` }} /></div>
              <div className="mt-4 space-y-2">
                {topicList.length > 0 ? topicList.map((topic) => {
                  const checked = progress.find((p) => p.chapter === topic)?.is_completed ?? false;
                  return <label key={topic} className="flex cursor-pointer items-start gap-2 text-sm text-slate-700"><input type="checkbox" checked={checked} disabled={saving} onChange={(e) => void toggleProgress(topic, e.target.checked)} className="mt-0.5 rounded border-slate-300 text-violet-700 focus:ring-violet-500" /><span className={checked ? 'text-slate-400 line-through' : ''}>{topic}</span></label>;
                }) : <p className="text-xs text-slate-400">Enter chapter names in the planner to build your checklist.</p>}
              </div>
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 font-extrabold text-slate-900"><BookOpen className="h-5 w-5 text-blue-700" /> How to get better answers</div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>• Mention your class, subject and chapter.</li>
                <li>• Ask one clear question at a time.</li>
                <li>• Tell the AI whether you prefer Hindi or English.</li>
                <li>• Verify important facts with your NCERT textbook and teacher.</li>
              </ul>
            </section>
            <section className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5">
              <div className="flex items-center gap-2 font-bold text-indigo-950"><RefreshCw className="h-4 w-4" /> Saved privately</div>
              <p className="mt-2 text-xs leading-5 text-indigo-800">Plans, generated notes, quiz scores and progress are stored against your signed-in account using database access policies.</p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
