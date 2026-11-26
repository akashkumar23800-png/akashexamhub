import express, { type Request, type Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '.data');
const DB_FILE = path.join(DATA_DIR, 'exam-hub.json');
const PORT = 3000;

interface SubjectRecord {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
}

interface QuestionRecord {
  id: string;
  subject_id: string;
  chapter: string | null;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface TestRecord {
  id: string;
  title: string;
  description: string | null;
  subject_id: string | null;
  kind: 'practice' | 'live';
  duration_minutes: number;
  scheduled_at: string | null;
  is_published: boolean;
  question_ids: string[];
}

interface AttemptRecord {
  id: string;
  score: number;
  max_score: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  total_questions: number;
  completed_at: string;
  test: { title: string } | null;
}

interface AttemptAnswerRecord {
  question_id: string;
  subject_id: string;
  is_correct: boolean | null;
}

interface NoteRecord {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

interface StudyMaterialRecord {
  id: string;
  title: string;
  description: string | null;
  category:
    | 'ncert_notes'
    | 'important_questions'
    | 'topper_notes'
    | 'chapter_mcqs'
    | 'revision_notes'
    | 'previous_year_questions'
    | 'sample_papers';
  class_level: number;
  medium: 'English' | 'Hindi';
  body: string | null;
  content_url: string | null;
}

interface DatabaseSchema {
  subjects: SubjectRecord[];
  questions: QuestionRecord[];
  tests: TestRecord[];
  attempts: AttemptRecord[];
  attempt_answers: AttemptAnswerRecord[];
  notes: NoteRecord[];
  study_materials: StudyMaterialRecord[];
  students_count: number;
}

function createInitialDb(): DatabaseSchema {
  const subjects: SubjectRecord[] = [
    { id: 'a1000000-0000-4000-8000-000000000001', slug: 'physics', name: 'Physics', description: 'Motion, force, light, electricity and more.', sort_order: 1 },
    { id: 'a1000000-0000-4000-8000-000000000002', slug: 'chemistry', name: 'Chemistry', description: 'Atoms, reactions, acids, bases and salts.', sort_order: 2 },
    { id: 'a1000000-0000-4000-8000-000000000003', slug: 'mathematics', name: 'Mathematics', description: 'Algebra, geometry, arithmetic and trigonometry.', sort_order: 3 },
    { id: 'a1000000-0000-4000-8000-000000000004', slug: 'reasoning', name: 'Reasoning', description: 'Logical, verbal and non-verbal reasoning.', sort_order: 4 },
    { id: 'a1000000-0000-4000-8000-000000000005', slug: 'biology', name: 'Biology', description: 'Cells, life processes and heredity.', sort_order: 5 },
    { id: 'a1000000-0000-4000-8000-000000000006', slug: 'english', name: 'English', description: 'Grammar, comprehension and writing skills.', sort_order: 6 },
    { id: 'a1000000-0000-4000-8000-000000000007', slug: 'hindi', name: 'Hindi', description: 'Vyakaran, sahitya and writing skills.', sort_order: 7 },
    { id: 'a1000000-0000-4000-8000-000000000008', slug: 'social-science', name: 'Social Science', description: 'History, geography, civics and economics.', sort_order: 8 },
    { id: 'a1000000-0000-4000-8000-000000000009', slug: 'history', name: 'History', description: 'Ancient, medieval and modern history.', sort_order: 9 },
    { id: 'a1000000-0000-4000-8000-000000000010', slug: 'geography', name: 'Geography', description: 'Physical and human geography of India and the world.', sort_order: 10 },
    { id: 'a1000000-0000-4000-8000-000000000011', slug: 'economics', name: 'Economics', description: 'Money, markets, national income and development.', sort_order: 11 },
    { id: 'a1000000-0000-4000-8000-000000000012', slug: 'political-science', name: 'Political Science', description: 'Constitution, governance and democracy.', sort_order: 12 },
  ];

  const questions: QuestionRecord[] = [
    { id: 'b1000000-0000-4000-8000-000000000101', subject_id: 'a1000000-0000-4000-8000-000000000001', chapter: 'Force and Laws of Motion', question_text: 'What is the SI unit of force?', options: ['Joule', 'Newton', 'Pascal', 'Watt'], correct_index: 1, explanation: 'Force is measured in newtons (N), named after Isaac Newton.', difficulty: 'easy' },
    { id: 'b1000000-0000-4000-8000-000000000102', subject_id: 'a1000000-0000-4000-8000-000000000001', chapter: 'Light', question_text: 'Approximately what is the speed of light in vacuum?', options: ['3 x 10^8 m/s', '3 x 10^6 m/s', '3 x 10^10 m/s', '3 x 10^4 m/s'], correct_index: 0, explanation: 'Light travels at about 3 x 10^8 metres per second in vacuum.', difficulty: 'easy' },
    { id: 'b1000000-0000-4000-8000-000000000103', subject_id: 'a1000000-0000-4000-8000-000000000001', chapter: 'Electricity', question_text: 'A resistor has a potential difference of 12 V and carries a current of 3 A. What is its resistance?', options: ['2 ohm', '4 ohm', '36 ohm', '9 ohm'], correct_index: 1, explanation: "By Ohm's law, R = V / I = 12 / 3 = 4 ohm.", difficulty: 'medium' },
    { id: 'b1000000-0000-4000-8000-000000000104', subject_id: 'a1000000-0000-4000-8000-000000000001', chapter: 'Light', question_text: 'Which type of mirror is used by dentists to view enlarged images of teeth?', options: ['Plane', 'Convex', 'Concave', 'Cylindrical'], correct_index: 2, explanation: 'A concave mirror forms a magnified, virtual image when the object is close to it.', difficulty: 'medium' },
    { id: 'b1000000-0000-4000-8000-000000000105', subject_id: 'a1000000-0000-4000-8000-000000000001', chapter: 'Force and Laws of Motion', question_text: 'A body stays at rest or in uniform motion unless acted on by an external force. Which law is this?', options: ['Second law of motion', 'First law of motion', 'Third law of motion', 'Law of gravitation'], correct_index: 1, explanation: "This is Newton's first law of motion, also called the law of inertia.", difficulty: 'easy' },
    { id: 'b1000000-0000-4000-8000-000000000201', subject_id: 'a1000000-0000-4000-8000-000000000002', chapter: 'Atomic Structure', question_text: 'What is the atomic number of carbon?', options: ['4', '6', '8', '12'], correct_index: 1, explanation: 'Carbon has 6 protons, so its atomic number is 6.', difficulty: 'easy' },
    { id: 'b1000000-0000-4000-8000-000000000202', subject_id: 'a1000000-0000-4000-8000-000000000002', chapter: 'Acids, Bases and Salts', question_text: 'What is the pH of a neutral solution at 25 degrees Celsius?', options: ['0', '1', '7', '14'], correct_index: 2, explanation: 'A neutral solution has a pH of 7 at 25 degrees Celsius.', difficulty: 'easy' },
    { id: 'b1000000-0000-4000-8000-000000000203', subject_id: 'a1000000-0000-4000-8000-000000000002', chapter: 'Chemical Bonding', question_text: 'What is the chemical formula of common table salt?', options: ['NaCl', 'KCl', 'NaOH', 'CaCO3'], correct_index: 0, explanation: 'Common salt is sodium chloride, NaCl.', difficulty: 'easy' },
    { id: 'b1000000-0000-4000-8000-000000000204', subject_id: 'a1000000-0000-4000-8000-000000000002', chapter: 'Metals and Non-metals', question_text: 'Which gas is evolved when zinc reacts with dilute hydrochloric acid?', options: ['Oxygen', 'Hydrogen', 'Chlorine', 'Carbon dioxide'], correct_index: 1, explanation: 'Zinc displaces hydrogen from dilute HCl, producing hydrogen gas.', difficulty: 'medium' },
    { id: 'b1000000-0000-4000-8000-000000000205', subject_id: 'a1000000-0000-4000-8000-000000000002', chapter: 'Chemical Bonding', question_text: 'How many hydrogen atoms are present in one molecule of water?', options: ['1', '2', '3', '4'], correct_index: 1, explanation: 'Water is H2O, so each molecule has two hydrogen atoms.', difficulty: 'easy' },
    { id: 'b1000000-0000-4000-8000-000000000301', subject_id: 'a1000000-0000-4000-8000-000000000003', chapter: 'Percentage', question_text: 'What is 15% of 200?', options: ['20', '25', '30', '35'], correct_index: 2, explanation: '15% of 200 = 0.15 x 200 = 30.', difficulty: 'easy' },
    { id: 'b1000000-0000-4000-8000-000000000302', subject_id: 'a1000000-0000-4000-8000-000000000003', chapter: 'Indices', question_text: 'What is the value of 2 raised to the power 5?', options: ['16', '25', '32', '64'], correct_index: 2, explanation: '2 x 2 x 2 x 2 x 2 = 32.', difficulty: 'easy' },
    { id: 'b1000000-0000-4000-8000-000000000303', subject_id: 'a1000000-0000-4000-8000-000000000003', chapter: 'Triangles', question_text: 'What is the sum of the interior angles of a triangle?', options: ['90 degrees', '180 degrees', '270 degrees', '360 degrees'], correct_index: 1, explanation: 'The interior angles of any triangle add up to 180 degrees.', difficulty: 'easy' },
    { id: 'b1000000-0000-4000-8000-000000000304', subject_id: 'a1000000-0000-4000-8000-000000000003', chapter: 'Number Systems', question_text: 'What is the HCF of 12 and 18?', options: ['2', '3', '6', '36'], correct_index: 2, explanation: 'The highest common factor of 12 and 18 is 6.', difficulty: 'medium' },
    { id: 'b1000000-0000-4000-8000-000000000305', subject_id: 'a1000000-0000-4000-8000-000000000003', chapter: 'Linear Equations', question_text: 'Solve for x: x + 5 = 12', options: ['5', '7', '17', '12'], correct_index: 1, explanation: 'Subtract 5 from both sides: x = 7.', difficulty: 'easy' },
    { id: 'b1000000-0000-4000-8000-000000000401', subject_id: 'a1000000-0000-4000-8000-000000000004', chapter: 'Classification', question_text: 'Which word is the odd one out? Apple, Banana, Carrot, Mango', options: ['Apple', 'Banana', 'Carrot', 'Mango'], correct_index: 2, explanation: 'Carrot is a vegetable; the others are fruits.', difficulty: 'easy' },
    { id: 'b1000000-0000-4000-8000-000000000402', subject_id: 'a1000000-0000-4000-8000-000000000004', chapter: 'Number Series', question_text: 'Complete the series: 2, 4, 8, 16, ?', options: ['18', '24', '32', '20'], correct_index: 2, explanation: 'Each term doubles the previous one, so the next term is 32.', difficulty: 'easy' },
    { id: 'b1000000-0000-4000-8000-000000000403', subject_id: 'a1000000-0000-4000-8000-000000000004', chapter: 'Analogy', question_text: 'Book is to Reading as Fork is to ?', options: ['Kitchen', 'Eating', 'Spoon', 'Food'], correct_index: 1, explanation: 'A book is used for reading, and a fork is used for eating.', difficulty: 'medium' },
    { id: 'b1000000-0000-4000-8000-000000000404', subject_id: 'a1000000-0000-4000-8000-000000000004', chapter: 'Direction Sense', question_text: 'Ram walks 3 km north and then 4 km east. How far is he from his starting point?', options: ['7 km', '5 km', '4 km', '3 km'], correct_index: 1, explanation: 'By Pythagoras, the distance is sqrt(3^2 + 4^2) = 5 km.', difficulty: 'medium' },
    { id: 'b1000000-0000-4000-8000-000000000405', subject_id: 'a1000000-0000-4000-8000-000000000004', chapter: 'Number Series', question_text: 'Complete the series: 1, 4, 9, 16, ?', options: ['20', '24', '25', '36'], correct_index: 2, explanation: 'These are consecutive perfect squares, so the next term is 25.', difficulty: 'easy' },
  ];

  const physicsIds = questions.filter((q) => q.subject_id.endsWith('01')).map((q) => q.id);
  const chemistryIds = questions.filter((q) => q.subject_id.endsWith('02')).map((q) => q.id);
  const mathsIds = questions.filter((q) => q.subject_id.endsWith('03')).map((q) => q.id);
  const reasoningIds = questions.filter((q) => q.subject_id.endsWith('04')).map((q) => q.id);

  const tests: TestRecord[] = [
    { id: 'c1000000-0000-4000-8000-000000000001', title: 'Physics Practice Test', description: 'Five questions covering motion, light and electricity.', subject_id: 'a1000000-0000-4000-8000-000000000001', kind: 'practice', duration_minutes: 15, scheduled_at: null, is_published: true, question_ids: physicsIds },
    { id: 'c1000000-0000-4000-8000-000000000002', title: 'Chemistry Practice Test', description: 'Five questions on atoms, acids and chemical bonding.', subject_id: 'a1000000-0000-4000-8000-000000000002', kind: 'practice', duration_minutes: 15, scheduled_at: null, is_published: true, question_ids: chemistryIds },
    { id: 'c1000000-0000-4000-8000-000000000003', title: 'Mathematics Practice Test', description: 'Five quick questions on percentages, indices and equations.', subject_id: 'a1000000-0000-4000-8000-000000000003', kind: 'practice', duration_minutes: 15, scheduled_at: null, is_published: true, question_ids: mathsIds },
    { id: 'c1000000-0000-4000-8000-000000000004', title: 'Reasoning Practice Test', description: 'Five questions on series, analogies and direction sense.', subject_id: 'a1000000-0000-4000-8000-000000000004', kind: 'practice', duration_minutes: 10, scheduled_at: null, is_published: true, question_ids: reasoningIds },
    { id: 'c1000000-0000-4000-8000-000000000005', title: 'Science Practice Test', description: 'Physics and Chemistry questions in one timed paper.', subject_id: null, kind: 'live', duration_minutes: 20, scheduled_at: null, is_published: true, question_ids: [...physicsIds, ...chemistryIds] },
    { id: 'c1000000-0000-4000-8000-000000000006', title: 'Akash Exam Hub Practice Exam', description: 'A mixed paper across all practice subjects.', subject_id: null, kind: 'live', duration_minutes: 30, scheduled_at: null, is_published: true, question_ids: questions.map((q) => q.id) },
    { id: 'c1000000-0000-4000-8000-000000000007', title: 'CBSE Class 10 Mock Test', description: 'A timed mock covering Physics, Chemistry and Mathematics.', subject_id: null, kind: 'live', duration_minutes: 40, scheduled_at: null, is_published: true, question_ids: [...physicsIds, ...chemistryIds, ...mathsIds] },
  ];

  const study_materials: StudyMaterialRecord[] = [
    { id: 'm-1', title: 'NCERT Notes: Light — Reflection and Refraction', description: 'Key formulas, mirror and lens sign conventions, and ray diagram rules.', category: 'ncert_notes', class_level: 10, medium: 'English', body: 'Laws of Reflection:\n1. The angle of incidence equals the angle of reflection.\n2. Incident ray, normal, and reflected ray lie in the same plane.\n\nMirror Formula: 1/f = 1/v + 1/u\nLens Formula: 1/f = 1/v - 1/u', content_url: null },
    { id: 'm-2', title: 'NCERT नोट्स: प्रकाश — परावर्तन तथा अपवर्तन', description: 'दर्पण और लेंस के मुख्य सूत्र एवं नियम।', category: 'ncert_notes', class_level: 10, medium: 'Hindi', body: 'परावर्तन के नियम:\n1. आपतन कोण परावर्तन कोण के बराबर होता है।\n2. आपतित किरण, अभिलंब और परावर्तित किरण एक ही तल में होते हैं।\n\nदर्पण सूत्र: 1/f = 1/v + 1/u', content_url: null },
    { id: 'm-3', title: 'Important Questions: Acids, Bases and Salts', description: 'Board-important questions on pH scale, indicators and neutralisation.', category: 'important_questions', class_level: 10, medium: 'English', body: '1. Why does dry HCl gas not change the colour of dry litmus paper?\n2. Write the chemical equation for baking soda heating.\n3. What is the pH of neutral water at 25°C?', content_url: null },
    { id: 'm-4', title: 'Revision Notes: Introduction to Trigonometry', description: 'One-page trigonometric ratios, standard angles and identities.', category: 'revision_notes', class_level: 10, medium: 'English', body: 'sin²θ + cos²θ = 1\n1 + tan²θ = sec²θ\n1 + cot²θ = cosec²θ', content_url: null },
  ];

  return {
    subjects,
    questions,
    tests,
    attempts: [],
    attempt_answers: [],
    notes: [],
    study_materials,
    students_count: 0,
  };
}

let dbCache: DatabaseSchema | null = null;

async function readDb(): Promise<DatabaseSchema> {
  if (dbCache) return dbCache;
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    dbCache = JSON.parse(raw) as DatabaseSchema;
    return dbCache;
  } catch {
    const initial = createInitialDb();
    await writeDb(initial);
    return initial;
  }
}

async function writeDb(db: DatabaseSchema): Promise<void> {
  dbCache = db;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function formatSubjects(db: DatabaseSchema) {
  return db.subjects
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((subject) => ({
      ...subject,
      questions: [{ count: db.questions.filter((q) => q.subject_id === subject.id).length }],
      tests: db.tests
        .filter((t) => t.is_published && t.subject_id === subject.id)
        .map((t) => ({ id: t.id, kind: t.kind })),
    }));
}

function formatTests(db: DatabaseSchema) {
  return db.tests
    .filter((t) => t.is_published)
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      subject_id: t.subject_id,
      kind: t.kind,
      duration_minutes: t.duration_minutes,
      scheduled_at: t.scheduled_at,
      test_questions: [{ count: t.question_ids.length }],
    }));
}

