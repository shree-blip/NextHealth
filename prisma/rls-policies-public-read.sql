BEGIN;

DROP POLICY IF EXISTS post_public_read ON public."Post";
CREATE POLICY post_public_read
ON public."Post"
FOR SELECT
TO anon, authenticated
USING ("publishedAt" IS NOT NULL);

DROP POLICY IF EXISTS news_article_public_read ON public."NewsArticle";
CREATE POLICY news_article_public_read
ON public."NewsArticle"
FOR SELECT
TO anon, authenticated
USING ("publishedAt" IS NOT NULL);

DROP POLICY IF EXISTS author_public_read ON public."Author";
CREATE POLICY author_public_read
ON public."Author"
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS category_public_read ON public."Category";
CREATE POLICY category_public_read
ON public."Category"
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS tag_public_read ON public."Tag";
CREATE POLICY tag_public_read
ON public."Tag"
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS comment_public_read_approved ON public."Comment";
CREATE POLICY comment_public_read_approved
ON public."Comment"
FOR SELECT
TO anon, authenticated
USING ("approved" = true);

DROP POLICY IF EXISTS post_tags_public_read ON public."_PostTags";
CREATE POLICY post_tags_public_read
ON public."_PostTags"
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS post_categories_public_read ON public."_PostCategories";
CREATE POLICY post_categories_public_read
ON public."_PostCategories"
FOR SELECT
TO anon, authenticated
USING (true);

COMMIT;