# Synthora Web UI

Beautiful, modern web interface for Synthora AI App Builder.

## Features

- 🎨 **Beautiful Chat Interface**: Intuitive conversation-based app building
- ⚡ **Real-time Updates**: See your app spec being built in real-time
- 🚀 **One-Click Generation**: Generate complete full-stack apps with a button
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎯 **Interactive Examples**: Quick-start templates to get you building fast

## Quick Start

### 1. Install Dependencies

```bash
cd ui
npm install
```

### 2. Start the Backend Server

In the **main Synthora directory** (one level up):

```bash
cd ..
npm run dev
```

The API server will start on `http://localhost:3000`

### 3. Start the UI

In a **new terminal**, from the `ui` directory:

```bash
cd ui
npm run dev
```

The web interface will open at `http://localhost:3001`

## Usage

### Building Your First App

1. Open `http://localhost:3001` in your browser
2. Click "Build App" or go to `/chat`
3. Describe your app in natural language:
   ```
   "Create a CRM with client tracking, deal pipeline, 
   and churn prediction to identify at-risk customers"
   ```
4. The AI will understand your requirements and generate an app specification
5. Click the **"Generate App"** button to create the full-stack code
6. Follow the instructions to run your generated app

### Example Prompts

**Simple Apps:**
- "Build a todo list with priorities"
- "Create a blog with posts and comments"
- "Make an inventory tracker"

**Apps with ML:**
- "E-commerce store with product recommendations"
- "Support ticketing system that auto-prioritizes urgent issues"
- "Task manager that predicts completion time"
- "Sales dashboard with lead scoring"

**Complex Apps:**
- "Customer relationship management system with deal pipeline, contact tracking, email integration, and ML-based churn prediction"
- "Real-time analytics dashboard with user behavior tracking, conversion funnels, and anomaly detection"

## Development

### Project Structure

```
ui/
├── src/
│   ├── components/
│   │   └── ChatInterface.tsx    # Main chat component
│   ├── App.tsx                   # Main app with routing
│   ├── api.ts                    # API client
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
├── index.html
├── vite.config.ts
└── tailwind.config.js
```

### Available Scripts

```bash
npm run dev      # Start development server (port 3001)
npm run build    # Build for production
npm run preview  # Preview production build
```

### Tech Stack

- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6
- **Styling**: TailwindCSS 3
- **Icons**: Lucide React
- **Markdown**: React Markdown with syntax highlighting
- **Build Tool**: Vite 5
- **API Client**: Axios

## API Integration

The UI connects to the Synthora backend API at `http://localhost:3000`.

API calls are proxied through Vite:
- `/api/*` → `http://localhost:3000/api/*`

### Key Endpoints Used:

- `POST /api/conversation/start` - Start new chat session
- `POST /api/conversation/message` - Send message to AI
- `POST /api/apps/generate` - Generate app from spec
- `POST /api/ml/use-cases` - Create ML use case
- `POST /api/ml/use-cases/:id/train` - Train ML model

## Customization

### Changing Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',
        500: '#0ea5e9',  // Change this
        600: '#0284c7',
        700: '#0369a1',
      },
    },
  },
}
```

### Changing Port

Edit `vite.config.ts`:

```typescript
server: {
  port: 3001,  // Change this
  // ...
}
```

## Troubleshooting

### UI won't connect to API

**Problem**: "Failed to connect to Synthora API"

**Solution**: Make sure the backend is running:
```bash
cd .. && npm run dev
```

### Port already in use

**Problem**: "Port 3001 is already in use"

**Solution**: Either kill the process on 3001 or change the port in `vite.config.ts`

### Dependencies not installing

**Problem**: npm install fails

**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### Build the UI

```bash
npm run build
```

Output will be in `dist/` directory.

### Deploy Options

**1. Static Hosting (Vercel, Netlify, etc.)**
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

**2. Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-p", "3001"]
```

**3. Nginx**
```nginx
server {
  listen 80;
  root /var/www/synthora-ui/dist;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  location /api {
    proxy_pass http://localhost:3000;
  }
}
```

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
