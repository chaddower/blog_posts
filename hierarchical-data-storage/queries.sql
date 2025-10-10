-- Get the full category tree for a tenant in English
SELECT * FROM get_category_tree('11111111-1111-1111-1111-111111111111', 'en_US');

-- Get the full category tree for a tenant in Spanish
SELECT * FROM get_category_tree('11111111-1111-1111-1111-111111111111', 'es_ES');

-- Get all ancestors of a specific category (e.g., 'laptops')
SELECT * FROM get_category_ancestors('55555555-5555-5555-5555-555555555555');

-- Get all descendants of a specific category (e.g., 'electronics')
SELECT * FROM get_category_descendants('22222222-2222-2222-2222-222222222222');

-- Find all leaf categories (categories with no children)
SELECT c.id, c.code, c.path
FROM categories c
LEFT JOIN categories child ON child.path <@ c.path AND child.id != c.id
WHERE child.id IS NULL;

-- Find categories at a specific level (e.g., level 2)
SELECT id, code, path
FROM categories
WHERE nlevel(path) = 2;

-- Count products in each category, including subcategories
SELECT 
    c.id,
    c.path,
    (SELECT name FROM category_translations WHERE category_id = c.id AND language_code = 'en_US') AS name,
    COUNT(p.id) AS product_count
FROM 
    categories c
LEFT JOIN 
    products p ON p.category_path <@ c.path
GROUP BY 
    c.id, c.path
ORDER BY 
    c.path;

-- Find categories with more than X products (direct and indirect)
SELECT 
    c.id,
    c.path,
    (SELECT name FROM category_translations WHERE category_id = c.id AND language_code = 'en_US') AS name,
    COUNT(p.id) AS product_count
FROM 
    categories c
LEFT JOIN 
    products p ON p.category_path <@ c.path
GROUP BY 
    c.id, c.path
HAVING 
    COUNT(p.id) > 1
ORDER BY 
    product_count DESC;

-- Find the deepest categories
SELECT 
    c.id,
    c.path,
    (SELECT name FROM category_translations WHERE category_id = c.id AND language_code = 'en_US') AS name,
    nlevel(c.path) AS depth
FROM 
    categories c
WHERE 
    nlevel(c.path) = (SELECT MAX(nlevel(path)) FROM categories);

-- Find sibling categories
SELECT 
    c.id,
    c.path,
    (SELECT name FROM category_translations WHERE category_id = c.id AND language_code = 'en_US') AS name
FROM 
    categories c
WHERE 
    c.path ~ (SELECT subpath(path, 0, -1) || '*{1}' FROM categories WHERE id = '55555555-5555-5555-5555-555555555555')
    AND c.id != '55555555-5555-5555-5555-555555555555';

-- Breadcrumb query for a specific category
WITH RECURSIVE breadcrumb AS (
    SELECT id, path, code, 1 AS level
    FROM categories
    WHERE id = '55555555-5555-5555-5555-555555555555'
    
    UNION ALL
    
    SELECT c.id, c.path, c.code, b.level + 1
    FROM categories c
    JOIN breadcrumb b ON c.path @> b.path AND c.path != b.path
)
SELECT 
    b.id,
    b.code,
    (SELECT name FROM category_translations WHERE category_id = b.id AND language_code = 'en_US') AS name
FROM 
    breadcrumb b
ORDER BY 
    b.path;

-- Get category statistics
SELECT 
    c.id,
    c.path,
    (SELECT name FROM category_translations WHERE category_id = c.id AND language_code = 'en_US') AS name,
    s.direct_products,
    s.total_products
FROM 
    categories c
JOIN 
    category_stats s ON c.id = s.id
ORDER BY 
    c.path;