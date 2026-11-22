/*
# Starter catalogue for Akash Exam Hub

1. Subjects
- The 12 CBSE practice subjects: Physics, Chemistry, Mathematics, Reasoning, Biology, English, Hindi, Social Science, History, Geography, Economics, Political Science.

2. Sample content
- 5 sample multiple-choice questions each for Physics, Chemistry, Mathematics and Reasoning.
- 4 subject practice tests (one per subject above).
- 3 live tests: Science Practice Test, Akash Exam Hub Practice Exam and CBSE Class 10 Mock Test. No dates are set, so the app shows "Date to be announced" until an administrator schedules them.
- 4 study material placeholders (marked as placeholders) so the study section has a working structure. Replace them with real notes.

3. Important notes
- Everything here is idempotent: re-running the migration does not duplicate rows.
- Administrators can edit dates, publish tests and add questions directly in the database at any time.
- Live test dates are stored in `tests.scheduled_at` and are only shown when set.
*/

INSERT INTO subjects (id, slug, name, description, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'physics', 'Physics', 'Motion, force, light, electricity and more.', 1),
  ('a1000000-0000-4000-8000-000000000002', 'chemistry', 'Chemistry', 'Atoms, reactions, acids, bases and salts.', 2),
  ('a1000000-0000-4000-8000-000000000003', 'mathematics', 'Mathematics', 'Algebra, geometry, arithmetic and trigonometry.', 3),
  ('a1000000-0000-4000-8000-000000000004', 'reasoning', 'Reasoning', 'Logical, verbal and non-verbal reasoning.', 4),
  ('a1000000-0000-4000-8000-000000000005', 'biology', 'Biology', 'Cells, life processes and heredity.', 5),
  ('a1000000-0000-4000-8000-000000000006', 'english', 'English', 'Grammar, comprehension and writing skills.', 6),
  ('a1000000-0000-4000-8000-000000000007', 'hindi', 'Hindi', 'Vyakaran, sahitya and writing skills.', 7),
  ('a1000000-0000-4000-8000-000000000008', 'social-science', 'Social Science', 'History, geography, civics and economics.', 8),
  ('a1000000-0000-4000-8000-000000000009', 'history', 'History', 'Ancient, medieval and modern history.', 9),
  ('a1000000-0000-4000-8000-000000000010', 'geography', 'Geography', 'Physical and human geography of India and the world.', 10),
  ('a1000000-0000-4000-8000-000000000011', 'economics', 'Economics', 'Money, markets, national income and development.', 11),
  ('a1000000-0000-4000-8000-000000000012', 'political-science', 'Political Science', 'Constitution, governance and democracy.', 12)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO questions (id, subject_id, chapter, question_text, options, correct_index, explanation, difficulty) VALUES
  ('b1000000-0000-4000-8000-000000000101', 'a1000000-0000-4000-8000-000000000001', 'Force and Laws of Motion', 'What is the SI unit of force?', '["Joule", "Newton", "Pascal", "Watt"]', 1, 'Force is measured in newtons (N), named after Isaac Newton.', 'easy'),
  ('b1000000-0000-4000-8000-000000000102', 'a1000000-0000-4000-8000-000000000001', 'Light', 'Approximately what is the speed of light in vacuum?', '["3 x 10^8 m/s", "3 x 10^6 m/s", "3 x 10^10 m/s", "3 x 10^4 m/s"]', 0, 'Light travels at about 3 x 10^8 metres per second in vacuum.', 'easy'),
  ('b1000000-0000-4000-8000-000000000103', 'a1000000-0000-4000-8000-000000000001', 'Electricity', 'A resistor has a potential difference of 12 V and carries a current of 3 A. What is its resistance?', '["2 ohm", "4 ohm", "36 ohm", "9 ohm"]', 1, 'By Ohm''s law, R = V / I = 12 / 3 = 4 ohm.', 'medium'),
  ('b1000000-0000-4000-8000-000000000104', 'a1000000-0000-4000-8000-000000000001', 'Light', 'Which type of mirror is used by dentists to view enlarged images of teeth?', '["Plane", "Convex", "Concave", "Cylindrical"]', 2, 'A concave mirror forms a magnified, virtual image when the object is close to it.', 'medium'),
  ('b1000000-0000-4000-8000-000000000105', 'a1000000-0000-4000-8000-000000000001', 'Force and Laws of Motion', 'A body stays at rest or in uniform motion unless acted on by an external force. Which law is this?', '["Second law of motion", "First law of motion", "Third law of motion", "Law of gravitation"]', 1, 'This is Newton''s first law of motion, also called the law of inertia.', 'easy'),
  ('b1000000-0000-4000-8000-000000000201', 'a1000000-0000-4000-8000-000000000002', 'Atomic Structure', 'What is the atomic number of carbon?', '["4", "6", "8", "12"]', 1, 'Carbon has 6 protons, so its atomic number is 6.', 'easy'),
  ('b1000000-0000-4000-8000-000000000202', 'a1000000-0000-4000-8000-000000000002', 'Acids, Bases and Salts', 'What is the pH of a neutral solution at 25 degrees Celsius?', '["0", "1", "7", "14"]', 2, 'A neutral solution has a pH of 7 at 25 degrees Celsius.', 'easy'),
  ('b1000000-0000-4000-8000-000000000203', 'a1000000-0000-4000-8000-000000000002', 'Chemical Bonding', 'What is the chemical formula of common table salt?', '["NaCl", "KCl", "NaOH", "CaCO3"]', 0, 'Common salt is sodium chloride, NaCl.', 'easy'),
  ('b1000000-0000-4000-8000-000000000204', 'a1000000-0000-4000-8000-000000000002', 'Metals and Non-metals', 'Which gas is evolved when zinc reacts with dilute hydrochloric acid?', '["Oxygen", "Hydrogen", "Chlorine", "Carbon dioxide"]', 1, 'Zinc displaces hydrogen from dilute HCl, producing hydrogen gas.', 'medium'),
  ('b1000000-0000-4000-8000-000000000205', 'a1000000-0000-4000-8000-000000000002', 'Chemical Bonding', 'How many hydrogen atoms are present in one molecule of water?', '["1", "2", "3", "4"]', 1, 'Water is H2O, so each molecule has two hydrogen atoms.', 'easy'),
  ('b1000000-0000-4000-8000-000000000301', 'a1000000-0000-4000-8000-000000000003', 'Percentage', 'What is 15% of 200?', '["20", "25", "30", "35"]', 2, '15% of 200 = 0.15 x 200 = 30.', 'easy'),
  ('b1000000-0000-4000-8000-000000000302', 'a1000000-0000-4000-8000-000000000003', 'Indices', 'What is the value of 2 raised to the power 5?', '["16", "25", "32", "64"]', 2, '2 x 2 x 2 x 2 x 2 = 32.', 'easy'),
  ('b1000000-0000-4000-8000-000000000303', 'a1000000-0000-4000-8000-000000000003', 'Triangles', 'What is the sum of the interior angles of a triangle?', '["90 degrees", "180 degrees", "270 degrees", "360 degrees"]', 1, 'The interior angles of any triangle add up to 180 degrees.', 'easy'),
  ('b1000000-0000-4000-8000-000000000304', 'a1000000-0000-4000-8000-000000000003', 'Number Systems', 'What is the HCF of 12 and 18?', '["2", "3", "6", "36"]', 2, 'Factors of 12 are 1,2,3,4,6,12 and of 18 are 1,2,3,6,9,18. The highest common factor is 6.', 'medium'),
  ('b1000000-0000-4000-8000-000000000305', 'a1000000-0000-4000-8000-000000000003', 'Linear Equations', 'Solve for x: x + 5 = 12', '["5", "7", "17", "12"]', 1, 'Subtract 5 from both sides: x = 7.', 'easy'),
  ('b1000000-0000-4000-8000-000000000401', 'a1000000-0000-4000-8000-000000000004', 'Classification', 'Which word is the odd one out? Apple, Banana, Carrot, Mango', '["Apple", "Banana", "Carrot", "Mango"]', 2, 'Carrot is a vegetable; the others are fruits.', 'easy'),
  ('b1000000-0000-4000-8000-000000000402', 'a1000000-0000-4000-8000-000000000004', 'Number Series', 'Complete the series: 2, 4, 8, 16, ?', '["18", "24", "32", "20"]', 2, 'Each term doubles the previous one, so the next term is 32.', 'easy'),
  ('b1000000-0000-4000-8000-000000000403', 'a1000000-0000-4000-8000-000000000004', 'Analogy', 'Book is to Reading as Fork is to ?', '["Kitchen", "Eating", "Spoon", "Food"]', 1, 'A book is used for reading, and a fork is used for eating.', 'medium'),
  ('b1000000-0000-4000-8000-000000000404', 'a1000000-0000-4000-8000-000000000004', 'Direction Sense', 'Ram walks 3 km north and then 4 km east. How far is he from his starting point?', '["7 km", "5 km", "4 km", "3 km"]', 1, 'By Pythagoras, the distance is the square root of (3 squared + 4 squared) = 5 km.', 'medium'),
  ('b1000000-0000-4000-8000-000000000405', 'a1000000-0000-4000-8000-000000000004', 'Number Series', 'Complete the series: 1, 4, 9, 16, ?', '["20", "24", "25", "36"]', 2, 'These are consecutive perfect squares, so the next term is 25.', 'easy')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tests (id, title, description, subject_id, kind, duration_minutes, scheduled_at, is_published) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'Physics Practice Test', 'Five questions covering motion, light and electricity.', 'a1000000-0000-4000-8000-000000000001', 'practice', 15, NULL, true),
  ('c1000000-0000-4000-8000-000000000002', 'Chemistry Practice Test', 'Five questions on atoms, acids and chemical bonding.', 'a1000000-0000-4000-8000-000000000002', 'practice', 15, NULL, true),
  ('c1000000-0000-4000-8000-000000000003', 'Mathematics Practice Test', 'Five quick questions on percentages, indices and equations.', 'a1000000-0000-4000-8000-000000000003', 'practice', 15, NULL, true),
  ('c1000000-0000-4000-8000-000000000004', 'Reasoning Practice Test', 'Five questions on series, analogies and direction sense.', 'a1000000-0000-4000-8000-000000000004', 'practice', 10, NULL, true),
  ('c1000000-0000-4000-8000-000000000005', 'Science Practice Test', 'Physics and Chemistry questions in one timed paper.', NULL, 'live', 20, NULL, true),
  ('c1000000-0000-4000-8000-000000000006', 'Akash Exam Hub Practice Exam', 'A mixed paper across all practice subjects.', NULL, 'live', 30, NULL, true),
  ('c1000000-0000-4000-8000-000000000007', 'CBSE Class 10 Mock Test', 'A timed mock covering Physics, Chemistry and Mathematics.', NULL, 'live', 40, NULL, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_questions (test_id, question_id, position)
SELECT t.id, q.id, row_number() OVER (PARTITION BY t.id ORDER BY q.id)
FROM tests t
JOIN questions q ON (
  (t.id IN ('c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002',
            'c1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000004')
     AND q.subject_id = t.subject_id)
  OR (t.id = 'c1000000-0000-4000-8000-000000000005'
     AND q.subject_id IN ('a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002'))
  OR (t.id = 'c1000000-0000-4000-8000-000000000006')
  OR (t.id = 'c1000000-0000-4000-8000-000000000007'
     AND q.subject_id IN ('a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000003'))
)
ON CONFLICT (test_id, question_id) DO NOTHING;

INSERT INTO study_materials (title, description, category, class_level, medium, body, is_published)
SELECT v.title, v.description, v.category, v.class_level, v.medium, v.body, true
FROM (VALUES
  ('NCERT Notes: Light (Placeholder)', 'Placeholder entry. Replace with your NCERT chapter notes.', 'ncert_notes', 10, 'English', 'This is placeholder content. Replace it with the full chapter notes.'),
  ('NCERT Notes: Light (Hindi Placeholder)', 'Placeholder entry. Replace with Hindi NCERT chapter notes.', 'ncert_notes', 10, 'Hindi', 'यह एक प्लेसहोल्डर सामग्री है। इसे अध्याय के पूरे नोट्स से बदलें।'),
  ('Important Questions: Acids and Bases (Placeholder)', 'Placeholder entry. Replace with board-important questions.', 'important_questions', 10, 'English', 'This is placeholder content. Replace it with the important questions list.'),
  ('Revision Notes: Trigonometry (Placeholder)', 'Placeholder entry. Replace with one-page revision notes.', 'revision_notes', 10, 'English', 'This is placeholder content. Replace it with the revision notes.')
) AS v(title, description, category, class_level, medium, body)
WHERE NOT EXISTS (SELECT 1 FROM study_materials);
