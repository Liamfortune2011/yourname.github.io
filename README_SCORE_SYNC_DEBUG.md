Temporary score-sync debugging notes.

The score table is game_scores(account_code, game_id, score). Score writes are intentionally fire-and-forget so gameplay cannot block on Supabase.
