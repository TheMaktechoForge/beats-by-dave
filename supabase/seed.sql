-- =========================================================
-- Beats by Dave — sample beats for development
-- =========================================================
-- Run after schema.sql. Three placeholder beats with realistic
-- metadata so the site looks alive during development. Replace
-- with real beats via /admin/upload once files are uploaded.

insert into public.beats (slug, title, genre, mood, bpm, musical_key, description, preview_path, mp3_path, wav_path, trackouts_path, price_mp3_cents, price_wav_cents, price_trackouts_cents, price_exclusive_cents, published, featured)
values
  ('midnight-dreams', 'Midnight Dreams', 'Trap', 'Dark', 145, 'F# minor',
   'Hard-hitting trap beat with cinematic strings and 808s.',
   'previews/midnight-dreams.mp3',
   'media/midnight-dreams.mp3',
   'media/midnight-dreams.wav',
   'media/midnight-dreams-stems.zip',
   2999, 4999, 9999, 49999,
   true, true),

  ('no-mercy', 'No Mercy', 'Hip-Hop', 'Aggressive', 92, 'C minor',
   'Boom-bap with hard kicks and chopped soul samples.',
   'previews/no-mercy.mp3',
   'media/no-mercy.mp3',
   'media/no-mercy.wav',
   'media/no-mercy-stems.zip',
   2999, 4999, 9999, 49999,
   true, false),

  ('skyline', 'Skyline', 'R&B', 'Smooth', 78, 'A minor',
   'Moody R&B with lush pads and crisp percussion.',
   'previews/skyline.mp3',
   'media/skyline.mp3',
   'media/skyline.wav',
   'media/skyline-stems.zip',
   2999, 4999, 9999, 49999,
   true, false)
on conflict (slug) do nothing;