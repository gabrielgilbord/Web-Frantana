-- Sembrar fotos oficiales del repo en gallery_images (paths públicos /media/…)
-- IDs en UUID: compatible con id uuid (001) o text (002).

insert into public.gallery_images (
  id, src, alt, width, height, published, sort_order, credit
) values
  ('a7f7a001-0001-4000-8000-000000000001', '/media/gallery/frantana/shot-01.jpg', 'Frantana — retrato de estudio', 1800, 2705, true, 1, '@frantana'),
  ('a7f7a001-0001-4000-8000-000000000003', '/media/gallery/frantana/shot-03.jpg', 'Frantana — fotografía oficial', 1800, 2705, true, 2, '@frantana'),
  ('a7f7a001-0001-4000-8000-000000000004', '/media/gallery/frantana/shot-04.jpg', 'Frantana — plano horizontal de estudio', 1800, 1197, true, 4, '@frantana'),
  ('a7f7a001-0001-4000-8000-000000000005', '/media/gallery/frantana/shot-05.jpg', 'Frantana — fotografía oficial', 1800, 2705, true, 5, '@frantana'),
  ('a7f7a001-0001-4000-8000-000000000006', '/media/gallery/frantana/shot-06.jpg', 'Frantana — estudio, sonrisa y bandana amarilla', 1800, 2705, true, 6, '@frantana'),
  ('a7f7a001-0001-4000-8000-000000000007', '/media/gallery/frantana/shot-07.jpg', 'Frantana — estudio con foco en el suelo', 1800, 2705, true, 7, '@frantana'),
  ('a7f7a001-0001-4000-8000-000000000008', '/media/gallery/frantana/shot-08.jpg', 'Frantana — pose de estudio, mano en la cadera', 1800, 2705, true, 8, '@frantana'),
  ('a7f7a001-0001-4000-8000-000000000009', '/media/gallery/frantana/shot-09.jpg', 'Frantana — retrato en arena blanca, look blanco', 2200, 1464, true, 9, '@frantana')
on conflict (id) do update set
  src = excluded.src,
  alt = excluded.alt,
  width = excluded.width,
  height = excluded.height,
  published = excluded.published,
  sort_order = excluded.sort_order,
  credit = excluded.credit;