function computeStats(db: DatabaseSchema) {
  const todayPrefix = new Date().toISOString().slice(0, 10);
  return {
    questions: db.questions.length,
    tests: db.tests.filter((t) => t.is_published).length,
    students: db.students_count,
    notes_total: db.notes.length,
    notes_today: db.notes.filter((n) => n.created_at.startsWith(todayPrefix)).length,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '6mb' }));

  app.use('/api', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get('/api/health', async (_req: Request, res: Response) => {
    await readDb();
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.get('/api/subjects', async (_req: Request, res: Response) => {
    const db = await readDb();
    res.json(formatSubjects(db));
  });

  app.get('/api/tests', async (_req: Request, res: Response) => {
    const db = await readDb();
    res.json(formatTests(db));
  });

  app.get('/api/tests/:id', async (req: Request, res: Response) => {
    const db = await readDb();
    const test = db.tests.find((t) => t.id === req.params.id && t.is_published);
    if (!test) {
      res.json(null);
      return;
    }
    const subject = db.subjects.find((s) => s.id === test.subject_id) ?? null;
    res.json({
      id: test.id,
      title: test.title,
      description: test.description,
      kind: test.kind,
      duration_minutes: test.duration_minutes,
      scheduled_at: test.scheduled_at,
      subject: subject ? { name: subject.name, slug: subject.slug } : null,
      test_questions: [{ count: test.question_ids.length }],
    });
  });

  app.get('/api/tests/:id/questions', async (req: Request, res: Response) => {
    const db = await readDb();
    const test = db.tests.find((t) => t.id === req.params.id && t.is_published);
    if (!test) {
      res.status(404).json({ error: 'Test not found.' });
      return;
    }
    const rows = test.question_ids
      .map((qid, index) => {
        const q = db.questions.find((item) => item.id === qid);
        if (!q) return null;
        return {
          position: index + 1,
          question: {
            id: q.id,
            subject_id: q.subject_id,
            chapter: q.chapter,
            question_text: q.question_text,
            options: q.options,
            difficulty: q.difficulty,
          },
        };
      })
      .filter(Boolean);
    res.json(rows);
  });

  app.post('/api/tests/:id/submit', async (req: Request, res: Response) => {
    const db = await readDb();
    const test = db.tests.find((t) => t.id === req.params.id && t.is_published);
    if (!test) {
      res.status(404).json({ error: 'Test not found.' });
      return;
    }

    const bodyAnswers = Array.isArray(req.body?.answers)
      ? (req.body.answers as { question_id: string; selected_index: number | null }[])
      : [];
    const answerMap = new Map(bodyAnswers.map((a) => [a.question_id, a.selected_index]));

    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    const review = test.question_ids
      .map((qid) => db.questions.find((q) => q.id === qid))
      .filter((q): q is QuestionRecord => Boolean(q))
      .map((q) => {
        const selected = answerMap.get(q.id) ?? null;
        const isCorrect = selected === null ? null : selected === q.correct_index;
        if (selected === null) unanswered += 1;
        else if (isCorrect) correct += 1;
        else incorrect += 1;

        db.attempt_answers.push({
          question_id: q.id,
          subject_id: q.subject_id,
          is_correct: isCorrect,
        });

        return {
          question_id: q.id,
          subject_id: q.subject_id,
          selected_index: selected,
          correct_index: q.correct_index,
          is_correct: isCorrect,
          explanation: q.explanation,
        };
      });

    const attemptId = `attempt-${Date.now()}`;
    db.attempts.push({
      id: attemptId,
      score: correct,
      max_score: review.length,
      correct_count: correct,
      incorrect_count: incorrect,
      unanswered_count: unanswered,
      total_questions: review.length,
      completed_at: new Date().toISOString(),
      test: { title: test.title },
    });
    if (db.students_count === 0) db.students_count = 1;
    await writeDb(db);

    res.json({
      attempt_id: attemptId,
      score: correct,
      max_score: review.length,
      total: review.length,
      correct,
      incorrect,
      unanswered,
      review,
    });
  });

  app.get('/api/stats', async (_req: Request, res: Response) => {
    const db = await readDb();
    res.json(computeStats(db));
  });

  app.get('/api/attempts', async (_req: Request, res: Response) => {
    const db = await readDb();
    res.json(db.attempts);
  });

  app.get('/api/attempt-answers', async (_req: Request, res: Response) => {
    const db = await readDb();
    res.json(db.attempt_answers);
  });

  app.get('/api/leaderboard', async (req: Request, res: Response) => {
    const db = await readDb();
    const period = req.query.period === 'week' ? 'week' : 'month';
    const cutoff = Date.now() - (period === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000;
    const recent = db.attempts.filter((a) => new Date(a.completed_at).getTime() >= cutoff);
    if (recent.length === 0) {
      res.json([]);
      return;
    }
    const points = recent.reduce((sum, a) => sum + a.score * 10, 0);
    res.json([
      {
        place: 1,
        user_id: 'student-1',
        full_name: 'Student',
        points,
        tests_completed: recent.length,
      },
    ]);
  });

  app.get('/api/notes', async (_req: Request, res: Response) => {
    const db = await readDb();
    const sorted = db.notes.slice().sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    res.json(sorted);
  });

  app.post('/api/notes', async (req: Request, res: Response) => {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const body = typeof req.body?.body === 'string' ? req.body.body : '';
    if (!title && !body.trim()) {
      res.status(400).json({ error: 'Note title or body is required.' });
      return;
    }
    const db = await readDb();
    const now = new Date().toISOString();
    const note: NoteRecord = {
      id: `note-${Date.now()}`,
      title: title || 'Untitled Note',
      body,
      created_at: now,
      updated_at: now,
    };
    db.notes.unshift(note);
    await writeDb(db);
    res.status(201).json(note);
  });

  app.put('/api/notes/:id', async (req: Request, res: Response) => {
    const db = await readDb();
    const note = db.notes.find((n) => n.id === req.params.id);
    if (!note) {
      res.status(404).json({ error: 'Note not found.' });
      return;
    }
    if (typeof req.body?.title === 'string') note.title = req.body.title;
    if (typeof req.body?.body === 'string') note.body = req.body.body;
    note.updated_at = new Date().toISOString();
    await writeDb(db);
    res.json(note);
  });

  app.delete('/api/notes/:id', async (req: Request, res: Response) => {
    const db = await readDb();
    db.notes = db.notes.filter((n) => n.id !== req.params.id);
    await writeDb(db);
    res.status(204).end();
  });

  app.get('/api/study-materials', async (_req: Request, res: Response) => {
    const db = await readDb();
    res.json(db.study_materials);
  });

  app.post('/api/ai-assistant', async (req: Request, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'The AI Study Assistant requires a valid GEMINI_API_KEY in Settings > Secrets (or a connected Supabase Edge Function).',
      });
      return;
    }

    const input = typeof req.body?.input === 'string' ? req.body.input.trim() : '';
    if (!input) {
      res.status(400).json({ error: 'Please provide a question or study details.' });
      return;
    }

    try {
      const model = 'gemini-4-hydrogen';
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contents: { role: 'user' | 'model'; parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] }[] = [];
      if (Array.isArray(req.body?.history)) {
        for (const item of req.body.history.slice(-10)) {
          if ((item?.role === 'user' || item?.role === 'model') && typeof item?.text === 'string') {
            contents.push({ role: item.role, parts: [{ text: item.text }] });
          }
        }
      }
      const userParts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [{ text: input }];
      if (req.body?.image?.mimeType && req.body?.image?.data) {
        userParts.push({ inlineData: { mimeType: req.body.image.mimeType, data: req.body.image.data } });
      }
      contents.push({ role: 'user', parts: userParts });

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: `You are Akash Exam Hub's CBSE tutor for Classes 6-12. Preferred language: ${
            req.body?.language || 'English'
          }. Give clear, accurate, step-by-step explanations.`,
          ...(req.body?.mode === 'quiz' || req.body?.mode === 'ai-detect'
            ? { responseMimeType: 'application/json' }
            : {}),
        },
      });

      const text = response.text?.trim();
      if (!text) {
        res.status(502).json({ error: 'The AI service returned an empty answer.' });
        return;
      }
      res.json({ text, model });
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED') || message.includes('403') || message.includes('400')) {
        res.status(503).json({
          error: 'The configured GEMINI_API_KEY was rejected by Gemini. Please check or select a valid API key in Settings > Secrets.',
        });
        return;
      }
      res.status(502).json({ error: 'The AI service could not be reached. Please try again.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });
    app.get('/@vite/client', (_req, res) => {
      res.type('application/javascript').send(`
const sheetsMap = new Map();
const linkSheetsMap = new Map();
if (typeof document !== 'undefined') {
  document.querySelectorAll('style[data-vite-dev-id]').forEach((el) => {
    sheetsMap.set(el.getAttribute('data-vite-dev-id'), el);
  });
  document.querySelectorAll('link[rel="stylesheet"][data-vite-dev-id]').forEach((el) => {
    linkSheetsMap.set(el.getAttribute('data-vite-dev-id'), el);
  });
}
export function updateStyle(id, content) {
  if (linkSheetsMap.has(id)) return;
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
  } else {
    style.textContent = content;
  }
  sheetsMap.set(id, style);
}
export function removeStyle(id) {
  if (linkSheetsMap.has(id)) {
    document.querySelectorAll('link[rel="stylesheet"][data-vite-dev-id]').forEach((el) => {
      if (el.getAttribute('data-vite-dev-id') === id) el.remove();
    });
    linkSheetsMap.delete(id);
  }
  const style = sheetsMap.get(id);
  if (style) {
    style.remove();
    sheetsMap.delete(id);
  }
}
export function createHotContext() {
  return {
    data: {},
    accept() {},
    acceptExports() {},
    dispose() {},
    prune() {},
    decline() {},
    invalidate() {},
    on() {},
    off() {},
    send() {},
  };
}
export function injectQuery(url, queryToInject) {
  if (url[0] !== '.' && url[0] !== '/') return url;
  const pathname = url.replace(/[?#].*$/, '');
  const { search, hash } = new URL(url, 'http://vite.dev');
  return pathname + '?' + queryToInject + (search ? '&' + search.slice(1) : '') + (hash || '');
}
export class ErrorOverlay {}
`);
    });
    app.use((req, _res, next) => {
      if (req.url === '/app' || req.url === '/app/') {
        req.url = '/app.html';
      }
      next();
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/app*', (_req, res) => {
      res.sendFile(path.join(distDir, 'app.html'));
    });
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Akash Exam Hub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
