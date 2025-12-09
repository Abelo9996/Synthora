import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { ConversationOrchestrator } from './orchestrator/ConversationOrchestrator';
import { AppGenerator } from './generator/AppGenerator';
import { MLPlatform } from './ml/MLPlatform';

dotenv.config();

/**
 * Synthora Platform
 * Main server that orchestrates all components
 */
class SynthoraPlatform {
  private app: Express;
  private port: number;
  private orchestrator: ConversationOrchestrator;
  private generator: AppGenerator;
  private mlPlatform: MLPlatform;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    this.orchestrator = new ConversationOrchestrator();
    this.generator = new AppGenerator(process.env.GENERATED_APPS_PATH);
    this.mlPlatform = new MLPlatform(process.env.ML_REGISTRY_PATH);

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Conversation endpoints
    this.app.post('/api/conversation/start', async (req: Request, res: Response) => {
      try {
        const { userId } = req.body;
        const sessionId = await this.orchestrator.startSession(userId);
        res.json({ sessionId, message: 'Session started successfully' });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/conversation/message', async (req: Request, res: Response) => {
      try {
        const { sessionId, message } = req.body;
        const result = await this.orchestrator.processMessage(sessionId, message);
        res.json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/conversation/:sessionId', async (req: Request, res: Response) => {
      try {
        const context = this.orchestrator.getContext(req.params.sessionId);
        if (!context) {
          return res.status(404).json({ error: 'Session not found' });
        }
        res.json(context);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // App generation endpoints
    this.app.post('/api/apps/generate', async (req: Request, res: Response) => {
      try {
        const { sessionId } = req.body;
        const context = this.orchestrator.getContext(sessionId);
        
        if (!context || !context.currentSpec) {
          return res.status(400).json({ error: 'No app specification found in session' });
        }

        const appPath = await this.generator.generateApp(context.currentSpec as any);
        res.json({ 
          success: true, 
          appPath,
          message: 'App generated successfully',
          spec: context.currentSpec 
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // ML Platform endpoints
    this.app.post('/api/ml/use-cases', async (req: Request, res: Response) => {
      try {
        const useCase = await this.mlPlatform.createUseCase(req.body);
        res.json(useCase);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/ml/use-cases/:useCaseId/train', async (req: Request, res: Response) => {
      try {
        const { useCaseId } = req.params;
        const { config } = req.body;
        
        const model = await this.mlPlatform.trainModel(useCaseId, config);
        res.json({ 
          success: true, 
          model,
          message: 'Model training initiated' 
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/ml/models/:modelId/deploy', async (req: Request, res: Response) => {
      try {
        const { modelId } = req.params;
        const { useCaseId } = req.body;
        
        await this.mlPlatform.deployModel(modelId, useCaseId);
        res.json({ 
          success: true, 
          message: 'Model deployed successfully' 
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/ml/use-cases/:useCaseId/models', async (req: Request, res: Response) => {
      try {
        const { useCaseId } = req.params;
        const models = this.mlPlatform.getModels(useCaseId);
        res.json({ models });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/ml/use-cases/:useCaseId/deployed', async (req: Request, res: Response) => {
      try {
        const { useCaseId } = req.params;
        const model = this.mlPlatform.getDeployedModel(useCaseId);
        
        if (!model) {
          return res.status(404).json({ error: 'No deployed model found' });
        }
        
        res.json({ model });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Example: Full workflow endpoint
    this.app.post('/api/demo/create-app-with-ml', async (req: Request, res: Response) => {
      try {
        const { userId, appDescription, mlUseCase } = req.body;

        // 1. Start conversation
        const sessionId = await this.orchestrator.startSession(userId);

        // 2. Process app creation
        const appResult = await this.orchestrator.processMessage(
          sessionId,
          appDescription
        );

        // 3. Generate app
        const context = this.orchestrator.getContext(sessionId);
        if (context?.currentSpec) {
          const appPath = await this.generator.generateApp(context.currentSpec as any);

          // 4. Set up ML use case if requested
          if (mlUseCase) {
            const mlResult = await this.orchestrator.processMessage(
              sessionId,
              mlUseCase
            );

            if (context.currentMLUseCase) {
              const model = await this.mlPlatform.trainModel(
                context.currentMLUseCase.id!,
                context.currentMLUseCase.config!
              );

              await this.mlPlatform.deployModel(model.id, context.currentMLUseCase.id!);

              return res.json({
                success: true,
                appPath,
                appSpec: context.currentSpec,
                mlModel: model,
                message: 'App created and ML model deployed successfully',
              });
            }
          }

          res.json({
            success: true,
            appPath,
            appSpec: context.currentSpec,
            message: 'App created successfully',
          });
        } else {
          res.status(400).json({ error: 'Failed to generate app specification' });
        }
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Root endpoint with documentation
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'Synthora Platform',
        version: '0.1.0',
        description: 'AI-native app builder with built-in data & ML copilot',
        endpoints: {
          health: 'GET /health',
          conversation: {
            start: 'POST /api/conversation/start',
            message: 'POST /api/conversation/message',
            get: 'GET /api/conversation/:sessionId',
          },
          apps: {
            generate: 'POST /api/apps/generate',
          },
          ml: {
            createUseCase: 'POST /api/ml/use-cases',
            train: 'POST /api/ml/use-cases/:useCaseId/train',
            deploy: 'POST /api/ml/models/:modelId/deploy',
            getModels: 'GET /api/ml/use-cases/:useCaseId/models',
            getDeployed: 'GET /api/ml/use-cases/:useCaseId/deployed',
          },
          demo: {
            fullWorkflow: 'POST /api/demo/create-app-with-ml',
          },
        },
        documentation: 'https://github.com/synthora/docs',
      });
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Synthora Platform                               ║
║                                                       ║
║   AI-Native App Builder + ML Copilot                 ║
║                                                       ║
║   Server running on: http://localhost:${this.port}        ║
║                                                       ║
║   Ready to build intelligent applications! 🎉        ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  }
}

// Start the server
const platform = new SynthoraPlatform();
platform.start();

export default platform;
