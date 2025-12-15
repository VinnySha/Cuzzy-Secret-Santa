# 🎁 Cuzzy Secret Santa 2025

A full-stack Secret Santa website for the cousins! Each cousin logs in with their own secret key to see their assignment and manage their wishlist.

## Features

✨ **Core Features:**

- Secret key authentication for each cousin
- MongoDB database for secure storage
- Individual private assignments
- Wishlist management (add/edit your own wishlist)
- View your assigned person's wishlist
- Mobile-friendly design

🔐 **Security:**

- Secret keys are hashed with bcrypt
- JWT token authentication
- Each cousin can only see their own assignment

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

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js (v18 or higher) - for frontend
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Set up Python virtual environment (recommended):**

```bash
# Create venv
python3 -m venv venv

# Activate venv
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt when activated.

2. **Install Python dependencies:**

```bash
pip install -r requirements.txt
```

3. **Install frontend dependencies:**

```bash
npm install
```

4. **Create a `.env` file in the root directory (copy from `env.example`):**

```bash
cp env.example .env
```

5. **Update `.env` with your MongoDB connection:**

```env
MONGODB_URI=mongodb://localhost:27017/secret-santa
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/secret-santa

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5001
```

**Note:** Port 5001 is used by default to avoid conflicts with macOS AirPlay Receiver (which uses port 5000). You can change this in your `.env` file if needed.

````

### Initialize Users

Before running the app, you need to create users in the database. Run:

```bash
python scripts/init_users.py
````

Or using npm script:

```bash
npm run init-users
```

This will create all 6 cousins with their secret keys:

- Charvi: `charvi2025`
- Rohan: `rohan2025`
- Vinny: `vinny2025`
- Isha: `isha2025`
- Praneil: `praneil2025`
- Rohil: `rohil2025`

**⚠️ Important:** Share each cousin's secret key with them privately! They'll need it to log in.

### Shuffle Assignments

Once users are created, you can shuffle the assignments:

```bash
python scripts/shuffle.py
```

Or using npm script:

```bash
npm run shuffle
```

This will randomly assign each cousin to another cousin (ensuring no self-assignments).

### Development

Run both frontend and backend simultaneously:

```bash
npm run dev
```

This starts:

- Backend Flask server on `http://localhost:5001`
- Frontend dev server on `http://localhost:5173`

Or run them separately:

```bash
# Backend only (make sure venv is activated)
python run.py
# or
npm run dev:server

# Frontend only
npm run dev:client
```

**Note:** Make sure your Python virtual environment is activated when running the backend server.

### Production Build

```bash
npm run build
```

The `dist` folder will contain the production-ready frontend files.

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with secret key
- `GET /api/auth/verify` - Verify JWT token

### Assignments

- `GET /api/assignments/my-assignment` - Get your assignment (requires auth)
- `GET /api/assignments/my-wishlist` - Get your wishlist (requires auth)
- `PUT /api/assignments/my-wishlist` - Update your wishlist (requires auth)

### Admin

- `POST /api/admin/init-users` - Initialize users (body: `{ users: [{ name, secretKey }] }`)
- `POST /api/admin/shuffle` - Shuffle all assignments
- `GET /api/admin/users` - Get all users
- `POST /api/admin/clear-assignments` - Clear all assignments

## How to Use

1. **Admin Setup:**

   - Run `python scripts/init_users.py` to create all cousins
   - Share each cousin's secret key with them privately
   - Run `python scripts/shuffle.py` when ready to assign

2. **Cousin Login:**

   - Visit the website
   - Enter your secret key
   - View your assignment and the person's wishlist
   - Edit your own wishlist

3. **Wishlist Management:**
   - Click "Edit" on your wishlist card
   - Add items to help your Secret Santa know what you want!

## Deployment

### Backend Deployment

Deploy the Flask server to:

- **Heroku**
- **Railway**
- **Render**
- **DigitalOcean**
- **PythonAnywhere**
- Any Python hosting service

Make sure to set environment variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `PORT` (usually set automatically by hosting service)

For production, use a WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 server.app:app
```

### Frontend Deployment

Deploy the built `dist` folder to:

- **Vercel**
- **Netlify**
- **GitHub Pages**
- Your own server

**Important:** Update the API base URL in `src/utils/api.js` if your backend is on a different domain.

### Full-Stack Deployment

For a single deployment:

1. Build frontend: `npm run build`
2. Flask already serves the `dist` folder in production mode
3. Deploy to a platform that supports Python (Heroku, Railway, etc.)

## Database Schema

**User Collection:**

```python
{
  "_id": ObjectId,
  "name": String (unique),
  "secretKey": String (hashed with bcrypt),
  "assignedTo": ObjectId (reference to User),
  "wishlist": [String],
  "createdAt": DateTime
}
```

## Project Structure

```
.
├── server/
│   ├── app.py              # Flask application
│   ├── models/
│   │   └── user.py         # User model
│   ├── routes/
│   │   ├── auth.py         # Authentication routes
│   │   ├── assignments.py  # Assignment routes
│   │   └── admin.py        # Admin routes
│   └── middleware/
│       └── auth.py         # Auth middleware
├── src/                    # React frontend
├── scripts/
│   ├── init_users.py       # Initialize users script
│   └── shuffle.py         # Shuffle assignments script
├── requirements.txt        # Python dependencies
└── package.json           # Node.js dependencies
```

## Security Notes

- Secret keys are hashed using bcrypt before storage
- JWT tokens expire after 7 days
- Each user can only access their own data
- Admin endpoints should be protected in production (add admin authentication)

## Cousins (in age order)

Charvi, Rohan, Vinny, Isha, Praneil, Rohil

---

Made with ❤️ for the cousins 🎄
