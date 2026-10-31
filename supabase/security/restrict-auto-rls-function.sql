-- Keep the automatic RLS event trigger, but do not expose execution to API roles.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
