CREATE OR REPLACE FUNCTION increment_article_views(row_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE articles
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
