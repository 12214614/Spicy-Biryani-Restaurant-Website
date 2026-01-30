/*
  # Add Nutrition Data to Menu Items

  ## Overview
  This migration adds a `menu_items` table with nutrition information for each food item. This enables customers to view nutrition details and get AI-powered health suggestions.

  ## New Tables
  ### `menu_items`
  - `id` (uuid, primary key) - Unique item identifier
  - `name` (text) - Item name
  - `price` (numeric) - Price in INR
  - `image_url` (text) - Image URL
  - `category` (text) - Category (biryani, curry, bread, etc.)
  - `description` (text) - Item description
  - `calories` (integer) - Calories per serving
  - `protein` (numeric) - Protein in grams
  - `carbs` (numeric) - Carbohydrates in grams
  - `fat` (numeric) - Fat in grams
  - `fiber` (numeric) - Dietary fiber in grams
  - `is_vegetarian` (boolean) - Vegetarian flag
  - `is_vegan` (boolean) - Vegan flag
  - `is_gluten_free` (boolean) - Gluten-free flag
  - `spice_level` (integer) - Spice level 1-5
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Row Level Security (RLS) enabled
  - Anyone can read menu items (public data)
  - Only authenticated users can insert/update/delete
*/

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  image_url text,
  category text NOT NULL,
  description text,
  calories integer,
  protein numeric DEFAULT 0,
  carbs numeric DEFAULT 0,
  fat numeric DEFAULT 0,
  fiber numeric DEFAULT 0,
  is_vegetarian boolean DEFAULT false,
  is_vegan boolean DEFAULT false,
  is_gluten_free boolean DEFAULT false,
  spice_level integer DEFAULT 3,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read menu items"
  ON menu_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage menu items"
  ON menu_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update menu items"
  ON menu_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete menu items"
  ON menu_items
  FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO menu_items (name, price, category, description, calories, protein, carbs, fat, fiber, is_vegetarian, is_vegan, spice_level) VALUES
('Chicken Biryani', 250, 'biryani', 'Fragrant basmati rice cooked with tender chicken', 450, 28, 52, 12, 2, false, false, 3),
('Mutton Biryani', 300, 'biryani', 'Slow-cooked biryani with tender mutton pieces', 520, 32, 50, 18, 2, false, false, 4),
('Paneer Biryani', 280, 'biryani', 'Aromatic rice with cottage cheese and spices', 420, 18, 54, 14, 3, true, false, 3),
('Butter Chicken', 220, 'curry', 'Creamy tomato-based curry with chicken', 380, 25, 24, 20, 1, false, false, 2),
('Chole Bhature', 120, 'bread', 'Fried bread with spiced chickpea curry', 580, 16, 72, 24, 8, true, true, 3),
('Garlic Naan', 60, 'bread', 'Soft flatbread with garlic and butter', 280, 8, 42, 8, 2, true, false, 1),
('Raita', 40, 'side', 'Yogurt with cucumber and spices', 80, 6, 8, 3, 1, true, false, 1),
('Mixed Vegetable Curry', 150, 'curry', 'Assorted vegetables in aromatic gravy', 200, 8, 28, 7, 6, true, true, 2),
('Tandoori Chicken', 180, 'grill', 'Marinated and grilled chicken', 320, 42, 8, 14, 0, false, false, 3),
('Vegetable Biryani', 200, 'biryani', 'Rice with mixed vegetables and herbs', 380, 12, 56, 10, 5, true, true, 2);