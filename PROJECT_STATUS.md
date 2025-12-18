# 🎁 Project Status

## ✅ Completed Setup

1. **Environment Configuration**

   - ✅ MongoDB Atlas connection configured (`MONGODB_URI` in `.env`)
   - ✅ JWT secret key set
   - ✅ Port configured (5001 to avoid AirPlay conflict)

2. **Database Initialization**

   - ✅ All 6 cuzzys created in MongoDB
   - ✅ Users are created without secret keys (each user sets their own key on first login)

3. **Code Status**
   - ✅ Flask backend ready
   - ✅ React frontend ready
   - ✅ All dependencies installed

## ✨ Features Implemented

### Core Features

- ✅ **Secret Key Authentication** - Each cuzzy creates and logs in with their own unique secret key
- ✅ **Assignment Viewing** - View your Secret Santa assignment privately
- ✅ **Drumroll Animation** - Special animation when viewing assignment for the first time
- ✅ **Wishlist Management** - Add, edit, and manage your wishlist items
- ✅ **Questionnaire System** - Fill out a questionnaire to help your Secret Santa
- ✅ **View Assigned Person's Info** - See your assigned person's wishlist and questionnaire
- ✅ **Secret Key Update** - Users can update their secret keys if needed
- ✅ **Replay Animation** - Option to replay the assignment reveal animation

### Admin Features

- ✅ **Initialize Users** - Create users via API endpoint (users are created without secret keys)
- ✅ **Shuffle Assignments** - Randomly assign Secret Santas (ensures no self-assignments)
- ✅ **View All Users** - Get list of all users and their assignments
- ✅ **Clear Assignments** - Reset all assignments (useful for re-shuffling)
- ✅ **Reset Seen Status** - Automatically resets when shuffling (allows animation replay)

### Security Features

- ✅ **Bcrypt Hashing** - Secret keys are securely hashed
- ✅ **JWT Authentication** - Token-based authentication for API requests
- ✅ **Private Assignments** - Each user can only see their own assignment

## 📋 Next Steps

### 1. Shuffle Assignments (When Ready)

Once you're ready to assign Secret Santas, you can shuffle in two ways:

**Option A: Using the script (recommended)**

```bash
python scripts/shuffle.py
```

or

```bash
npm run shuffle
```

**Option B: Using the Admin API**

```bash
curl -X POST http://localhost:5001/api/admin/shuffle
```

This will randomly assign each cuzzy to another (ensuring no self-assignments). The `seenAssignment` flag is automatically reset, so users will see the animation again when they log in.

### 2. Start the Application

**Option A: Run both servers together (recommended)**

```bash
# Make sure venv is activated
source venv/bin/activate

# Start both frontend and backend
npm run dev
```

**Option B: Run separately**

```bash
# Terminal 1 - Backend
source venv/bin/activate
python run.py

# Terminal 2 - Frontend
npm run dev:client
```

### 3. Test the Application

1. Open `http://localhost:5173` in your browser
2. **First-time setup flow:**
   - Select your name from the list
   - Set your secret key (you'll create your own password)
   - You'll be automatically logged in after setting your key
3. **Subsequent logins:**
   - Select your name
   - Enter the secret key you created
   - Access your dashboard to see your assignment

**Note:** Each user creates and manages their own secret key. There are no preset keys.

## 🎯 Current State

- **Users:** ✅ 6 cuzzys initialized (without secret keys)
- **Secret Keys:** ⏳ Users will set their own keys on first login
- **Assignments:** ⏳ Not shuffled yet (run `python scripts/shuffle.py` when ready)
- **Server:** ⏳ Not running (start with `npm run dev`)
- **Frontend:** ⏳ Not running (start with `npm run dev`)

## 📡 API Endpoints

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

- `POST /api/admin/init-users` - Initialize users (body: `{ users: [{ name, secretKey? }] }` - secretKey is optional, users can set it later)
- `POST /api/admin/shuffle` - Shuffle all assignments
- `GET /api/admin/users` - Get all users with their assignments
- `POST /api/admin/clear-assignments` - Clear all assignments

### Health Check

- `GET /api/health` - Server health check

## 🚀 Ready to Launch!

Your Secret Santa app is fully set up and ready to use!

1. Start the servers with `npm run dev`
2. Each cuzzy will visit the site and set their own secret key on first login
3. Once all users have set their keys, shuffle the assignments when ready
4. Users can then log in with their secret keys to see their assignments

## 📝 Additional Notes

- **Secret Key System**: Users create their own secret keys when they first log in. There are no preset keys. Each user is responsible for remembering their own key.
- **First Login Flow**: New users select their name, then set a secret key. They are automatically logged in after setting their key.
- **Key Updates**: Users can update their secret keys through the `/update-key` route if needed (requires verifying their current key).
- **Animation System**: The drumroll animation plays automatically when a user views their assignment for the first time after a shuffle
- **Questionnaire**: Users can fill out a questionnaire to provide additional information to their Secret Santa
- **Re-shuffling**: You can re-shuffle assignments at any time. The system will reset the `seenAssignment` flag so users see the animation again
