# 🎁 Cuzzy Secret Santa 2025

A full-stack Secret Santa website for the cuzzys! Each cuzzy creates their own secret key and logs in to see their assignment and manage their wishlist.

## ✨ Features

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

## 🛠️ Tech Stack

**Frontend:**

- React 18 + Vite
- Tailwind CSS
- Framer Motion

**Backend:**

- Flask (Python)
- MongoDB with PyMongo
- Flask-JWT-Extended for authentication
- bcrypt for password hashing

## 📜 Scripts

### 🎲 Shuffle Assignments

Randomly assign each cuzzy to another (ensuring no self-assignments):

```bash
python scripts/shuffle.py
```

or

```bash
npm run shuffle
```

### 🔑 Reset Secret Keys

Clear all secret keys (users will need to set new keys):

```bash
python scripts/clear_secret_keys.py
```

or

```bash
npm run clear-keys
```

## 💾 Database

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

## 🚀 Deployment

✅ **Deployed successfully with Render!**

Visit the application at:

- vinnysharma.dev
- cuzzy-secret-santa.onrender.com/

**Notes:**

- Users are created without secret keys (`secretKey: None`)
- Each user sets their own secret key on first login
- Secret keys are hashed with bcrypt before storage
- `seenAssignment` tracks whether user has viewed their assignment animation

---

Made with ❤️ for the cuzzys hehe 🎄
