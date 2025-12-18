# 🎁 Cuzzy Secret Santa 2025

A full-stack Secret Santa website for the cuzzys! Each cuzzy creates their own secret key and logs in to see their assignment and manage their wishlist.

## Features

✨ **Core Features:**

- Secret key authentication (users create their own keys)
- Drumroll animation when viewing assignment for the first time
- Individual private assignments
- Wishlist management (add/edit your own wishlist)
- Questionnaire system to help your Secret Santa
- View your assigned person's wishlist and questionnaire
- Secret key updates
- Mobile-friendly design

🔐 **Security:**

- Secret keys are hashed with bcrypt
- JWT token authentication
- Each cuzzy can only see their own assignment

## Tech Stack

**Frontend:**

- React 18 + Vite
- Tailwind CSS
- Framer Motion

**Backend:**

- Flask (Python)
- MongoDB with PyMongo
- Flask-JWT-Extended for authentication
- bcrypt for password hashing

## Scripts

### Shuffle Assignments

Randomly assign each cuzzy to another (ensuring no self-assignments):

```bash
python scripts/shuffle.py
```

or

```bash
npm run shuffle
```

### Reset Secret Keys

Clear all secret keys (users will need to set new keys):

```bash
python scripts/clear_secret_keys.py
```

or

```bash
npm run clear-keys
```

## Endpoints

### Authentication

- `POST /api/auth/login` - Login with name and secret key
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/users` - Get all users (public)
- `GET /api/auth/users/:name/check-key` - Check if user has a key set
- `POST /api/auth/users/:name/verify-key` - Verify a secret key for a user
- `POST /api/auth/users/:name/set-key` - Set or update a user's secret key

### Assignments (Requires Authentication)

- `GET /api/assignments/my-assignment` - Get your Secret Santa assignment
- `GET /api/assignments/my-wishlist` - Get your wishlist
- `PUT /api/assignments/my-wishlist` - Update your wishlist
- `POST /api/assignments/my-assignment/mark-seen` - Mark assignment as seen (hides animation)
- `GET /api/assignments/my-questionnaire` - Get your questionnaire answers
- `PUT /api/assignments/my-questionnaire` - Update your questionnaire

### Admin

- `POST /api/admin/init-users` - Initialize users (body: `{ users: [{ name, secretKey? }] }` - secretKey is optional)
- `POST /api/admin/shuffle` - Shuffle all assignments
- `GET /api/admin/users` - Get all users with their assignments
- `POST /api/admin/clear-assignments` - Clear all assignments

### Health Check

- `GET /api/health` - Server health check

## Database

**User Collection Schema:**

```python
{
  "_id": ObjectId,
  "name": String (unique),
  "secretKey": String | None (hashed with bcrypt when set),
  "assignedTo": ObjectId | None (reference to User),
  "wishlist": [String],
  "questionnaire": Object,
  "seenAssignment": Boolean,
  "createdAt": DateTime
}
```

**Notes:**

- Users are created without secret keys (`secretKey: None`)
- Each user sets their own secret key on first login
- Secret keys are hashed with bcrypt before storage
- `seenAssignment` tracks whether user has viewed their assignment animation

---

Made with ❤️ for the cuzzys hehe 🎄
