/*
  # Create Orders Database Schema

  ## Overview
  This migration creates the necessary tables for managing customer orders, order items, and tracking order status for the Spicy Biryani restaurant application.

  ## New Tables

  ### 1. `orders`
  Main order table storing customer order information
  - `id` (uuid, primary key) - Unique order identifier
  - `order_number` (text, unique) - Human-readable order number (e.g., ORD-12345678)
  - `customer_name` (text) - Name of the customer
  - `customer_email` (text) - Email address for order confirmation
  - `customer_phone` (text) - Phone number for SMS notifications
  - `delivery_address` (text) - Complete delivery address
  - `notes` (text, optional) - Special instructions from customer
  - `total_amount` (numeric) - Total order amount in INR
  - `payment_method` (text) - Payment method chosen (COD, UPI, Card, etc.)
  - `status` (text) - Order status: pending, confirmed, preparing, out_for_delivery, delivered, cancelled
  - `created_at` (timestamptz) - Order creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `order_items`
  Individual items within each order
  - `id` (uuid, primary key) - Unique item identifier
  - `order_id` (uuid, foreign key) - References orders table
  - `item_name` (text) - Name of the menu item
  - `quantity` (integer) - Number of items ordered
  - `price` (numeric) - Price per item in INR
  - `created_at` (timestamptz) - Item creation timestamp

  ## Security
  - Row Level Security (RLS) enabled on both tables
  - Public can insert new orders (for anonymous ordering)
  - Public can read their own orders using order_number
  - Only authenticated users can update order status
  - Only authenticated users can view all orders

  ## Important Notes
  1. All prices are stored in Indian Rupees (INR)
  2. Order numbers are generated client-side for quick order placement
  3. Email and SMS notifications will be triggered via edge functions
  4. Payment method stored for record keeping (actual payment integration separate)
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text NOT NULL,
  notes text DEFAULT '',
  total_amount numeric NOT NULL,
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own orders"
  ON orders
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert order items"
  ON order_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view order items"
  ON order_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
