# 🎁 Cuzzy Secret Santa 2025

A full-stack Secret Santa web application built with React and Flask. Each participant creates their own secret key to securely log in and view their assignment. Features include animated assignment reveals, private messaging, and a modern, responsive UI.

## ✨ Features

### 🎯 Core Features

- **Secret Key Authentication** - Users create and manage their own secret keys
- **Drumroll Animation** - Exciting animated reveal when viewing assignment for the first time
- **Replay Animation** - Option to replay the assignment animation anytime
- **Private Assignments** - Each user can only see their own assignment
- **Messaging System** - Two-way anonymous messaging:
  - Chat with your assignment (the person you're buying for)
  - Chat with your Secret Santa (the person buying for you)
- **Secret Key Management** - Update your secret key anytime
- **Dark Mode Support** - Automatic dark/light mode based on system preferences
- **Mobile-Friendly Design** - Fully responsive UI that works on all devices

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth transitions
- **React Router** - Client-side routing

### Backend

- **Flask** - Python web framework
- **MongoDB** - NoSQL database with PyMongo
- **Flask-JWT-Extended** - JWT authentication
- **bcrypt** - Password hashing
- **Flask-CORS** - Cross-origin resource sharing

## 📜 Scripts

### 🎲 Shuffle Assignments

Randomly assign each participant to another (ensuring no self-assignments and creating a circular assignment):

```bash
python scripts/shuffle.py
```

or

```bash
npm run shuffle
```

### 🔑 Reset Secret Keys

Clear all secret keys (users will need to set new keys on next login):

```bash
python scripts/clear_secret_keys.py
```

or

```bash
npm run clear-keys
```

### 💬 Clear Messages

Delete all messages from the database:

```bash
python scripts/clear_messages.py
```

or

```bash
npm run clear-messages
```

### 👥 Initialize Users

Create users in the database (can be done via API or script):

```bash
python scripts/init_users.py
```

or

```bash
npm run init-users
```

## 💾 Database Schema

### User Collection

```python
{
  "_id": ObjectId,
  "name": String (unique),
  "secretKey": String | None (hashed with bcrypt when set),
  "assignedTo": ObjectId | None (reference to User),
  "seenAssignment": Boolean,
  "createdAt": DateTime (UTC)
}
```

### Message Collection

```python
{
  "_id": ObjectId,
  "senderId": ObjectId (reference to User),
  "receiverId": ObjectId (reference to User),
  "message": String,
  "createdAt": DateTime (UTC)
}
```

## 🚀 Deployment

The application is deployed on **Render** and accessible at:

- **Primary Domain**: [vinnysharma.dev](https://vinnysharma.dev)
- **Render Domain**: [cuzzy-secret-santa.onrender.com](https://cuzzy-secret-santa.onrender.com)

### Deployment Notes

- Frontend is built with Vite and served as static files by Flask
- MongoDB Atlas is used for production database
- Environment variables are configured in Render dashboard
- The app uses connection pooling and retry logic for reliable MongoDB connections

## 📝 Usage Flow

1. **Admin Setup**

   - Initialize users in the database
   - Run shuffle script to assign Secret Santas

2. **User Experience**

   - User visits the landing page
   - Selects their name from the list
   - Creates a secret key (or uses existing one to login)
   - Views their assignment with animated reveal
   - Can chat with both their assignment and Secret Santa
   - Can update their secret key anytime

3. **Messaging**
   - Messages are anonymous (users don't see each other's names in chat)
   - Real-time message polling (updates every 3 seconds)
   - Separate conversations for assignment and Secret Santa

### 🔐 Security

- Secret keys are hashed with bcrypt before storage
- JWT token-based authentication
- Each user can only access their own assignment and conversations
- Secure MongoDB connection with connection pooling

---

Made with ❤️ for the cuzzys 🎄
