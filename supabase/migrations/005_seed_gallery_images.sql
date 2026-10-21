-- Sembrar fotos oficiales del repo en gallery_images (paths públicos /media/…)
-- Así las subidas nuevas se suman y no sustituyen el seed vacío de la tabla.

insert into public.gallery_images (
  id, src, alt, width, height, published, sort_order, credit
) values
  ('ig-01', '/media/gallery/frantana/shot-01.jpg', 'Frantana — retrato de estudio', 1800, 2705, true, 1, '@frantana'),
  ('ig-03', '/media/gallery/frantana/shot-03.jpg', 'Frantana — fotografía oficial', 1800, 2705, true, 2, '@frantana'),
  ('ig-04', '/media/gallery/frantana/shot-04.jpg', 'Frantana — plano horizontal de estudio', 1800, 1197, true, 4, '@frantana'),
  ('ig-05', '/media/gallery/frantana/shot-05.jpg', 'Frantana — fotografía oficial', 1800, 2705, true, 5, '@frantana'),
  ('ig-06', '/media/gallery/frantana/shot-06.jpg', 'Frantana — estudio, sonrisa y bandana amarilla', 1800, 2705, true, 6, '@frantana'),
  ('ig-07', '/media/gallery/frantana/shot-07.jpg', 'Frantana — estudio con foco en el suelo', 1800, 2705, true, 7, '@frantana'),
  ('ig-08', '/media/gallery/frantana/shot-08.jpg', 'Frantana — pose de estudio, mano en la cadera', 1800, 2705, true, 8, '@frantana'),
  ('ig-09', '/media/gallery/frantana/shot-09.jpg', 'Frantana — retrato en arena blanca, look blanco', 2200, 1464, true, 9, '@frantana')
on conflict (id) do update set
  src = excluded.src,
  alt = excluded.alt,
  width = excluded.width,
  height = excluded.height,
  published = excluded.published,
  sort_order = excluded.sort_order,
  credit = excluded.credit;
