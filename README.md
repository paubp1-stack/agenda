# Agenda

Agenda personal: calendari, horari setmanal, tasques, planificació diària i recordatoris.

- App estàtica (HTML + JS) publicada amb GitHub Pages.
- Dades i comptes a Supabase (projecte `agenda`), protegides amb Row Level Security: cada usuari només veu les seves dades.
- Instal·lable com a app (PWA) i amb notificacions push enviades des del servidor (Edge Function `send-push` + `pg_cron`).
