-- Client-supplied payment details (docs/02 §5). Idempotent so it can be re-run
-- on the live project and on a fresh local database.
insert into app_config (key, value, is_public) values
  ('whatsapp_number', '"201278954638"'::jsonb, true),
  (
    'payment_methods',
    '[{"label":"InstaPay","number":"ahmedyousseftaha@instapay","note":"https://ipn.eg/S/ahmedyousseftaha/instapay/0xdJfL"}]'::jsonb,
    true
  )
on conflict (key) do update
set value = excluded.value,
    is_public = excluded.is_public;
