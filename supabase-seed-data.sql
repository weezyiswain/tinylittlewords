-- Seed data for Tiny Little Words
-- Run this after creating the schema

-- Insert word packs
INSERT INTO packs (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Animals', 'Friendly creatures and pets'),
  ('22222222-2222-2222-2222-222222222222', 'Nature', 'Things you find outdoors'),
  ('33333333-3333-3333-3333-333333333333', 'Food', 'Yummy treats and meals'),
  ('44444444-4444-4444-4444-444444444444', 'Toys', 'Fun things to play with'),
  ('55555555-5555-5555-5555-555555555555', 'Colors', 'Bright and beautiful hues');

-- Insert 3-letter words
INSERT INTO words (text, length, difficulty) VALUES
  ('SUN', 3, 'easy'),
  ('CAT', 3, 'easy'),
  ('DOG', 3, 'easy'),
  ('BEE', 3, 'easy'),
  ('HAT', 3, 'easy'),
  ('PEN', 3, 'easy'),
  ('RUN', 3, 'easy'),
  ('FUN', 3, 'easy'),
  ('BIG', 3, 'easy'),
  ('RED', 3, 'easy'),
  ('BLUE', 3, 'easy'),
  ('GREEN', 3, 'easy');

-- Insert 4-letter words
INSERT INTO words (text, length, difficulty) VALUES
  ('FROG', 4, 'easy'),
  ('MOON', 4, 'easy'),
  ('MILK', 4, 'easy'),
  ('STAR', 4, 'easy'),
  ('BOOK', 4, 'easy'),
  ('TREE', 4, 'easy'),
  ('JUMP', 4, 'easy'),
  ('FISH', 4, 'easy'),
  ('BIRD', 4, 'easy'),
  ('CAKE', 4, 'easy'),
  ('BALL', 4, 'easy'),
  ('HAND', 4, 'easy'),
  ('FIRE', 4, 'easy'),
  ('WIND', 4, 'easy'),
  ('RAIN', 4, 'easy');

-- Insert 5-letter words
INSERT INTO words (text, length, difficulty) VALUES
  ('APPLE', 5, 'easy'),
  ('SMILE', 5, 'easy'),
  ('TRAIN', 5, 'easy'),
  ('BREAD', 5, 'easy'),
  ('HEART', 5, 'easy'),
  ('PLANT', 5, 'easy'),
  ('LIGHT', 5, 'easy'),
  ('SWEET', 5, 'easy'),
  ('HAPPY', 5, 'easy'),
  ('SLEEP', 5, 'easy'),
  ('DANCE', 5, 'easy'),
  ('MUSIC', 5, 'easy'),
  ('WATER', 5, 'easy'),
  ('HOUSE', 5, 'easy'),
  ('FLOWER', 5, 'easy');

-- Link words to packs (Animals)
INSERT INTO pack_words (pack_id, word_id) 
SELECT '11111111-1111-1111-1111-111111111111', id FROM words 
WHERE text IN ('CAT', 'DOG', 'BEE', 'FROG', 'FISH', 'BIRD');

-- Link words to packs (Nature)
INSERT INTO pack_words (pack_id, word_id) 
SELECT '22222222-2222-2222-2222-222222222222', id FROM words 
WHERE text IN ('SUN', 'MOON', 'STAR', 'TREE', 'FIRE', 'WIND', 'RAIN', 'PLANT', 'FLOWER');

-- Link words to packs (Food)
INSERT INTO pack_words (pack_id, word_id) 
SELECT '33333333-3333-3333-3333-333333333333', id FROM words 
WHERE text IN ('MILK', 'CAKE', 'BREAD', 'APPLE', 'SWEET');

-- Link words to packs (Toys)
INSERT INTO pack_words (pack_id, word_id) 
SELECT '44444444-4444-4444-4444-444444444444', id FROM words 
WHERE text IN ('BALL', 'TRAIN');

-- Link words to packs (Colors)
INSERT INTO pack_words (pack_id, word_id) 
SELECT '55555555-5555-5555-5555-555555555555', id FROM words 
WHERE text IN ('RED', 'BLUE', 'GREEN');
