import { MLUseCase, MLModel, ModelMetrics, MLConfig, TrainingConfig } from '../types';
import { nanoid } from 'nanoid';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * ML Platform
 * Handles model training, versioning, deployment, and monitoring
 */
export class MLPlatform {
  private modelsDir: string;
  private registry: Map<string, MLModel[]>;

  constructor(modelsDir: string = './ml_models') {
    this.modelsDir = modelsDir;
    this.registry = new Map();
  }

  /**
   * Create a new ML use case
   */
  async createUseCase(useCase: Partial<MLUseCase>): Promise<MLUseCase> {
    const fullUseCase: MLUseCase = {
      id: useCase.id || nanoid(),
      name: useCase.name || 'Untitled Use Case',
      description: useCase.description || '',
      category: useCase.category || 'custom',
      appId: useCase.appId || '',
      config: useCase.config || this.getDefaultConfig(useCase.category!),
      status: 'configuring',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return fullUseCase;
  }

  /**
   * Get default configuration for ML use case templates
   */
  private getDefaultConfig(category: string): MLConfig {
    const templates: Record<string, Partial<MLConfig>> = {
      churn_prediction: {
        targetVariable: 'churned',
        features: [
          'days_since_last_login',
          'total_sessions',
          'avg_session_duration',
          'feature_usage_count',
          'support_tickets_count',
        ],
        modelType: 'gradient_boosting',
        trainingConfig: {
          dataSource: 'user_events',
          trainTestSplit: 0.8,
          validationStrategy: 'holdout',
          evaluationMetrics: ['accuracy', 'precision', 'recall', 'auc'],
        },
        deploymentConfig: {
          endpoint: '/ml/predict/churn',
          autoscaling: true,
          monitoring: {
            latencyThreshold: 200,
            errorRateThreshold: 0.01,
            driftDetection: true,
            alertChannels: ['email'],
          },
        },
      },
      lead_scoring: {
        targetVariable: 'converted',
        features: [
          'page_views',
          'time_on_site',
          'email_opens',
          'form_submissions',
          'company_size',
          'industry',
        ],
        modelType: 'random_forest',
        trainingConfig: {
          dataSource: 'lead_events',
          trainTestSplit: 0.8,
          validationStrategy: 'cv',
          evaluationMetrics: ['accuracy', 'precision', 'recall', 'f1'],
        },
        deploymentConfig: {
          endpoint: '/ml/predict/lead-score',
          autoscaling: true,
          monitoring: {
            latencyThreshold: 150,
            errorRateThreshold: 0.01,
            driftDetection: true,
            alertChannels: ['email'],
          },
        },
      },
      conversion_optimization: {
        targetVariable: 'converted',
        features: [
          'funnel_step',
          'time_in_step',
          'previous_steps',
          'device_type',
          'traffic_source',
        ],
        modelType: 'logistic_regression',
        trainingConfig: {
          dataSource: 'conversion_events',
          trainTestSplit: 0.8,
          validationStrategy: 'timeseries',
          evaluationMetrics: ['accuracy', 'auc'],
        },
        deploymentConfig: {
          endpoint: '/ml/predict/conversion',
          autoscaling: true,
          monitoring: {
            latencyThreshold: 100,
            errorRateThreshold: 0.01,
            driftDetection: true,
            alertChannels: ['email'],
          },
        },
      },
      anomaly_detection: {
        targetVariable: 'is_anomaly',
        features: [
          'request_rate',
          'error_rate',
          'response_time',
          'unique_users',
          'hour_of_day',
        ],
        modelType: 'automl',
        trainingConfig: {
          dataSource: 'system_metrics',
          trainTestSplit: 0.8,
          validationStrategy: 'timeseries',
          evaluationMetrics: ['precision', 'recall', 'f1'],
        },
        deploymentConfig: {
          endpoint: '/ml/predict/anomaly',
          autoscaling: true,
          monitoring: {
            latencyThreshold: 50,
            errorRateThreshold: 0.005,
            driftDetection: true,
            alertChannels: ['slack', 'email'],
          },
        },
      },
      recommendation: {
        targetVariable: 'interaction',
        features: [
          'user_history',
          'item_features',
          'collaborative_features',
          'contextual_features',
        ],
        modelType: 'neural_network',
        trainingConfig: {
          dataSource: 'interaction_events',
          trainTestSplit: 0.8,
          validationStrategy: 'holdout',
          evaluationMetrics: ['accuracy', 'precision@k'],
        },
        deploymentConfig: {
          endpoint: '/ml/predict/recommendation',
          autoscaling: true,
          monitoring: {
            latencyThreshold: 300,
            errorRateThreshold: 0.01,
            driftDetection: true,
            alertChannels: ['email'],
          },
        },
      },
    };

    return templates[category] as MLConfig || {
      targetVariable: 'target',
      features: [],
      modelType: 'automl',
      trainingConfig: {
        dataSource: '',
        trainTestSplit: 0.8,
        validationStrategy: 'holdout',
        evaluationMetrics: ['accuracy'],
      },
      deploymentConfig: {
        endpoint: '/ml/predict',
        autoscaling: true,
        monitoring: {
          latencyThreshold: 200,
          errorRateThreshold: 0.01,
          driftDetection: true,
          alertChannels: [],
        },
      },
    };
  }

  /**
   * Train a model for a use case
   * This generates Python training script that can be executed
   */
  async trainModel(useCaseId: string, config: MLConfig): Promise<MLModel> {
    const modelId = nanoid();
    const version = this.getNextVersion(useCaseId);

    // Generate training script
    const trainingScript = this.generateTrainingScript(useCaseId, config);
    const scriptPath = path.join(this.modelsDir, useCaseId, 'train.py');

    // Ensure directory exists
    await fs.mkdir(path.join(this.modelsDir, useCaseId), { recursive: true });
    await fs.writeFile(scriptPath, trainingScript);

    // Generate requirements.txt for training
    const requirements = this.generateTrainingRequirements(config);
    await fs.writeFile(
      path.join(this.modelsDir, useCaseId, 'requirements.txt'),
      requirements
    );

    // In a real implementation, this would:
    // 1. Execute the training script
    // 2. Monitor progress
    // 3. Save artifacts
    // For now, we'll create a mock model

    const model: MLModel = {
      id: modelId,
      useCaseId,
      version,
      algorithm: config.modelType,
      features: config.features,
      metrics: this.generateMockMetrics(config.modelType),
      artifacts: {
        modelPath: path.join(this.modelsDir, useCaseId, `model_v${version}`),
        featureImportance: this.generateMockFeatureImportance(config.features),
        metadata: {
          trainingDate: new Date().toISOString(),
          trainingConfig: config.trainingConfig,
        },
      },
      status: 'ready',
    };

    // Add to registry
    if (!this.registry.has(useCaseId)) {
      this.registry.set(useCaseId, []);
    }
    this.registry.get(useCaseId)!.push(model);

    return model;
  }

  /**
   * Generate Python training script
   */
  private generateTrainingScript(useCaseId: string, config: MLConfig): string {
    return `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import mlflow
import mlflow.sklearn
import json
from datetime import datetime

# Configuration
TARGET = "${config.targetVariable}"
FEATURES = ${JSON.stringify(config.features)}
MODEL_TYPE = "${config.modelType}"
TRAIN_TEST_SPLIT = ${config.trainingConfig.trainTestSplit}

def load_data():
    """Load training data from data source"""
    # In production, this would connect to your database/data warehouse
    # For now, this is a placeholder
    print(f"Loading data from: ${config.trainingConfig.dataSource}")
    # Return mock data structure
    return pd.DataFrame()

def prepare_features(df):
    """Feature engineering and preparation"""
    X = df[FEATURES]
    y = df[TARGET]
    return X, y

def train_model(X_train, y_train, model_type):
    """Train model based on type"""
    if model_type == "random_forest":
        model = RandomForestClassifier(n_estimators=100, random_state=42)
    elif model_type == "gradient_boosting":
        model = GradientBoostingClassifier(n_estimators=100, random_state=42)
    elif model_type == "logistic_regression":
        model = LogisticRegression(random_state=42)
    else:
        # AutoML would go here
        model = RandomForestClassifier(n_estimators=100, random_state=42)
    
    model.fit(X_train, y_train)
    return model

def evaluate_model(model, X_test, y_test):
    """Evaluate model performance"""
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else y_pred
    
    metrics = {
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred, average='binary'),
        "recall": recall_score(y_test, y_pred, average='binary'),
        "f1_score": f1_score(y_test, y_pred, average='binary'),
    }
    
    try:
        metrics["auc"] = roc_auc_score(y_test, y_pred_proba)
    except:
        pass
    
    return metrics

def main():
    # Start MLflow run
    mlflow.set_experiment("${useCaseId}")
    
    with mlflow.start_run():
        # Load and prepare data
        print("Loading data...")
        df = load_data()
        X, y = prepare_features(df)
        
        # Split data
        print("Splitting data...")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, 
            test_size=1-TRAIN_TEST_SPLIT, 
            random_state=42
        )
        
        # Train model
        print(f"Training {MODEL_TYPE} model...")
        model = train_model(X_train, y_train, MODEL_TYPE)
        
        # Evaluate
        print("Evaluating model...")
        metrics = evaluate_model(model, X_test, y_test)
        
        # Log to MLflow
        mlflow.log_params({
            "model_type": MODEL_TYPE,
            "n_features": len(FEATURES),
            "train_size": len(X_train),
            "test_size": len(X_test),
        })
        
        mlflow.log_metrics(metrics)
        
        # Log feature importance
        if hasattr(model, 'feature_importances_'):
            feature_importance = dict(zip(FEATURES, model.feature_importances_))
            mlflow.log_dict(feature_importance, "feature_importance.json")
        
        # Save model
        mlflow.sklearn.log_model(model, "model")
        
        print("Training complete!")
        print(f"Metrics: {json.dumps(metrics, indent=2)}")
        
        return model, metrics

if __name__ == "__main__":
    main()
`;
  }

  /**
   * Generate training requirements
   */
  private generateTrainingRequirements(config: MLConfig): string {
    const baseRequirements = [
      'pandas>=2.0.0',
      'numpy>=1.24.0',
      'scikit-learn>=1.3.0',
      'mlflow>=2.9.0',
    ];

    if (config.modelType === 'neural_network') {
      baseRequirements.push('tensorflow>=2.15.0');
      baseRequirements.push('keras>=2.15.0');
    }

    return baseRequirements.join('\n');
  }

  /**
   * Generate mock metrics for demonstration
   */
  private generateMockMetrics(modelType: string): ModelMetrics {
    // In production, these would come from actual model evaluation
    const baseAccuracy = modelType === 'gradient_boosting' ? 0.85 : 
                        modelType === 'random_forest' ? 0.83 :
                        modelType === 'neural_network' ? 0.87 : 0.81;

    return {
      accuracy: baseAccuracy + Math.random() * 0.05,
      precision: baseAccuracy + Math.random() * 0.05,
      recall: baseAccuracy - 0.02 + Math.random() * 0.05,
      f1Score: baseAccuracy - 0.01 + Math.random() * 0.05,
      auc: baseAccuracy + 0.05 + Math.random() * 0.05,
    };
  }

  /**
   * Generate mock feature importance
   */
  private generateMockFeatureImportance(features: string[]): Record<string, number> {
    const importance: Record<string, number> = {};
    let remaining = 1.0;

    features.forEach((feature, idx) => {
      if (idx === features.length - 1) {
        importance[feature] = remaining;
      } else {
        const value = Math.random() * remaining * 0.4;
        importance[feature] = value;
        remaining -= value;
      }
    });

    return importance;
  }

  /**
   * Get next model version for a use case
   */
  private getNextVersion(useCaseId: string): number {
    const models = this.registry.get(useCaseId) || [];
    return models.length + 1;
  }

  /**
   * Deploy a model
   */
  async deployModel(modelId: string, useCaseId: string): Promise<void> {
    const models = this.registry.get(useCaseId);
    if (!models) {
      throw new Error('Use case not found');
    }

    const model = models.find(m => m.id === modelId);
    if (!model) {
      throw new Error('Model not found');
    }

    // Update model status
    model.status = 'deployed';
    model.deployedAt = new Date();

    // Generate deployment script
    const deploymentScript = this.generateDeploymentScript(model);
    const scriptPath = path.join(this.modelsDir, useCaseId, 'deploy.py');
    await fs.writeFile(scriptPath, deploymentScript);

    // In production, this would:
    // 1. Package the model
    // 2. Deploy to serving infrastructure
    // 3. Set up monitoring
    // 4. Configure autoscaling
  }

  /**
   * Generate model deployment script
   */
  private generateDeploymentScript(model: MLModel): string {
    return `import mlflow
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import numpy as np

# Load model
model_path = "${model.artifacts.modelPath}"
model = mlflow.sklearn.load_model(model_path)

# Create API
app = FastAPI(title="ML Model Serving", version="${model.version}")

class PredictionRequest(BaseModel):
    features: Dict[str, Any]

class PredictionResponse(BaseModel):
    prediction: float
    model_id: str
    model_version: int
    confidence: float = None

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Make prediction"""
    try:
        # Convert features to array in correct order
        feature_names = ${JSON.stringify(model.features)}
        feature_array = np.array([[request.features.get(f, 0) for f in feature_names]])
        
        # Make prediction
        prediction = model.predict(feature_array)[0]
        
        # Get confidence if available
        confidence = None
        if hasattr(model, 'predict_proba'):
            probas = model.predict_proba(feature_array)[0]
            confidence = float(max(probas))
        
        return PredictionResponse(
            prediction=float(prediction),
            model_id="${model.id}",
            model_version=${model.version},
            confidence=confidence
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy", "model_id": "${model.id}"}

@app.get("/info")
async def info():
    return {
        "model_id": "${model.id}",
        "version": ${model.version},
        "algorithm": "${model.algorithm}",
        "features": ${JSON.stringify(model.features)},
        "metrics": ${JSON.stringify(model.metrics)}
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
`;
  }

  /**
   * Get model by ID
   */
  getModel(useCaseId: string, modelId: string): MLModel | undefined {
    const models = this.registry.get(useCaseId);
    return models?.find(m => m.id === modelId);
  }

  /**
   * Get all models for a use case
   */
  getModels(useCaseId: string): MLModel[] {
    return this.registry.get(useCaseId) || [];
  }

  /**
   * Get deployed model for a use case
   */
  getDeployedModel(useCaseId: string): MLModel | undefined {
    const models = this.registry.get(useCaseId) || [];
    return models.find(m => m.status === 'deployed');
  }
}
