-- Optimize index for common descendant queries
CREATE INDEX idx_categories_path_gist ON categories USING GIST (path);

-- Optimize index for exact path matches and ordering
CREATE INDEX idx_categories_path_btree ON categories USING BTREE (path);

-- Optimize for tenant-specific queries
CREATE INDEX idx_categories_tenant_path ON categories (tenant_id, path);

-- Optimize for product category lookups
CREATE INDEX idx_products_category_path ON products USING GIST (category_path);

-- Optimize for category translation lookups
CREATE INDEX idx_category_translations_lookup ON category_translations (category_id, language_code);

-- Create a partial index for active categories
CREATE INDEX idx_categories_active ON categories (id) WHERE active = true;

-- Create a covering index for common category queries
CREATE INDEX idx_categories_covering ON categories (id, tenant_id, code, path, active);

-- Optimize for range queries on product prices
CREATE INDEX idx_products_price ON products (price);

-- Create a composite index for product lookups by category and price
CREATE INDEX idx_products_category_price ON products (category_id, price);

-- Optimize for full text search on product names
CREATE INDEX idx_products_name_gin ON products USING GIN (to_tsvector('english', name));

-- Create a function to update product counts
CREATE OR REPLACE FUNCTION update_category_product_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE category_stats
        SET 
            direct_products = direct_products + 1,
            total_products = total_products + 1
        WHERE id = NEW.category_id;
        
        UPDATE category_stats
        SET total_products = total_products + 1
        WHERE id != NEW.category_id AND NEW.category_path <@ path;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE category_stats
        SET 
            direct_products = direct_products - 1,
            total_products = total_products - 1
        WHERE id = OLD.category_id;
        
        UPDATE category_stats
        SET total_products = total_products - 1
        WHERE id != OLD.category_id AND OLD.category_path <@ path;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update product counts
CREATE TRIGGER update_category_stats
AFTER INSERT OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION update_category_product_counts();

-- Create a function to update category paths when a category is moved
CREATE OR REPLACE FUNCTION update_category_paths()
RETURNS TRIGGER AS $$
DECLARE
    old_path ltree;
    new_path ltree;
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.path != NEW.path THEN
        old_path := OLD.path;
        new_path := NEW.path;
        
        -- Update all descendant category paths
        UPDATE categories
        SET path = new_path || subpath(path, nlevel(old_path))
        WHERE path <@ old_path;
        
        -- Update all affected product category paths
        UPDATE products
        SET category_path = new_path || subpath(category_path, nlevel(old_path))
        WHERE category_path <@ old_path;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update paths when a category is moved
CREATE TRIGGER update_category_paths
AFTER UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_category_paths();

-- Analyze tables to update statistics for the query planner
ANALYZE categories;
ANALYZE products;
ANALYZE category_translations;
ANALYZE category_stats;

-- Consider using VACUUM ANALYZE periodically to optimize tables and update statistics
-- VACUUM ANALYZE categories;
-- VACUUM ANALYZE products;
-- VACUUM ANALYZE category_translations;
-- VACUUM ANALYZE category_stats;