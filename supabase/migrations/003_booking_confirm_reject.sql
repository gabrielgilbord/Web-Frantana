-- Allow confirmed / rejected booking outcomes (email notifications to requester)
alter table public.bookings
  drop constraint if exists bookings_status_check;

update public.bookings set status = 'confirmed' where status = 'completed';
update public.bookings set status = 'rejected' where status = 'cancelled';
update public.bookings
  set status = 'new'
  where status not in ('new','read','replied','confirmed','rejected','archived');

alter table public.bookings
  add constraint bookings_status_check
  check (status in ('new','read','replied','confirmed','rejected','archived'));
