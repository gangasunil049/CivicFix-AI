create extension if not exists pgcrypto;

create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  issue_type text not null,
  description text not null,
  photo_url text null,
  latitude double precision not null,
  longitude double precision not null,
  address text not null,
  location_source text not null default 'manual_pin' check (location_source in ('photo_exif', 'device_gps', 'manual_pin')),
  status text not null default 'Submitted' check (status in ('Submitted', 'Under Review', 'In Progress', 'Resolved')),
  created_at timestamptz not null default now(),
  ai jsonb not null default '{}'::jsonb
);

create table if not exists status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  status text not null check (status in ('Submitted', 'Under Review', 'In Progress', 'Resolved')),
  changed_at timestamptz not null default now(),
  changed_by text not null default 'system'
);

create index if not exists idx_complaints_status on complaints(status);
create index if not exists idx_complaints_issue_type on complaints(issue_type);
create index if not exists idx_complaints_created_at on complaints(created_at desc);

create index if not exists idx_status_history_complaint_id on status_history(complaint_id);

create policy "Allow public read access for complaints"
  on complaints for select
  using (true);

create policy "Allow public insert access for complaints"
  on complaints for insert
  with check (true);

create policy "Allow public update access for complaints"
  on complaints for update
  using (true)
  with check (true);

create policy "Allow public read access for history"
  on status_history for select
  using (true);

create policy "Allow public insert access for history"
  on status_history for insert
  with check (true);

create policy "Allow public update access for history"
  on status_history for update
  using (true)
  with check (true);

create or replace function create_status_history_entry()
returns trigger as $$
begin
  insert into status_history (complaint_id, status, changed_by)
  values (new.id, new.status, 'system');
  return new;
end;
$$ language plpgsql;

drop trigger if exists complaints_status_history_trigger on complaints;
create trigger complaints_status_history_trigger
after insert on complaints
for each row execute procedure create_status_history_entry();

create storage bucket if not exists complaint-photos;
