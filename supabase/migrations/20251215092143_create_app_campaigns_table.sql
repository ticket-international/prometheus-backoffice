/*
  # Erstelle App-Kampagnen Tabellen für MeinKino App

  1. Neue Tabellen
    - `app_recurring_campaigns`
      - `id` (uuid, primary key)
      - `campaign_type` (text) - Typ der Kampagne (watch_list_starts, new_films_favorite_cinemas, ticket_reminder, program_changes, article_sale_reminder)
      - `name` (text) - Name der Kampagne
      - `description` (text) - Beschreibung der Kampagne
      - `is_enabled` (boolean) - Ob die Kampagne aktiviert ist
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `app_onetime_campaigns`
      - `id` (uuid, primary key)
      - `name` (text) - Name der Kampagne
      - `description` (text) - Beschreibung der Kampagne
      - `target_audience` (text) - Zielgruppe
      - `scheduled_date` (timestamptz, optional) - Geplantes Sendedatum
      - `status` (text) - Status (draft, scheduled, sent)
      - `sent_date` (timestamptz, optional) - Versanddatum
      - `recipient_count` (integer) - Anzahl Empfänger
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Sicherheit
    - RLS aktiviert für beide Tabellen
    - Policies für authentifizierte Benutzer
  
  3. Initiale Daten
    - Vordefinierte wiederkehrende Kampagnen werden eingefügt
*/

CREATE TABLE IF NOT EXISTS app_recurring_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_type text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  is_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_onetime_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  target_audience text NOT NULL DEFAULT 'all',
  scheduled_date timestamptz,
  status text NOT NULL DEFAULT 'draft',
  sent_date timestamptz,
  recipient_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_recurring_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_onetime_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view recurring campaigns"
  ON app_recurring_campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update recurring campaigns"
  ON app_recurring_campaigns FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view onetime campaigns"
  ON app_onetime_campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert onetime campaigns"
  ON app_onetime_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update onetime campaigns"
  ON app_onetime_campaigns FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete onetime campaigns"
  ON app_onetime_campaigns FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO app_recurring_campaigns (campaign_type, name, description, is_enabled) VALUES
  ('watch_list_starts', 'Watch List Starts', 'Benachrichtigung wenn ein Film aus der Watchlist startet', false),
  ('new_films_favorite_cinemas', 'Neue Filme in Lieblingskinos', 'Benachrichtigung über neue Filme in favorisierten Kinos', false),
  ('ticket_reminder', 'Ticket Erinnerung', 'Erinnerung an bevorstehende Tickets', true),
  ('program_changes', 'Programmänderungen', 'Benachrichtigung bei Änderungen im Programm', false),
  ('article_sale_reminder', 'Artikelverkauf Erinnerung', 'Erinnerung an Artikel im Warenkorb', false)
ON CONFLICT (campaign_type) DO NOTHING;
