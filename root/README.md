MeowlChat

A full-stack social posting app built as a class project and taken further with a full deployment. 
Three-tier architecture: React, Express/Node.js, and PostgreSQL.

Live demo: https://meowlchat-g88n.onrender.com/

Tech Stack:
    * Frontend: React, MUI, Hooks-based state management
    * Backend: Express.js, Node.js, JWT authentication
    * Database: PostgreSQL
    * API Docs: OpenAPI (openapi.yaml)
    * Testing: Jest/Vitest for unit & integration tests, Puppeteer for end-to-end tests
    * Build Tool: Vite

Features:
    Login:
        * POST Request
        * JWT-authorized login
        * Only authenticated users can make sensitive requests
    My Posts:
        * GET Request
        * View your own private and public posts
    Posts:
        * GET Request
        * View all public posts
        * Timestamp, user avatar, content, like count, group type
    
    Groups:
        * GET Request
        * Users are assigned to groups
        * Group posts are only visible to group members
    Likes:
        * POST Request / DELETE Request
        * Like/unlike posts
        * Persisted to the database

    Create Post:
        * POST Request
        * Create a new post
        * Optionally scoped to a group
        * Set as public or private

Frontend:
    * Responsive design with distinct mobile and desktop layouts
    * MUI components customized for the login flow
    * React Hooks manage state
    * useEffect triggers backend requests on state change
    
Backend:
    API Schema: documented in openapi.yaml, including success and error codes
    Auth: JWT tokens secure sensitive routes
    Database: PostgreSQL with normalized schemas and joined tables for posts/groups/likes
    Routes: Express routes connect to PostgreSQL via models, handling inserts/deletes per request