-- 1. Create the missing financial records table
CREATE TABLE IF NOT EXISTS financial_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  type text NOT NULL, -- 'income' or 'expense'
  amount numeric NOT NULL,
  description text NOT NULL,
  category text -- 'booking_studio_cut', 'inventory_restock', 'other'
);

-- 2. Add tracking for agreed price and sinal (deposit) to the bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS agreed_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS sinal_amount numeric DEFAULT 0;

-- 3. Enable RLS for financial_records
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- 4. Setup Admin access for authenticated users on financial_records
CREATE POLICY "Allow full access to authenticated users" ON financial_records FOR ALL TO authenticated USING (true);

-- 5. Add unit support and numeric precision to inventory
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS unit text DEFAULT 'un';

ALTER TABLE inventory 
ALTER COLUMN quantity TYPE numeric USING quantity::numeric,
ALTER COLUMN min_quantity TYPE numeric USING min_quantity::numeric;

-- 6. Add columns for completed tattoos/autorais
ALTER TABLE flashes 
ADD COLUMN IF NOT EXISTS img_fresh text,
ADD COLUMN IF NOT EXISTS img_healed text,
ADD COLUMN IF NOT EXISTS healed_time text,
ADD COLUMN IF NOT EXISTS done_date text;

-- 7. Add promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  description text,
  discount_percentage numeric DEFAULT 0,
  active boolean DEFAULT false
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read active promotions" ON promotions FOR SELECT TO anon USING (active = true);
CREATE POLICY "Allow full access to authenticated users on promotions" ON promotions FOR ALL TO authenticated USING (true);
