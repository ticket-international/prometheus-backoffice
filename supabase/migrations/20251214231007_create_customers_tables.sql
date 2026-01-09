/*
  # Kundenverwaltungssystem

  1. Neue Tabellen
    - `customers`
      - `id` (uuid, primary key) - Eindeutige Kunden-ID
      - `customer_number` (text, unique) - Kundennummer (z.B. K-00001)
      - `first_name` (text) - Vorname
      - `last_name` (text) - Nachname
      - `email` (text, unique) - Email-Adresse
      - `phone` (text) - Telefonnummer
      - `mobile` (text) - Handynummer
      - `street` (text) - Straße und Hausnummer
      - `postal_code` (text) - Postleitzahl
      - `city` (text) - Ort
      - `created_at` (timestamptz) - Erstellungsdatum
      - `updated_at` (timestamptz) - Letzte Aktualisierung
    
    - `customer_cards`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key) - Referenz zum Kunden
      - `card_number` (text, unique) - Kartennummer
      - `card_type` (text) - Kartentyp (z.B. "Standard", "Premium", "VIP")
      - `points` (integer) - Punktestand
      - `issued_date` (timestamptz) - Ausstellungsdatum
      - `expiry_date` (timestamptz) - Ablaufdatum
      - `status` (text) - Status (aktiv, gesperrt, abgelaufen)
      - `created_at` (timestamptz)
    
    - `vouchers`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key) - Referenz zum Kunden
      - `voucher_code` (text, unique) - Gutscheincode
      - `amount` (decimal) - Gutscheinwert
      - `description` (text) - Beschreibung
      - `issued_date` (timestamptz) - Ausstellungsdatum
      - `expiry_date` (timestamptz) - Ablaufdatum
      - `used_date` (timestamptz, nullable) - Einlösedatum
      - `status` (text) - Status (gültig, verwendet, abgelaufen)
      - `created_at` (timestamptz)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key) - Referenz zum Kunden
      - `transaction_number` (text, unique) - Transaktionsnummer
      - `transaction_type` (text) - Typ (Kauf, Rückerstattung, Gutschein)
      - `amount` (decimal) - Betrag
      - `description` (text) - Beschreibung
      - `payment_method` (text) - Zahlungsmethode
      - `transaction_date` (timestamptz) - Transaktionsdatum
      - `created_at` (timestamptz)
  
  2. Sicherheit
    - RLS aktiviert für alle Tabellen
    - Policies für authentifizierte Benutzer zum Lesen und Schreiben
  
  3. Indizes
    - Index auf customer last_name für schnelle Suche
    - Index auf customer email für schnelle Suche
    - Index auf customer_number für schnelle Suche
*/

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_number text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text DEFAULT '',
  mobile text DEFAULT '',
  street text DEFAULT '',
  postal_code text DEFAULT '',
  city text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer Cards Table
CREATE TABLE IF NOT EXISTS customer_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  card_number text UNIQUE NOT NULL,
  card_type text DEFAULT 'Standard',
  points integer DEFAULT 0,
  issued_date timestamptz DEFAULT now(),
  expiry_date timestamptz,
  status text DEFAULT 'aktiv',
  created_at timestamptz DEFAULT now()
);

-- Vouchers Table
CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  voucher_code text UNIQUE NOT NULL,
  amount decimal(10, 2) NOT NULL,
  description text DEFAULT '',
  issued_date timestamptz DEFAULT now(),
  expiry_date timestamptz,
  used_date timestamptz,
  status text DEFAULT 'gültig',
  created_at timestamptz DEFAULT now()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  transaction_number text UNIQUE NOT NULL,
  transaction_type text NOT NULL,
  amount decimal(10, 2) NOT NULL,
  description text DEFAULT '',
  payment_method text DEFAULT '',
  transaction_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Indexes for fast search
CREATE INDEX IF NOT EXISTS idx_customers_last_name ON customers(last_name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_customer_number ON customers(customer_number);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_cards_customer_id ON customer_cards(customer_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_customer_id ON vouchers(customer_id);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies for customers
CREATE POLICY "Authenticated users can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete customers"
  ON customers FOR DELETE
  TO authenticated
  USING (true);

-- Policies for customer_cards
CREATE POLICY "Authenticated users can view customer cards"
  ON customer_cards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert customer cards"
  ON customer_cards FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customer cards"
  ON customer_cards FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete customer cards"
  ON customer_cards FOR DELETE
  TO authenticated
  USING (true);

-- Policies for vouchers
CREATE POLICY "Authenticated users can view vouchers"
  ON vouchers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert vouchers"
  ON vouchers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update vouchers"
  ON vouchers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete vouchers"
  ON vouchers FOR DELETE
  TO authenticated
  USING (true);

-- Policies for transactions
CREATE POLICY "Authenticated users can view transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for customers table
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
