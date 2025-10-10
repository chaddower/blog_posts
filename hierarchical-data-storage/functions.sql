-- Function to get category tree with localized names
CREATE OR REPLACE FUNCTION get_category_tree(
  p_tenant_id UUID,
  p_language VARCHAR(5) DEFAULT 'en_US'
)
RETURNS TABLE(id UUID, name VARCHAR, path LTREE, level INT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    COALESCE(ct.name, c.code) as name,
    c.path,
    nlevel(c.path) - 1 as level
  FROM categories c
  LEFT JOIN category_translations ct 
    ON c.id = ct.category_id 
    AND ct.language_code = p_language
  WHERE c.tenant_id = p_tenant_id 
    AND c.active = true
  ORDER BY c.path;
END;
$$ LANGUAGE plpgsql;

-- Function to safely move a category
CREATE OR REPLACE FUNCTION move_category(
  p_category_id UUID,
  p_new_parent_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_old_path LTREE;
  v_new_parent_path LTREE;
  v_new_path LTREE;
BEGIN
  -- Get current path
  SELECT path INTO v_old_path 
  FROM categories WHERE id = p_category_id;
  
  -- Get new parent path
  SELECT path INTO v_new_parent_path 
  FROM categories WHERE id = p_new_parent_id;
  
  -- Check for circular reference
  IF v_new_parent_path <@ v_old_path THEN
    RAISE EXCEPTION 'Cannot move category to its own descendant';
  END IF;
  
  -- Perform the move
  v_new_path := v_new_parent_path || subpath(v_old_path, -1, 1);
  
  UPDATE categories 
  SET 
    path = v_new_path || subpath(path, nlevel(v_old_path)),
    updated_at = NOW()
  WHERE path <@ v_old_path;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get all ancestors of a category
CREATE OR REPLACE FUNCTION get_category_ancestors(p_category_id UUID)
RETURNS TABLE(id UUID, code VARCHAR, path LTREE) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE ancestors AS (
    SELECT c.id, c.code, c.path
    FROM categories c
    WHERE c.id = p_category_id
    
    UNION ALL
    
    SELECT c.id, c.code, c.path
    FROM categories c
    JOIN ancestors a ON c.path @> a.path AND c.id != a.id
  )
  SELECT * FROM ancestors ORDER BY path;
END;
$$ LANGUAGE plpgsql;

-- Function to get all descendants of a category
CREATE OR REPLACE FUNCTION get_category_descendants(p_category_id UUID)
RETURNS TABLE(id UUID, code VARCHAR, path LTREE, level INT) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.code, c.path, nlevel(c.path) - nlevel(parent.path) as level
  FROM categories c
  JOIN categories parent ON c.path <@ parent.path
  WHERE parent.id = p_category_id AND c.id != p_category_id
  ORDER BY c.path;
END;
$$ LANGUAGE plpgsql;

-- Function to add a new category
CREATE OR REPLACE FUNCTION add_category(
  p_tenant_id UUID,
  p_parent_id UUID,
  p_code VARCHAR,
  p_name VARCHAR,
  p_language VARCHAR(5) DEFAULT 'en_US'
)
RETURNS UUID AS $$
DECLARE
  v_parent_path LTREE;
  v_new_path LTREE;
  v_new_id UUID;
BEGIN
  -- Get parent path
  SELECT path INTO v_parent_path
  FROM categories
  WHERE id = p_parent_id AND tenant_id = p_tenant_id;

  -- Create new path
  v_new_path := v_parent_path || p_code::text;

  -- Insert new category
  INSERT INTO categories (tenant_id, code, path)
  VALUES (p_tenant_id, p_code, v_new_path)
  RETURNING id INTO v_new_id;

  -- Insert translation
  INSERT INTO category_translations (category_id, language_code, name)
  VALUES (v_new_id, p_language, p_name);

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;