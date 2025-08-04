create table if not exists chat (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    user_id uuid not null references auth.users (id) on delete cascade on update cascade,
    created_at timestamp with time zone default now(),
    updated_at timestamp
);

