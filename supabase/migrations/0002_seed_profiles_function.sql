-- Función que crea los 3 perfiles por defecto (Gabriel, Papá, Mamá) para el usuario actual,
-- si todavía no tiene ninguno. Se invoca desde la app la primera vez que el usuario inicia
-- sesión (ver lib/supabase/ensure-profiles.ts).

create or replace function ensure_default_profiles()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where user_id = auth.uid()) then
    insert into profiles (user_id, name) values
      (auth.uid(), 'Gabriel'),
      (auth.uid(), 'Papá'),
      (auth.uid(), 'Mamá');
  end if;
end;
$$;

grant execute on function ensure_default_profiles() to authenticated;
