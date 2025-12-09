# Synthora 🚀

**AI-Native App Builder with Built-in Data & ML Copilot**

Synthora is a revolutionary platform that lets you build production-ready web applications with integrated machine learning capabilities through natural language conversations.

## 🌟 Vision

Think of Synthora as **"an AI-native app builder with a built-in data & ML copilot"** rather than just another no-code tool.

### What Makes Synthora Different?

1. **Conversational App Building** - Describe your app in plain English, get a fully functional application
2. **Automatic Instrumentation** - Every app auto-captures events, user behavior, and domain data
3. **Integrated ML Platform** - Deploy ML models inside your app workspace with zero ops
4. **Tight Feedback Loop** - App generates data → ML analyzes → ML drives app behavior

## 🎯 Key Features

### 1. Natural Language App Generation
```
You: "I need a CRM for small agencies with a Kanban board, 
     client records, and email integration."

Synthora: [Generates complete app with database, API, and UI]
```

### 2. Built-in Data & Event Layer
- Automatic event tracking for all user interactions
- Structured data storage with auto-generated APIs
- Feature store primitives for ML

### 3. No-Ops ML Platform
- **Pre-built Templates**: Churn prediction, lead scoring, conversion optimization, anomaly detection, recommendations
- **AutoML**: Automatic model selection and hyperparameter tuning
- **One-Click Deployment**: Models deployed as APIs with monitoring
- **Feedback Loops**: Continuous learning from app data

### 4. Insight Integration
- **ML Widgets**: Display predictions directly in your app UI
- **Automation Rules**: Trigger actions based on ML outputs
- **Analytics Dashboards**: Auto-generated insights and visualizations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Conversation Layer                      │
│         (Natural Language Understanding & Intent)        │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────┼────────────────────────────────────────┐
│                ▼                                         │
│    ┌───────────────────┐      ┌──────────────────┐     │
│    │ App Specification │◄────►│  ML Use Case     │     │
│    │     Engine        │      │   Templates      │     │
│    └─────────┬─────────┘      └────────┬─────────┘     │
│              │                          │               │
│              ▼                          ▼               │
│    ┌──────────────────┐      ┌──────────────────┐     │
│    │  App Generator   │      │  ML Platform     │     │
│    │  (React+FastAPI) │      │  (Train/Deploy)  │     │
│    └─────────┬────────┘      └────────┬─────────┘     │
└──────────────┼─────────────────────────┼───────────────┘
               │                         │
               ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  Generated App   │◄────►│  ML Models       │
    │  (Full Stack)    │      │  (Deployed)      │
    └──────────────────┘      └──────────────────┘
               │                         │
               └─────────┬───────────────┘
                         ▼
              ┌──────────────────┐
              │  Data & Events   │
              │  (Automatic)     │
              └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+ (for ML features)
- PostgreSQL (for app databases)
- Redis (for event streaming)
- OpenAI API Key

### Option A: Web Interface (Recommended ✨)

The easiest way to use Synthora is through the beautiful web UI:

```bash
# Clone the repository
git clone https://github.com/yourusername/synthora.git
cd synthora

# Install all dependencies
npm install
cd ui && npm install && cd ..

# Set up environment
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=sk-...

# Start backend (Terminal 1)
npm run dev

# Start web UI (Terminal 2 - new window)
cd ui && npm run dev
```

**Open your browser to `http://localhost:3001` and start building!** 🎉

### Option B: Terminal/API

Use via command line or direct API:

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start the platform
npm run dev

# In a new terminal, run the interactive demo
node demo.js
```

The API server will be at `http://localhost:3000`

## 📖 Usage Guide

### Using the Web Interface

1. Open `http://localhost:3001` in your browser
2. Click **"Build App"** or navigate to `/chat`
3. Describe your app in natural language:

**Example Prompts:**
```
"Create a CRM with client tracking, deal pipeline, 
and churn prediction to identify at-risk customers"

"Build an e-commerce store with product catalog, shopping cart, 
and smart product recommendations based on browsing history"

"Make a task management system with teams, projects, 
and AI that predicts task priority and completion time"
```

4. Watch the AI generate your app specification
5. Click **"Generate App"** to create the full-stack code
6. Run your generated app:
```bash
cd generated_apps/your_app_id
docker-compose up
```

### Using the Terminal/API

### Example 1: Create a CRM with Churn Prediction

```bash
# Start a conversation
curl -X POST http://localhost:3000/api/conversation/start \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'

# Returns: {"sessionId": "abc123"}

# Describe your app
curl -X POST http://localhost:3000/api/conversation/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123",
    "message": "Create a CRM with customer records, deal tracking, and a dashboard"
  }'

# Generate the app
curl -X POST http://localhost:3000/api/apps/generate \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "abc123"}'

# Add ML capability
curl -X POST http://localhost:3000/api/conversation/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123",
    "message": "Add churn prediction to identify customers at risk"
  }'

# Train and deploy the model
curl -X POST http://localhost:3000/api/ml/use-cases/churn_001/train \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "targetVariable": "churned",
      "features": ["days_since_last_login", "total_deals", "deal_value"],
      "modelType": "gradient_boosting"
    }
  }'
```

### Example 2: Full Workflow (One Request)

```bash
curl -X POST http://localhost:3000/api/demo/create-app-with-ml \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "appDescription": "Build a lead management system with Kanban board and analytics",
    "mlUseCase": "Add lead scoring to prioritize which leads to contact first"
  }'
```

This single request will:
1. Generate the full-stack app
2. Set up event tracking
3. Train a lead scoring model
4. Deploy the model
5. Integrate predictions into the UI

## 🧩 Core Components

