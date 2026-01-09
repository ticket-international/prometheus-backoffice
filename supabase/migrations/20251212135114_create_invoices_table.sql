/*
  # Create invoices table for billing management

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key) - Unique invoice identifier
      - `year` (integer) - Year of the invoice
      - `month` (integer) - Month of the invoice (1-12)
      - `period_from` (date) - Start date of billing period
      - `period_to` (date) - End date of billing period
      - `gross_amount` (decimal) - Total gross amount
      - `customer_share` (decimal) - Customer's share amount
      - `payout_amount` (decimal) - Final payout amount
      - `version` (integer) - Version number of the invoice
      - `is_active` (boolean) - Whether this is the active version
      - `created_at` (timestamptz) - When this version was created
      - `updated_at` (timestamptz) - Last update timestamp
      - `notes` (text) - Optional notes

  2. Security
    - Enable RLS on `invoices` table
    - Add policy for authenticated users to read invoices
*/

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  period_from date NOT NULL,
  period_to date NOT NULL,
  gross_amount decimal(10, 2) NOT NULL DEFAULT 0,
  customer_share decimal(10, 2) NOT NULL DEFAULT 0,
  payout_amount decimal(10, 2) NOT NULL DEFAULT 0,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  notes text DEFAULT ''
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_invoices_year_month ON invoices(year, month);
CREATE INDEX IF NOT EXISTS idx_invoices_is_active ON invoices(is_active);
CREATE INDEX IF NOT EXISTS idx_invoices_version ON invoices(year, month, version);