/*
  # Erweitere Kundenverwaltung um Tickets und Account-Typen

  1. Änderungen an bestehenden Tabellen
    - `customers`
      - `account_type` (text) - Kontotyp (regular, guest)
  
  2. Neue Tabellen
    - `tickets`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key) - Referenz zum Kunden
      - `ticket_number` (text, unique) - Ticketnummer
      - `movie_title` (text) - Filmtitel
      - `show_date` (timestamptz) - Vorstellungsdatum
      - `seat_number` (text) - Sitznummer
      - `price` (decimal) - Preis
      - `purchase_date` (timestamptz) - Kaufdatum
      - `status` (text) - Status (gültig, verwendet, storniert)
      - `created_at` (timestamptz)
  
  3. Sicherheit
    - RLS aktiviert für tickets Tabelle
    - Policies für authentifizierte Benutzer
  
  4. Indizes
    - Index auf customer_id für schnelle Abfragen
    - Index auf purchase_date für Statistiken
*/

-- Add account_type to customers table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'account_type'
  ) THEN
    ALTER TABLE customers ADD COLUMN account_type text DEFAULT 'regular';
  END IF;
END $$;

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  ticket_number text UNIQUE NOT NULL,
  movie_title text NOT NULL,
  show_date timestamptz NOT NULL,
  seat_number text DEFAULT '',
  price decimal(10, 2) NOT NULL,
  purchase_date timestamptz DEFAULT now(),
  status text DEFAULT 'gültig',
  created_at timestamptz DEFAULT now()
);

-- Indexes for tickets
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_purchase_date ON tickets(purchase_date);
CREATE INDEX IF NOT EXISTS idx_tickets_show_date ON tickets(show_date);

-- Enable RLS for tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policies for tickets
CREATE POLICY "Authenticated users can view tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert tickets"
  ON tickets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tickets"
  ON tickets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tickets"
  ON tickets FOR DELETE
  TO authenticated
  USING (true);
