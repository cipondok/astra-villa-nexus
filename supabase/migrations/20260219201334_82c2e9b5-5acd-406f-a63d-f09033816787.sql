-- Refresh PostgREST schema cache so the RPC is callable from the frontend
NOTIFY pgrst, 'reload schema';