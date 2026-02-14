# Forum Module (MVP)

Endpoints under /parent/forum:
- GET /categories
- GET /posts?page=&pageSize=&categoryId=&q=
- GET /posts/:id
- POST /posts
- POST /posts/:id/like (toggle)
- GET /posts/:id/replies?page=&pageSize=
- POST /posts/:id/replies

Auth: JwtAuthGuard. Roles: PARENT/DOCTOR can create.

DB tables: forum_categories, forum_posts, forum_replies, forum_post_likes.

