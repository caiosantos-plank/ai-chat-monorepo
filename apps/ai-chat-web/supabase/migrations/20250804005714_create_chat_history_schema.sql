create table if not exists chat_history (
    id uuid primary key references chat (id) on delete cascade on update cascade,
    messages jsonb,
    summary text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
