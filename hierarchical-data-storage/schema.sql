-- Enable LTREE extension
CREATE EXTENSION IF NOT EXISTS ltree;

-- Create tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL
);

-- Create categories table with LTREE path
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  code VARCHAR(50) NOT NULL,
  path LTREE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);

-- Create indexes for efficient querying
CREATE INDEX idx_path_gist ON categories USING GIST (path);
CREATE INDEX idx_path_btree ON categories USING BTREE (path);
CREATE INDEX idx_tenant_path ON categories (tenant_id, path);

-- Create table for localized category names
CREATE TABLE category_translations (
  category_id UUID REFERENCES categories(id),
  language_code VARCHAR(5),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  PRIMARY KEY (category_id, language_code)
);

-- Create table for products (to demonstrate category usage)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add LTREE path to products for efficient subtree queries
ALTER TABLE products ADD COLUMN category_path LTREE;

-- Create trigger to automatically update product category_path
CREATE OR REPLACE FUNCTION update_product_category_path()
RETURNS TRIGGER AS $$
BEGIN
  NEW.category_path = (SELECT path FROM categories WHERE id = NEW.category_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_category_path_trigger
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_product_category_path();

-- Create materialized view for category statistics
CREATE MATERIALIZED VIEW category_stats AS
SELECT 
  c.id,
  c.path,
  COUNT(DISTINCT p.id) as direct_products,
  COUNT(DISTINCT pd.id) as total_products
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
LEFT JOIN products pd ON pd.category_path <@ c.path
GROUP BY c.id, c.path;

-- Create index on materialized view for faster lookups
CREATE INDEX idx_category_stats ON category_stats (id);