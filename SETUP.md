# Quick Setup Guide

## 1. Set Up Python Virtual Environment

### Create and activate venv:

**On macOS/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**

```bash
python -m venv venv
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt when it's activated.

### Install Python dependencies:

```bash
pip install -r requirements.txt
```

## 2. Set Up Frontend Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit `.env` and set your MongoDB connection:

```env
MONGODB_URI=mongodb://localhost:27017/secret-santa
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5001
```

**Note:** Port 5001 is used by default to avoid conflicts with macOS AirPlay Receiver (which uses port 5000).

## 4. Initialize Users

```bash
python scripts/init_users.py
```

This creates all 6 cousins with their secret keys.

## 5. Start the Servers

### Option 1: Run both together (recommended)

```bash
npm run dev
```

This runs:

- Flask backend on `http://localhost:5001`
- React frontend on `http://localhost:5173`

### Option 2: Run separately

**Backend only:**

```bash
python run.py
```

or

```bash
npm run dev:server
```

**Frontend only:**

```bash
npm run dev:client
```

## 6. Shuffle Assignments (when ready)

```bash
python scripts/shuffle.py
```

## Notes

- Keep the venv activated while working on the project
- To deactivate venv: `deactivate`
- The frontend will proxy API requests to the backend automatically
