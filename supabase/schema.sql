-- =============================================================================
-- Savage Lifestyle Barber Shop — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh project.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Enum types
-- ---------------------------------------------------------------------------
create type user_role as enum ('customer', 'admin', 'barber');
create type booking_status as enum ('held', 'confirmed', 'completed', 'cancelled');
create type payment_option as enum ('pay_online', 'pay_in_person');
create type payment_status as enum ('pending', 'success', 'failed', 'abandoned');

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------

-- Extends Supabase's auth.users with shop-specific profile data.
-- phone_number is nullable because Google sign-in doesn't provide one —
-- it's collected on the booking checkout form and saved back here.
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    phone_number text,
    role user_role default 'customer'::user_role not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cut styles, pricing, and durations. Populated via the initial CSV import
-- and kept in sync through the Admin Dashboard's CSV re-upload tool.
create table public.services (
    id serial primary key,
    service_id_csv text unique,
    service_name text not null,
    duration_mins integer not null,
    price decimal(10, 2) not null,
    description text,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Default weekly opening hours, one row per day of week (0 = Sunday).
create table public.operating_hours (
    id serial primary key,
    day_of_week integer not null unique,
    open_time time not null,
    close_time time not null,
    is_closed boolean default false not null
);

-- One-off overrides: a specific date's custom hours, or a full day off.
create table public.barber_schedules (
    id serial primary key,
    barber_id uuid references public.profiles(id) on delete cascade,
    override_date date not null,
    start_time time,
    end_time time,
    is_off boolean default false not null,
    reason text
);

-- Core booking lifecycle table, including the 10-minute temporary hold.
create table public.bookings (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid references public.profiles(id) on delete set null,
    guest_name text,
    guest_phone text,
    service_id integer references public.services(id) on delete restrict,
    appointment_timestamp timestamp with time zone not null,
    buffer_end_timestamp timestamp with time zone not null,
    status booking_status default 'held'::booking_status not null,
    payment_method payment_option not null,
    held_until timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Paystack transaction records, one per online-payment booking.
create table public.payments (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid references public.bookings(id) on delete cascade,
    paystack_reference text unique not null,
    amount decimal(10, 2) not null,
    currency text default 'GHS' not null,
    status payment_status default 'pending'::payment_status not null,
    gateway_response jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------------
-- 3. Auto-create a profile row whenever a new auth user signs up (Google or
--    email/password). Keeps `profiles` in sync with `auth.users` with zero
--    app-side bookkeeping.
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, full_name)
    values (new.id, new.raw_user_meta_data ->> 'full_name')
    on conflict (id) do nothing;
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 4. Slot locking: 10-minute temporary hold with conflict + buffer checks
-- ---------------------------------------------------------------------------
create function public.hold_booking_slot(
    p_customer_id uuid,
    p_service_id integer,
    p_appointment_time timestamp with time zone,
    p_payment_method payment_option,
    p_guest_name text default null,
    p_guest_phone text default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
    v_duration integer;
    v_buffer_end timestamp with time zone;
    v_new_booking_id uuid;
begin
    select duration_mins into v_duration from public.services where id = p_service_id;

    if v_duration is null then
        raise exception 'Invalid service ID';
    end if;

    -- Service duration + mandatory 15-minute cleanup buffer
    v_buffer_end := p_appointment_time + make_interval(mins := v_duration + 15);

    -- Reject if it overlaps a confirmed booking or an unexpired hold
    if exists (
        select 1 from public.bookings
        where status in ('confirmed', 'held')
          and (held_until is null or held_until > now())
          and appointment_timestamp < v_buffer_end
          and buffer_end_timestamp > p_appointment_time
    ) then
        raise exception 'Time slot is currently locked or booked.';
    end if;

    insert into public.bookings (
        customer_id, guest_name, guest_phone, service_id,
        appointment_timestamp, buffer_end_timestamp,
        status, payment_method, held_until
    ) values (
        p_customer_id, p_guest_name, p_guest_phone, p_service_id,
        p_appointment_time, v_buffer_end,
        'held', p_payment_method, now() + interval '10 minutes'
    )
    returning id into v_new_booking_id;

    return v_new_booking_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Expired hold cleanup
--    Run this periodically. If the pg_cron extension is enabled on your
--    Supabase project, uncomment the schedule below to sweep every minute.
-- ---------------------------------------------------------------------------
create function public.release_expired_holds()
returns void
language sql
as $$
    update public.bookings
    set status = 'cancelled'
    where status = 'held'
      and held_until < now();
$$;

-- select cron.schedule('release-expired-holds', '* * * * *', 'select public.release_expired_holds();');

-- ---------------------------------------------------------------------------
-- 6. Indexes
-- ---------------------------------------------------------------------------
create index idx_bookings_active_slots on public.bookings (appointment_timestamp, buffer_end_timestamp)
    where status in ('confirmed', 'held');

create index idx_payments_reference on public.payments (paystack_reference);

create index idx_services_active on public.services (is_active) where is_active = true;

create index idx_bookings_customer on public.bookings (customer_id);

-- ---------------------------------------------------------------------------
-- 7. Row-Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.services enable row level security;
alter table public.operating_hours enable row level security;
alter table public.barber_schedules enable row level security;

-- Admin check as a SECURITY DEFINER function rather than an inline subquery.
-- A policy ON public.profiles that queries public.profiles directly causes
-- Postgres to recurse into the same policy while evaluating it (a 500, not
-- a permissions error). Routing the check through a SECURITY DEFINER
-- function bypasses RLS for this one lookup and avoids the recursion.
create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1 from public.profiles where id = auth.uid() and role = 'admin'
    );
$$;

-- Public catalog data: anyone can read active services and shop hours.
create policy "Public can read services" on public.services
    for select using (true);

create policy "Public can read operating hours" on public.operating_hours
    for select using (true);

create policy "Public can read schedule overrides" on public.barber_schedules
    for select using (true);

create policy "Admins manage services" on public.services
    for all using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage operating hours" on public.operating_hours
    for all using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage schedule overrides" on public.barber_schedules
    for all using (public.is_admin()) with check (public.is_admin());

-- Profiles: users read/update their own profile; admins read all.
create policy "Users read own profile" on public.profiles
    for select using (auth.uid() = id);

create policy "Admins read all profiles" on public.profiles
    for select using (public.is_admin());

create policy "Users update own profile" on public.profiles
    for update using (auth.uid() = id);

-- Bookings: customers see their own bookings; admins see and manage all.
-- (Writes from the public booking flow go through the service-role API
--  routes, which bypass RLS by design — see src/lib/supabase/admin.ts.)
create policy "Customers view own bookings" on public.bookings
    for select using (auth.uid() = customer_id);

create policy "Admins manage all bookings" on public.bookings
    for all using (public.is_admin()) with check (public.is_admin());

-- Payments: admins only (contains financial transaction data).
create policy "Admins manage payments" on public.payments
    for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 8. Seed the operating hours row for every day (edit via Admin > Hours,
--    or overwrite by uploading the shop's CSV).
-- ---------------------------------------------------------------------------
insert into public.operating_hours (day_of_week, open_time, close_time, is_closed) values
    (0, '10:00', '17:00', false),
    (1, '09:00', '19:00', false),
    (2, '09:00', '19:00', false),
    (3, '09:00', '19:00', false),
    (4, '09:00', '19:00', false),
    (5, '09:00', '20:00', false),
    (6, '09:00', '20:00', false)
on conflict (day_of_week) do nothing;

-- ---------------------------------------------------------------------------
-- 9. Creating your first admin user
--    1. Sign the user up normally (Google sign-in on the site, or via the
--       Supabase Auth dashboard with email/password).
--    2. Then run:
--       update public.profiles set role = 'admin' where id = '<their-auth-uid>';
-- ---------------------------------------------------------------------------
