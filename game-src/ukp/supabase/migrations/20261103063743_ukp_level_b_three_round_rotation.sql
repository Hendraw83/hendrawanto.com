create or replace function public.ukp_recent_orders_v3(
  p_player_hash text,
  p_level text
)
returns jsonb
language sql
stable
security definer
set search_path = ukp
as $$
  with recent_sessions as (
    select s.state
    from ukp.sessions as s
    where s.player_hash = p_player_hash
      and s.level = upper(p_level)
      and jsonb_typeof(s.state -> 'order') = 'array'
      and jsonb_array_length(s.state -> 'order') = 100
    order by s.created_at desc, s.id desc
    limit case upper(p_level)
      when 'C' then 2
      when 'B' then 2
      when 'A' then 1
      else 0
    end
  ),
  recent_ids as (
    select distinct jsonb_array_elements_text(rs.state -> 'order') as id
    from recent_sessions as rs
  )
  select coalesce(jsonb_agg(id order by id), '[]'::jsonb)
  from recent_ids;
$$;

revoke all on function public.ukp_recent_orders_v3(text, text) from public;
revoke all on function public.ukp_recent_orders_v3(text, text) from anon;
revoke all on function public.ukp_recent_orders_v3(text, text) from authenticated;
grant execute on function public.ukp_recent_orders_v3(text, text) to service_role;
