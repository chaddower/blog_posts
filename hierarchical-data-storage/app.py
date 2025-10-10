import psycopg2
from psycopg2.extras import RealDictCursor

# Database connection parameters
DB_PARAMS = {
    "dbname": "your_database_name",
    "user": "your_username",
    "password": "your_password",
    "host": "localhost",
    "port": "5432"
}

def connect_to_db():
    """Establishes a connection to the database."""
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        return conn
    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL", error)
        return None

def get_category_tree(tenant_id, language='en_US'):
    """Retrieves the full category tree for a given tenant."""
    conn = connect_to_db()
    if not conn:
        return []

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT * FROM get_category_tree(%s, %s)
            """, (tenant_id, language))
            return cur.fetchall()
    finally:
        conn.close()

def add_category(tenant_id, parent_id, code, name, language='en_US'):
    """Adds a new category to the hierarchy."""
    conn = connect_to_db()
    if not conn:
        return None

    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT add_category(%s, %s, %s, %s, %s)
            """, (tenant_id, parent_id, code, name, language))
            new_id = cur.fetchone()[0]
            conn.commit()
            return new_id
    finally:
        conn.close()

def move_category(category_id, new_parent_id):
    """Moves a category to a new parent."""
    conn = connect_to_db()
    if not conn:
        return False

    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT move_category(%s, %s)
            """, (category_id, new_parent_id))
            success = cur.fetchone()[0]
            conn.commit()
            return success
    finally:
        conn.close()

def get_category_stats():
    """Retrieves category statistics."""
    conn = connect_to_db()
    if not conn:
        return []

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
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
                    c.path
            """)
            return cur.fetchall()
    finally:
        conn.close()

def main():
    # Example usage
    tenant_id = '11111111-1111-1111-1111-111111111111'  # Sample Store

    print("Category Tree:")
    tree = get_category_tree(tenant_id)
    for category in tree:
        print(f"{'  ' * category['level']}{category['name']} ({category['path']})")

    print("\nAdding a new category:")
    new_category_id = add_category(tenant_id, '22222222-2222-2222-2222-222222222222', 'tablets', 'Tablets')
    print(f"New category ID: {new_category_id}")

    print("\nMoving a category:")
    success = move_category('55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666')
    print(f"Move successful: {success}")

    print("\nCategory Statistics:")
    stats = get_category_stats()
    for stat in stats:
        print(f"{stat['name']} ({stat['path']}): {stat['direct_products']} direct, {stat['total_products']} total")

if __name__ == "__main__":
    main()