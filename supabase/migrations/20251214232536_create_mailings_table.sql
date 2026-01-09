/*
  # Erstelle Mailings Tabelle für E-Mail-Kampagnen

  1. Neue Tabellen
    - `mailings`
      - `id` (uuid, primary key)
      - `name` (text) - Interner Name der Kampagne
      - `subject` (text) - E-Mail Betreff
      - `content` (text) - E-Mail HTML-Inhalt
      - `customer_filter` (text) - Filter für Empfänger (all, regular, guest, active_30d, inactive_90d)
      - `status` (text) - Status (draft, scheduled, sent)
      - `campaign` (text, optional) - Kampagnenname
      - `scheduled_date` (timestamptz, optional) - Geplantes Versanddatum
      - `scheduled_time` (text, optional) - Geplante Versandzeit
      - `sent_date` (timestamptz, optional) - Tatsächliches Versanddatum
      - `recipients` (integer) - Anzahl Empfänger
      - `opens` (integer) - Anzahl Öffnungen
      - `clicks` (integer) - Anzahl Klicks
      - `bounces` (integer) - Anzahl Bounces
      - `unsubscribes` (integer) - Anzahl Abmeldungen
      - `is_archived` (boolean) - Archiviert
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Sicherheit
    - RLS aktiviert für mailings Tabelle
    - Policies für authentifizierte Benutzer
  
  3. Indizes
    - Index auf status für Filterung
    - Index auf scheduled_date für zeitbasierte Abfragen
*/

CREATE TABLE IF NOT EXISTS mailings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  customer_filter text NOT NULL DEFAULT 'all',
  status text NOT NULL DEFAULT 'draft',
  campaign text DEFAULT '',
  scheduled_date timestamptz,
  scheduled_time text,
  sent_date timestamptz,
  recipients integer DEFAULT 0,
  opens integer DEFAULT 0,
  clicks integer DEFAULT 0,
  bounces integer DEFAULT 0,
  unsubscribes integer DEFAULT 0,
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mailings_status ON mailings(status);
CREATE INDEX IF NOT EXISTS idx_mailings_scheduled_date ON mailings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_mailings_is_archived ON mailings(is_archived);

ALTER TABLE mailings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view mailings"
  ON mailings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert mailings"
  ON mailings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update mailings"
  ON mailings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete mailings"
  ON mailings FOR DELETE
  TO authenticated
  USING (true);