### 1. Conversation Orchestrator
**Location**: `src/orchestrator/ConversationOrchestrator.ts`

Uses LLMs to understand user intent and generate app specifications.

**Capabilities**:
- Intent detection (create_app, modify_app, add_ml_usecase, etc.)
- App specification generation
- ML use case configuration
- Contextual refinement

### 2. App Generator
**Location**: `src/generator/AppGenerator.ts`

Generates complete full-stack applications from specifications.

**Generates**:
- **Backend**: FastAPI with SQLAlchemy models, REST APIs, event tracking
- **Frontend**: React with TypeScript, TailwindCSS, React Query
- **Database**: PostgreSQL schemas with migrations
- **Deployment**: Docker Compose configuration

### 3. ML Platform
**Location**: `src/ml/MLPlatform.ts`

Manages the entire ML lifecycle without ops overhead.

**Features**:
- Template-based ML use cases
- AutoML and custom model support
- Model versioning and registry
- One-click deployment
- Monitoring and drift detection

### 4. Data & Event Layer
Auto-instrumentation for every generated app:
- Page views, clicks, form submissions
- API calls and errors
- Custom business events
- Feature derivation for ML

## 🎨 ML Use Case Templates

### Churn Prediction
Identify users likely to leave before they do.
```javascript
{
  category: 'churn_prediction',
  features: [
    'days_since_last_login',
    'session_count_30d',
    'feature_usage_count',
    'support_tickets'
  ]
}
```

### Lead Scoring
Prioritize leads by conversion probability.
```javascript
{
  category: 'lead_scoring',
  features: [
    'page_views',
    'time_on_site',
    'email_engagement',
    'form_submissions'
  ]
}
```

### Conversion Optimization
Optimize funnel steps for maximum conversion.
```javascript
{
  category: 'conversion_optimization',
  features: [
    'funnel_position',
    'time_in_step',
    'device_type',
    'traffic_source'
  ]
}
```

### Anomaly Detection
Detect unusual patterns in app usage or data.
```javascript
{
  category: 'anomaly_detection',
  features: [
    'request_rate',
    'error_rate',
    'response_time',
    'active_users'
  ]
}
```

### Recommendations
Suggest content, products, or actions to users.
```javascript
{
  category: 'recommendation',
  features: [
    'user_history',
    'item_features',
    'collaborative_signals',
    'context'
  ]
}
```

## 🔌 API Reference

### Conversation API

#### Start Session
```http
POST /api/conversation/start
Content-Type: application/json

{
  "userId": "string"
}
```

#### Send Message
```http
POST /api/conversation/message
Content-Type: application/json

{
  "sessionId": "string",
  "message": "string"
}
```

### App Generation API

#### Generate App
```http
POST /api/apps/generate
Content-Type: application/json

{
  "sessionId": "string"
}
```

### ML Platform API

#### Create ML Use Case
```http
POST /api/ml/use-cases
Content-Type: application/json

{
  "name": "string",
  "category": "churn_prediction|lead_scoring|...",
  "appId": "string"
}
```

#### Train Model
```http
POST /api/ml/use-cases/:useCaseId/train
Content-Type: application/json

{
  "config": {
    "targetVariable": "string",
    "features": ["string"],
    "modelType": "automl|random_forest|..."
  }
}
```

#### Deploy Model
```http
POST /api/ml/models/:modelId/deploy
Content-Type: application/json

{
  "useCaseId": "string"
}
```

## 🎯 Example Use Cases

### 1. E-commerce Platform with Recommendations
```
"Build an e-commerce site with product catalog, shopping cart, 
and checkout. Add product recommendations based on browsing history 
and similar user purchases."
```

### 2. SaaS Dashboard with Usage Analytics
```
"Create a SaaS dashboard showing user activity, feature usage, 
and billing. Include anomaly detection to alert when unusual 
patterns occur."
```

### 3. Real Estate CRM with Lead Scoring
```
"Build a real estate CRM with property listings, client management, 
and showing scheduler. Score leads based on engagement and predict 
which are most likely to buy."
```

### 4. Support Ticketing with Priority Prediction
```
"Create a support ticket system with queue management and 
agent assignment. Predict ticket priority and estimated 
resolution time based on content and history."
```

## 🛠️ Development

### Project Structure
```
synthora/
├── src/
│   ├── types/              # TypeScript type definitions
│   ├── orchestrator/       # Conversation & intent handling
│   ├── generator/          # App code generation
│   ├── ml/                 # ML platform & training
│   └── index.ts           # Main server entry point
├── generated_apps/         # Generated applications
├── ml_models/             # Trained ML models
└── tests/                 # Test suites
```

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

## 🔮 Roadmap

- [ ] **Q1 2024**: Visual app editor alongside chat
- [ ] **Q2 2024**: Multi-user collaboration
- [ ] **Q3 2024**: Mobile app generation (React Native)
- [ ] **Q4 2024**: Advanced ML: deep learning, NLP models
- [ ] **2025**: Marketplace for ML templates and app components

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built with:
- OpenAI GPT-4 for natural language understanding
- FastAPI for backend generation
- React + TypeScript for frontend
- scikit-learn & MLflow for ML platform

## 📞 Support

- **Documentation**: [docs.synthora.dev](https://docs.synthora.dev)
- **Discord**: [Join our community](https://discord.gg/synthora)
- **Email**: support@synthora.dev

---

**Built with ❤️ by the Synthora Team**

*Making AI-powered app development accessible to everyone*
Synthora is an AI-powered development platform that lets you build full web and mobile applications entirely through natural language, with no manual coding required. Describe what you want, and the system generates your frontend, backend, database, workflows, and deployment config automatically.
