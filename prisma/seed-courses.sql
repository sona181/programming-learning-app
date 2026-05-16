-- Category
INSERT INTO course_categories (id, name, slug)
VALUES ('d4e5f6a7-b8c9-4012-defa-123456789012', 'Informatike', 'informatike')
ON CONFLICT (slug) DO NOTHING;

-- Java Basics
INSERT INTO courses (id, category_id, author_id, title, description, slug, level, status, is_premium, price, language, published_at, created_at, updated_at)
VALUES (
  'a1b2c3d4-e5f6-4789-abcd-ef0123456789',
  'd4e5f6a7-b8c9-4012-defa-123456789012',
  '76375492-24bc-4a94-8f38-0fcde48d1880',
  'Java per Fillestare',
  'Meso Java nga fillimi - variablat, rrjedha e kontrollit, ciklat dhe metodat.',
  'java-basics',
  'beginner',
  'published',
  false,
  NULL,
  'en',
  NOW(), NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Python Basics
INSERT INTO courses (id, category_id, author_id, title, description, slug, level, status, is_premium, price, language, published_at, created_at, updated_at)
VALUES (
  'b2c3d4e5-f6a7-4890-bcde-f01234567890',
  'd4e5f6a7-b8c9-4012-defa-123456789012',
  '76375492-24bc-4a94-8f38-0fcde48d1880',
  'Python per Fillestare',
  'Meso Python nga e para - sintaksa, funksionet, listat dhe shume me teper.',
  'python-basics',
  'beginner',
  'published',
  false,
  NULL,
  'en',
  NOW(), NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- C Basics
INSERT INTO courses (id, category_id, author_id, title, description, slug, level, status, is_premium, price, language, published_at, created_at, updated_at)
VALUES (
  'c3d4e5f6-a7b8-4901-cdef-012345678901',
  'd4e5f6a7-b8c9-4012-defa-123456789012',
  '76375492-24bc-4a94-8f38-0fcde48d1880',
  'Programim me C',
  'Meso gjuhen C nga fillimi - pointerat, memorja, dhe strukturat e te dhenave.',
  'c-basics',
  'intermediate',
  'published',
  false,
  NULL,
  'en',
  NOW(), NOW(), NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Java chapters (6 units matching the JSON)
INSERT INTO chapters (id, course_id, title, order_index, created_at) VALUES
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4789-abcd-ef0123456789', 'Java Foundations', 1, NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4789-abcd-ef0123456789', 'Variables and Data Types', 2, NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4789-abcd-ef0123456789', 'Control Flow', 3, NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4789-abcd-ef0123456789', 'Loops', 4, NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4789-abcd-ef0123456789', 'Methods and Functions', 5, NOW()),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-4789-abcd-ef0123456789', 'Arrays and Collections', 6, NOW());

-- Python chapters
INSERT INTO chapters (id, course_id, title, order_index, created_at) VALUES
  (gen_random_uuid(), 'b2c3d4e5-f6a7-4890-bcde-f01234567890', 'Python Foundations', 1, NOW()),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-4890-bcde-f01234567890', 'Variables and Types', 2, NOW()),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-4890-bcde-f01234567890', 'Control Flow', 3, NOW()),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-4890-bcde-f01234567890', 'Loops and Iteration', 4, NOW()),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-4890-bcde-f01234567890', 'Functions', 5, NOW()),
  (gen_random_uuid(), 'b2c3d4e5-f6a7-4890-bcde-f01234567890', 'Lists and Dictionaries', 6, NOW());

-- C chapters
INSERT INTO chapters (id, course_id, title, order_index, created_at) VALUES
  (gen_random_uuid(), 'c3d4e5f6-a7b8-4901-cdef-012345678901', 'C Foundations', 1, NOW()),
  (gen_random_uuid(), 'c3d4e5f6-a7b8-4901-cdef-012345678901', 'Variables and Types', 2, NOW()),
  (gen_random_uuid(), 'c3d4e5f6-a7b8-4901-cdef-012345678901', 'Control Flow', 3, NOW()),
  (gen_random_uuid(), 'c3d4e5f6-a7b8-4901-cdef-012345678901', 'Functions and Pointers', 4, NOW()),
  (gen_random_uuid(), 'c3d4e5f6-a7b8-4901-cdef-012345678901', 'Arrays and Strings', 5, NOW()),
  (gen_random_uuid(), 'c3d4e5f6-a7b8-4901-cdef-012345678901', 'Memory Management', 6, NOW());

-- Instructor rating for Elisona Doku
UPDATE instructor_profiles
SET rating = 4.80
WHERE user_id = '76375492-24bc-4a94-8f38-0fcde48d1880';

-- Enroll elisonadoku05 student in Java and Python
INSERT INTO enrollments (id, user_id, course_id, status, enrolled_at)
VALUES
  ('e5f6a7b8-c9d0-4123-efab-234567890123', '192291f8-d819-4436-9aad-f829949bea24', 'a1b2c3d4-e5f6-4789-abcd-ef0123456789', 'active', NOW()),
  ('f6a7b8c9-d0e1-4234-fabc-345678901234', '192291f8-d819-4436-9aad-f829949bea24', 'b2c3d4e5-f6a7-4890-bcde-f01234567890', 'active', NOW())
ON CONFLICT (user_id, course_id) DO NOTHING;
