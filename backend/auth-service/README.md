## Auth Service

Endpoints:
- POST /auth/register { email, password, name }
- POST /auth/login { email, password } -> { token, user }
- GET /users/me (Bearer token)
- POST /users/:id/favorites { artworkId } (Bearer token, owner only)
- DELETE /users/:id/favorites { artworkId } (Bearer token, owner only)

Run locally without MongoDB (uses in-memory Mongo):

```powershell
cd backend/auth-service
npm install
npm run start:dev
```

Notes:
- The service will use an in-memory repository when no `MONGO_URI` is provided.
- For production, set `MONGO_URI` and `JWT_SECRET`.
