import * as fs from 'fs/promises';
import * as path from 'path';
import { AppSpecification, DataModel, Screen, Component } from '../types';

/**
 * App Generator
 * Generates React frontend and FastAPI backend from app specifications
 */
export class AppGenerator {
  private outputDir: string;

  constructor(outputDir: string = './generated_apps') {
    this.outputDir = outputDir;
  }

  /**
   * Generate complete app from specification
   */
  async generateApp(spec: AppSpecification): Promise<string> {
    const appDir = path.join(this.outputDir, spec.id);
    
    // Create directory structure
    await this.createDirectoryStructure(appDir);

    // Generate backend
    await this.generateBackend(spec, path.join(appDir, 'backend'));

    // Generate frontend
    await this.generateFrontend(spec, path.join(appDir, 'frontend'));

    // Generate docker-compose for easy deployment
    await this.generateDockerCompose(spec, appDir);

    // Generate README
    await this.generateReadme(spec, appDir);

    return appDir;
  }

  /**
   * Create directory structure
   */
  private async createDirectoryStructure(appDir: string): Promise<void> {
    const dirs = [
      appDir,
      path.join(appDir, 'backend'),
      path.join(appDir, 'backend', 'app'),
      path.join(appDir, 'backend', 'app', 'models'),
      path.join(appDir, 'backend', 'app', 'routes'),
      path.join(appDir, 'backend', 'app', 'services'),
      path.join(appDir, 'backend', 'app', 'ml'),
      path.join(appDir, 'backend', 'app', 'events'),
      path.join(appDir, 'frontend'),
      path.join(appDir, 'frontend', 'src'),
      path.join(appDir, 'frontend', 'src', 'components'),
      path.join(appDir, 'frontend', 'src', 'pages'),
      path.join(appDir, 'frontend', 'src', 'services'),
      path.join(appDir, 'frontend', 'src', 'hooks'),
      path.join(appDir, 'frontend', 'src', 'ml'),
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Generate FastAPI backend
   */
  private async generateBackend(spec: AppSpecification, backendDir: string): Promise<void> {
    // Generate requirements.txt
    await this.generateRequirementsTxt(backendDir);

    // Generate main app file
    await this.generateMainPy(spec, backendDir);

    // Generate data models
    await this.generateDataModels(spec, backendDir);

    // Generate API routes
    await this.generateAPIRoutes(spec, backendDir);

    // Generate event tracking
    await this.generateEventTracking(spec, backendDir);

    // Generate ML service integration
    await this.generateMLService(spec, backendDir);
  }

  private async generateRequirementsTxt(backendDir: string): Promise<void> {
    const content = `fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
pydantic==2.5.3
python-dotenv==1.0.0
psycopg2-binary==2.9.9
redis==5.0.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
scikit-learn==1.4.0
pandas==2.2.0
numpy==1.26.3
mlflow==2.9.2
prometheus-client==0.19.0
`;

    await fs.writeFile(path.join(backendDir, 'requirements.txt'), content);
  }

  private async generateMainPy(spec: AppSpecification, backendDir: string): Promise<void> {
    const content = `from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import os
from dotenv import load_dotenv

from app.routes import ${spec.dataModels.map(m => `${m.name.toLowerCase()}_routes`).join(', ')}
from app.events.tracker import EventTracker
from app.ml.service import MLService

load_dotenv()

app = FastAPI(
    title="${spec.name}",
    description="${spec.description}",
    version="${spec.version}"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Services
event_tracker = EventTracker()
ml_service = MLService()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Include routers
${spec.dataModels.map(m => `app.include_router(${m.name.toLowerCase()}_routes.router, prefix="/${m.name.toLowerCase()}s", tags=["${m.name}"])`).join('\n')}

@app.get("/")
async def root():
    return {
        "app": "${spec.name}",
        "version": "${spec.version}",
        "status": "running"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;

    await fs.writeFile(path.join(backendDir, 'app', 'main.py'), content);
  }

  private async generateDataModels(spec: AppSpecification, backendDir: string): Promise<void> {
    for (const model of spec.dataModels) {
      await this.generateSQLAlchemyModel(model, backendDir);
      await this.generatePydanticSchemas(model, backendDir);
    }
  }

  private async generateSQLAlchemyModel(model: DataModel, backendDir: string): Promise<void> {
    const fieldMappings: Record<string, string> = {
      string: 'String',
      number: 'Float',
      boolean: 'Boolean',
      date: 'Date',
      datetime: 'DateTime',
      email: 'String',
      url: 'String',
      json: 'JSON',
    };

    const fields = model.fields.map(field => {
      const sqlType = fieldMappings[field.type] || 'String';
      const nullable = !field.required;
      const unique = field.unique ? ', unique=True' : '';
      return `    ${field.name} = Column(${sqlType}${unique}, nullable=${nullable})`;
    }).join('\n');

    const content = `from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class ${model.name}(Base):
    __tablename__ = "${model.name.toLowerCase()}s"
    
    id = Column(Integer, primary_key=True, index=True)
${fields}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
`;

    await fs.writeFile(
      path.join(backendDir, 'app', 'models', `${model.name.toLowerCase()}.py`),
      content
    );
  }

  private async generatePydanticSchemas(model: DataModel, backendDir: string): Promise<void> {
    const typeMappings: Record<string, string> = {
      string: 'str',
      number: 'float',
      boolean: 'bool',
      date: 'date',
      datetime: 'datetime',
      email: 'EmailStr',
      url: 'HttpUrl',
      json: 'dict',
    };

    const fields = model.fields.map(field => {
      const pyType = typeMappings[field.type] || 'str';
      const optional = !field.required ? ' | None = None' : '';
      return `    ${field.name}: ${pyType}${optional}`;
    }).join('\n');

    const content = `from pydantic import BaseModel, EmailStr, HttpUrl
from datetime import datetime, date
from typing import Optional

class ${model.name}Base(BaseModel):
${fields}

class ${model.name}Create(${model.name}Base):
    pass

class ${model.name}Update(BaseModel):
${model.fields.map(f => `    ${f.name}: ${typeMappings[f.type] || 'str'} | None = None`).join('\n')}

class ${model.name}(${model.name}Base):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
`;

    await fs.writeFile(
      path.join(backendDir, 'app', 'models', `${model.name.toLowerCase()}_schemas.py`),
      content
    );
  }

  private async generateAPIRoutes(spec: AppSpecification, backendDir: string): Promise<void> {
    for (const model of spec.dataModels) {
      const content = `from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.models.${model.name.toLowerCase()} import ${model.name}
from app.models.${model.name.toLowerCase()}_schemas import ${model.name}Create, ${model.name}Update, ${model.name} as ${model.name}Schema
from app.main import get_db, event_tracker

router = APIRouter()

@router.get("/", response_model=List[${model.name}Schema])
async def get_${model.name.toLowerCase()}s(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all ${model.name}s"""
    items = db.query(${model.name}).offset(skip).limit(limit).all()
    
    # Track event
    await event_tracker.track({
        "type": "api_call",
        "endpoint": "/${model.name.toLowerCase()}s",
        "method": "GET",
        "count": len(items)
    })
    
    return items

@router.get("/{item_id}", response_model=${model.name}Schema)
async def get_${model.name.toLowerCase()}(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Get ${model.name} by ID"""
    item = db.query(${model.name}).filter(${model.name}.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="${model.name} not found")
    
    await event_tracker.track({
        "type": "api_call",
        "endpoint": f"/${model.name.toLowerCase()}s/{item_id}",
        "method": "GET"
    })
    
    return item

@router.post("/", response_model=${model.name}Schema)
async def create_${model.name.toLowerCase()}(
    item: ${model.name}Create,
    db: Session = Depends(get_db)
):
    """Create new ${model.name}"""
    db_item = ${model.name}(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    await event_tracker.track({
        "type": "api_call",
        "endpoint": "/${model.name.toLowerCase()}s",
        "method": "POST",
        "item_id": db_item.id
    })
    
    return db_item

@router.put("/{item_id}", response_model=${model.name}Schema)
async def update_${model.name.toLowerCase()}(
    item_id: int,
    item: ${model.name}Update,
    db: Session = Depends(get_db)
):
    """Update ${model.name}"""
    db_item = db.query(${model.name}).filter(${model.name}.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="${model.name} not found")
    
    update_data = item.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    
    db.commit()
    db.refresh(db_item)
    
    await event_tracker.track({
        "type": "api_call",
        "endpoint": f"/${model.name.toLowerCase()}s/{item_id}",
        "method": "PUT"
    })
    
    return db_item

@router.delete("/{item_id}")
async def delete_${model.name.toLowerCase()}(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Delete ${model.name}"""
    db_item = db.query(${model.name}).filter(${model.name}.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="${model.name} not found")
    
    db.delete(db_item)
    db.commit()
    
    await event_tracker.track({
        "type": "api_call",
        "endpoint": f"/${model.name.toLowerCase()}s/{item_id}",
        "method": "DELETE"
    })
    
    return {"message": "${model.name} deleted successfully"}
`;

      await fs.writeFile(
        path.join(backendDir, 'app', 'routes', `${model.name.toLowerCase()}_routes.py`),
        content
      );
    }
  }

  private async generateEventTracking(spec: AppSpecification, backendDir: string): Promise<void> {
    const content = `import redis
import json
from datetime import datetime
from typing import Dict, Any
import os

class EventTracker:
    """Event tracking service for user actions and system events"""
    
    def __init__(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
        self.stream_name = "${spec.id}:events"
    
    async def track(self, event: Dict[str, Any]):
        """Track an event"""
        event_data = {
            **event,
            "timestamp": datetime.utcnow().isoformat(),
            "app_id": "${spec.id}"
        }
        
        # Store in Redis stream for real-time processing
        self.redis_client.xadd(
            self.stream_name,
            {"data": json.dumps(event_data)},
            maxlen=100000  # Keep last 100k events
        )
        
        # Also store in time-series key for analytics
        day_key = f"${spec.id}:events:{datetime.utcnow().strftime('%Y-%m-%d')}"
        self.redis_client.lpush(day_key, json.dumps(event_data))
        self.redis_client.expire(day_key, 90 * 24 * 60 * 60)  # 90 days retention
    
    async def get_events(self, start_time: str = None, end_time: str = None, limit: int = 100):
        """Retrieve events"""
        events = self.redis_client.xrevrange(self.stream_name, count=limit)
        return [json.loads(event[1]["data"]) for event in events]
    
    async def get_event_count(self, event_type: str = None):
        """Get event count"""
        events = await self.get_events(limit=10000)
        if event_type:
            return len([e for e in events if e.get("type") == event_type])
        return len(events)
`;

    await fs.writeFile(path.join(backendDir, 'app', 'events', 'tracker.py'), content);
  }

  private async generateMLService(spec: AppSpecification, backendDir: string): Promise<void> {
    const content = `import mlflow
import os
from typing import Dict, Any, List
import numpy as np

class MLService:
    """ML model serving and prediction service"""
    
    def __init__(self):
        self.mlflow_tracking_uri = os.getenv("MLFLOW_TRACKING_URI", "./mlruns")
        mlflow.set_tracking_uri(self.mlflow_tracking_uri)
        self.loaded_models = {}
    
    async def load_model(self, model_id: str, version: str = "latest"):
        """Load ML model from registry"""
        if model_id not in self.loaded_models:
            model_uri = f"models:/{model_id}/{version}"
            self.loaded_models[model_id] = mlflow.pyfunc.load_model(model_uri)
        return self.loaded_models[model_id]
    
    async def predict(self, model_id: str, features: Dict[str, Any]) -> Dict[str, Any]:
        """Make prediction with loaded model"""
        model = await self.load_model(model_id)
        
        # Convert features dict to appropriate format
        # This is simplified - actual implementation would handle feature engineering
        feature_array = np.array([list(features.values())])
        
        prediction = model.predict(feature_array)
        
        return {
            "prediction": prediction[0],
            "model_id": model_id,
            "confidence": None,  # Would be populated if model supports it
        }
    
    async def batch_predict(self, model_id: str, features_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Batch predictions"""
        return [await self.predict(model_id, features) for features in features_list]
    
    async def get_model_info(self, model_id: str) -> Dict[str, Any]:
        """Get model metadata"""
        client = mlflow.tracking.MlflowClient()
        versions = client.search_model_versions(f"name='{model_id}'")
        
        if not versions:
            return None
        
        latest = versions[0]
        return {
            "name": model_id,
            "version": latest.version,
            "stage": latest.current_stage,
            "description": latest.description,
        }
`;

    await fs.writeFile(path.join(backendDir, 'app', 'ml', 'service.py'), content);
  }

  /**
   * Generate React frontend
   */
  private async generateFrontend(spec: AppSpecification, frontendDir: string): Promise<void> {
    // Generate package.json
    await this.generateFrontendPackageJson(spec, frontendDir);

    // Generate main App component
    await this.generateAppComponent(spec, frontendDir);

    // Generate pages for each screen
    await this.generatePages(spec, frontendDir);

    // Generate API service
    await this.generateAPIService(spec, frontendDir);

    // Generate ML hooks
    await this.generateMLHooks(spec, frontendDir);

    // Generate index.html and entry point
    await this.generateFrontendEntry(spec, frontendDir);
  }

  private async generateFrontendPackageJson(spec: AppSpecification, frontendDir: string): Promise<void> {
    const content = {
      name: `${spec.name.toLowerCase().replace(/\s+/g, '-')}-frontend`,
      version: spec.version,
      private: true,
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-router-dom": "^6.21.3",
        "@tanstack/react-query": "^5.17.19",
        "axios": "^1.6.5",
        "recharts": "^2.10.4",
        "lucide-react": "^0.312.0",
        "tailwindcss": "^3.4.1",
        "typescript": "^5.3.3"
      },
      devDependencies: {
        "@types/react": "^18.2.48",
        "@types/react-dom": "^18.2.18",
        "@vitejs/plugin-react": "^4.2.1",
        "vite": "^5.0.12"
      },
      scripts: {
        "dev": "vite",
        "build": "tsc && vite build",
        "preview": "vite preview"
      }
    };

    await fs.writeFile(
      path.join(frontendDir, 'package.json'),
      JSON.stringify(content, null, 2)
    );
  }

  private async generateAppComponent(spec: AppSpecification, frontendDir: string): Promise<void> {
    const imports = spec.screens.map(s => 
      `import ${s.name.replace(/\s+/g, '')}Page from './pages/${s.name.replace(/\s+/g, '')}'`
    ).join('\n');

    const routes = spec.screens.map(s => 
      `        <Route path="${s.path}" element={<${s.name.replace(/\s+/g, '')}Page />} />`
    ).join('\n');

    const content = `import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
${imports}

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex space-x-8">
                  <Link to="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
                    ${spec.name}
                  </Link>
${spec.screens.map(s => `                  <Link to="${s.path}" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                    ${s.name}
                  </Link>`).join('\n')}
                </div>
              </div>
            </div>
          </nav>
          
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
${routes}
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

function DashboardPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900">${spec.name}</h1>
      <p className="mt-2 text-gray-600">${spec.description}</p>
    </div>
  );
}

export default App;
`;

    await fs.writeFile(path.join(frontendDir, 'src', 'App.tsx'), content);
  }

  private async generatePages(spec: AppSpecification, frontendDir: string): Promise<void> {
    for (const screen of spec.screens) {
      await this.generatePageComponent(screen, spec, frontendDir);
    }
  }

  private async generatePageComponent(screen: Screen, spec: AppSpecification, frontendDir: string): Promise<void> {
    const pageName = screen.name.replace(/\s+/g, '');
    
    const content = `import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export default function ${pageName}Page() {
  const queryClient = useQueryClient();
  
  // Add your data fetching and mutations here
  
  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-2xl font-semibold text-gray-900">${screen.name}</h1>
      
      <div className="mt-6">
        {/* Add your page content here */}
        <p className="text-gray-600">This is the ${screen.name} page (${screen.type} view)</p>
      </div>
    </div>
  );
}
`;

    await fs.writeFile(
      path.join(frontendDir, 'src', 'pages', `${pageName}.tsx`),
      content
    );
  }

  private async generateAPIService(spec: AppSpecification, frontendDir: string): Promise<void> {
    const content = `import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track events automatically
api.interceptors.request.use((config) => {
  // Track API calls as events
  const eventData = {
    type: 'api_call',
    method: config.method,
    url: config.url,
    timestamp: new Date().toISOString(),
  };
  
  // Send to analytics endpoint
  axios.post(\`\${config.baseURL}/events/track\`, eventData).catch(() => {});
  
  return config;
});

export default api;

// Generated API functions
${spec.dataModels.map(model => `
export const ${model.name.toLowerCase()}Api = {
  getAll: () => api.get('/${model.name.toLowerCase()}s'),
  getById: (id: number) => api.get(\`/${model.name.toLowerCase()}s/\${id}\`),
  create: (data: any) => api.post('/${model.name.toLowerCase()}s', data),
  update: (id: number, data: any) => api.put(\`/${model.name.toLowerCase()}s/\${id}\`, data),
  delete: (id: number) => api.delete(\`/${model.name.toLowerCase()}s/\${id}\`),
};`).join('\n')}
`;

    await fs.writeFile(path.join(frontendDir, 'src', 'services', 'api.ts'), content);
  }

  private async generateMLHooks(spec: AppSpecification, frontendDir: string): Promise<void> {
    const content = `import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook for ML predictions
 */
export function useMLPrediction(modelId: string, features: Record<string, any>, enabled: boolean = true) {
  return useQuery({
    queryKey: ['ml-prediction', modelId, features],
    queryFn: async () => {
      const response = await api.post(\`/ml/predict/\${modelId}\`, { features });
      return response.data;
    },
    enabled: enabled && !!modelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for batch predictions
 */
export function useBatchMLPrediction(modelId: string, featuresList: Array<Record<string, any>>) {
  return useQuery({
    queryKey: ['ml-batch-prediction', modelId, featuresList],
    queryFn: async () => {
      const response = await api.post(\`/ml/batch-predict/\${modelId}\`, { features_list: featuresList });
      return response.data;
    },
    enabled: !!modelId && featuresList.length > 0,
  });
}

/**
 * Hook for model info
 */
export function useMLModelInfo(modelId: string) {
  return useQuery({
    queryKey: ['ml-model-info', modelId],
    queryFn: async () => {
      const response = await api.get(\`/ml/models/\${modelId}\`);
      return response.data;
    },
    enabled: !!modelId,
  });
}

/**
 * ML Widget Component
 */
export function MLWidget({ 
  modelId, 
  features, 
  displayType = 'badge' 
}: { 
  modelId: string; 
  features: Record<string, any>; 
  displayType?: 'badge' | 'score' | 'recommendation' 
}) {
  const { data, isLoading, error } = useMLPrediction(modelId, features);
  
  if (isLoading) return <div>Loading prediction...</div>;
  if (error) return <div>Error loading prediction</div>;
  if (!data) return null;
  
  if (displayType === 'badge') {
    const value = data.prediction;
    const color = value > 0.7 ? 'red' : value > 0.4 ? 'yellow' : 'green';
    
    return (
      <span className={\`px-2 py-1 text-xs font-semibold rounded-full bg-\${color}-100 text-\${color}-800\`}>
        {(value * 100).toFixed(0)}%
      </span>
    );
  }
  
  if (displayType === 'score') {
    return (
      <div className="text-center">
        <div className="text-3xl font-bold">{(data.prediction * 100).toFixed(0)}</div>
        <div className="text-sm text-gray-500">Score</div>
      </div>
    );
  }
  
  return <div>{JSON.stringify(data)}</div>;
}
`;

    await fs.writeFile(path.join(frontendDir, 'src', 'ml', 'hooks.tsx'), content);
  }

  private async generateFrontendEntry(spec: AppSpecification, frontendDir: string): Promise<void> {
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${spec.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

    await fs.writeFile(path.join(frontendDir, 'index.html'), indexHtml);

    const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

    await fs.writeFile(path.join(frontendDir, 'src', 'main.tsx'), mainTsx);

    const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`;

    await fs.writeFile(path.join(frontendDir, 'src', 'index.css'), indexCss);

    // Vite config
    const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});`;

    await fs.writeFile(path.join(frontendDir, 'vite.config.ts'), viteConfig);

    // Tailwind config
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

    await fs.writeFile(path.join(frontendDir, 'tailwind.config.js'), tailwindConfig);
  }

  /**
   * Generate docker-compose for deployment
   */
  private async generateDockerCompose(spec: AppSpecification, appDir: string): Promise<void> {
    const content = `version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${spec.id}
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres/${spec.id}
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:8000
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
`;

    await fs.writeFile(path.join(appDir, 'docker-compose.yml'), content);
  }

  /**
   * Generate README
   */
  private async generateReadme(spec: AppSpecification, appDir: string): Promise<void> {
    const content = `# ${spec.name}

${spec.description}

## Generated by Synthora

This app was automatically generated from a conversational specification.

## Structure

- \`/backend\` - FastAPI backend with auto-generated models, routes, and ML integration
- \`/frontend\` - React frontend with TypeScript and Tailwind CSS

## Getting Started

### Using Docker (Recommended)

\`\`\`bash
docker-compose up
\`\`\`

### Manual Setup

#### Backend

\`\`\`bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
\`\`\`

#### Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## Features

### Data Models

${spec.dataModels.map(m => `- **${m.name}**: ${m.description || 'No description'}`).join('\n')}

### Screens

${spec.screens.map(s => `- **${s.name}** (\`${s.path}\`): ${s.type} view`).join('\n')}

### Auto-Instrumentation

All API calls and user interactions are automatically tracked for analytics and ML.

### ML Integration

ML models can be deployed and their predictions integrated directly into the UI via:
- ML Widgets
- Automation Rules
- Dashboards

## API Documentation

Once running, visit: http://localhost:8000/docs

## Version

${spec.version}

## Created

${new Date().toISOString()}
`;

    await fs.writeFile(path.join(appDir, 'README.md'), content);
  }
}
