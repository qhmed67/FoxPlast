-- Admin console: one audited entry point for status changes.
--
-- The browser talks to Postgres with the user's Supabase Auth JWT. RLS already
-- lets an admin UPDATE orders, but order_events is append-only with no insert
-- policy (writes normally come from Edge Functions), so a direct update would
-- lose the audit trail. This SECURITY DEFINER wrapper checks is_admin(), stamps
-- the admin's name as the actor, and delegates to the existing state machine.

create or replace function public.admin_set_order_status(
  p_code text,
  p_to public.order_status,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_name text;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  select coalesce(nullif(name, ''), 'admin')
    into admin_name
    from public.admins
   where user_id = auth.uid();

  return public.apply_order_transition(
    p_code,
    p_to,
    coalesce(admin_name, 'admin'),
    nullif(trim(p_note), '')
  );
end;
$$;

revoke all on function public.admin_set_order_status(text, public.order_status, text) from public;
grant execute on function public.admin_set_order_status(text, public.order_status, text) to authenticated;
