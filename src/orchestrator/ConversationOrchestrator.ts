import { OpenAI } from 'openai';
import { 
  ConversationContext, 
  Message, 
  Intent, 
  IntentType, 
  AppSpecification,
  MLUseCase 
} from '../types';
import { nanoid } from 'nanoid';

/**
 * Conversation Orchestrator
 * Uses LLMs to understand user intent and generate/modify app specifications
 */
export class ConversationOrchestrator {
  private openai: OpenAI;
  private contexts: Map<string, ConversationContext>;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.contexts = new Map();
  }

  /**
   * Start a new conversation session
   */
  async startSession(userId: string): Promise<string> {
    const sessionId = nanoid();
    const context: ConversationContext = {
      sessionId,
      userId,
      history: [],
    };
    this.contexts.set(sessionId, context);
    return sessionId;
  }

  /**
   * Process user message and return assistant response
   */
  async processMessage(
    sessionId: string,
    userMessage: string
  ): Promise<{ response: string; artifacts?: any[] }> {
    const context = this.contexts.get(sessionId);
    if (!context) {
      throw new Error('Session not found');
    }

    // Add user message to history
    context.history.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Detect intent
    const intent = await this.detectIntent(userMessage, context);

    // Route to appropriate handler
    let response: string;
    let artifacts: any[] = [];

    switch (intent.type) {
      case 'create_app':
        const result = await this.handleCreateApp(userMessage, context, intent);
        response = result.response;
        artifacts = result.artifacts || [];
        break;
      
      case 'modify_app':
        const modifyResult = await this.handleModifyApp(userMessage, context, intent);
        response = modifyResult.response;
        artifacts = modifyResult.artifacts || [];
        break;
      
      case 'add_feature':
        const featureResult = await this.handleAddFeature(userMessage, context, intent);
        response = featureResult.response;
        artifacts = featureResult.artifacts || [];
        break;
      
      case 'create_ml_usecase':
        const mlResult = await this.handleCreateMLUseCase(userMessage, context, intent);
        response = mlResult.response;
        artifacts = mlResult.artifacts || [];
        break;
      
      default:
        response = await this.handleGeneralQuery(userMessage, context);
    }

    // Add assistant response to history
    context.history.push({
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      artifacts,
    });

    return { response, artifacts };
  }

  /**
   * Detect user intent using LLM
   */
  private async detectIntent(
    message: string,
    context: ConversationContext
  ): Promise<Intent> {
    const systemPrompt = `You are an intent classifier for an AI app builder platform. 
Analyze the user's message and classify it into one of these intents:
- create_app: User wants to create a new application
- modify_app: User wants to modify an existing app (add/remove features, change UI, etc.)
- add_feature: User wants to add a specific feature to their app
- create_ml_usecase: User wants to add ML capabilities (predictions, analytics, etc.)
- deploy_model: User wants to deploy an ML model
- view_insights: User wants to see analytics or insights
- configure_integration: User wants to connect external services
- question: User is asking a question
- other: None of the above

Also extract relevant entities like app names, feature names, model types, etc.

Respond in JSON format:
{
  "type": "intent_type",
  "confidence": 0.95,
  "entities": {
    "entity_name": "value"
  }
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return result as Intent;
  }

  /**
   * Handle app creation request
   */
  private async handleCreateApp(
    message: string,
    context: ConversationContext,
    intent: Intent
  ): Promise<{ response: string; artifacts?: any[] }> {
    const systemPrompt = `You are an expert app architect. The user wants to create a new application.
Analyze their requirements and generate a detailed app specification.

Generate a JSON specification including:
1. App name and description
2. Data models (entities with fields, types, relationships)
3. Screens (list views, detail views, forms, dashboards)
4. Basic workflows
5. Recommended integrations

Be thorough but ask for clarification if critical details are missing.

Previous conversation:
${this.formatHistory(context.history.slice(-5))}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0].message.content || '';

    // Extract JSON spec from the response
    const spec = await this.extractAppSpec(assistantMessage, message);
    
    if (spec) {
      context.currentSpec = spec;
      context.appId = spec.id;
      
      return {
        response: assistantMessage,
        artifacts: [{ type: 'spec', content: spec }],
      };
    }

    return { response: assistantMessage };
  }

  /**
   * Extract structured app specification from LLM response
   */
  private async extractAppSpec(
    llmResponse: string,
    userMessage: string
  ): Promise<Partial<AppSpecification> | null> {
    const systemPrompt = `Extract a structured app specification from the conversation.
Generate a valid JSON object following this schema:
{
  "id": "unique_id",
  "name": "App Name",
  "description": "App description",
  "dataModels": [
    {
      "id": "model_id",
      "name": "ModelName",
      "fields": [
        {
          "name": "fieldName",
          "type": "string|number|boolean|date|email|url",
          "required": true,
          "unique": false
        }
      ],
      "relations": [],
      "indexes": [],
      "hooks": []
    }
  ],
  "screens": [
    {
      "id": "screen_id",
      "name": "Screen Name",
      "path": "/path",
      "type": "list|detail|form|dashboard",
      "components": [],
      "permissions": []
    }
  ],
  "workflows": [],
  "permissions": [],
  "integrations": []
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `User request: ${userMessage}\n\nLLM response: ${llmResponse}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    try {
      const spec = JSON.parse(completion.choices[0].message.content || '{}');
      return {
        ...spec,
        id: spec.id || nanoid(),
        version: '0.1.0',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Failed to parse app spec:', error);
      return null;
    }
  }

  /**
   * Handle app modification request
   */
  private async handleModifyApp(
    message: string,
    context: ConversationContext,
    intent: Intent
  ): Promise<{ response: string; artifacts?: any[] }> {
    if (!context.currentSpec) {
      return {
        response: "I don't have an active app to modify. Let's create a new app first, or please specify which app you'd like to modify.",
      };
    }

    const systemPrompt = `You are modifying an existing app specification.
Current spec: ${JSON.stringify(context.currentSpec, null, 2)}

The user wants to make changes. Analyze their request and:
1. Identify what needs to change
2. Generate the updated specification
3. Explain the changes clearly

Return both the explanation and the updated spec.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content || '';
    
    // Update the spec
    const updatedSpec = await this.extractAppSpec(response, message);
    if (updatedSpec) {
      context.currentSpec = {
        ...context.currentSpec,
        ...updatedSpec,
        updatedAt: new Date(),
      };
      
      return {
        response,
        artifacts: [{ type: 'spec', content: context.currentSpec }],
      };
    }

    return { response };
  }

  /**
   * Handle feature addition request
   */
  private async handleAddFeature(
    message: string,
    context: ConversationContext,
    intent: Intent
  ): Promise<{ response: string; artifacts?: any[] }> {
    // Similar to modify app, but more focused on adding new components/features
    return this.handleModifyApp(message, context, intent);
  }

  /**
   * Handle ML use case creation
   */
  private async handleCreateMLUseCase(
    message: string,
    context: ConversationContext,
    intent: Intent
  ): Promise<{ response: string; artifacts?: any[] }> {
    if (!context.appId) {
      return {
        response: "I need an app context to add ML capabilities. Please create or select an app first.",
      };
    }

    const systemPrompt = `You are an ML architect helping users add ML capabilities to their apps.

Available ML use cases:
- Churn prediction: Predict which users are likely to leave
- Lead scoring: Score leads by conversion likelihood
- Conversion optimization: Predict conversion probability
- Anomaly detection: Detect unusual patterns in usage
- Recommendation: Recommend content/products
- LTV prediction: Predict customer lifetime value
- Risk scoring: Assess risk levels

Analyze the user's request and:
1. Identify the ML use case
2. Suggest relevant features from their app data
3. Propose how to integrate insights back into the app
4. Explain the setup process

Return a structured response with the ML configuration.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `App context: ${JSON.stringify(context.currentSpec, null, 2)}\n\nRequest: ${message}` 
        },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content || '';

    // Extract ML use case config
    const mlUseCase = await this.extractMLUseCase(response, context);
    if (mlUseCase) {
      context.currentMLUseCase = mlUseCase;
      
      return {
        response,
        artifacts: [{ type: 'model', content: mlUseCase }],
      };
    }

    return { response };
  }

  /**
   * Extract ML use case configuration
   */
  private async extractMLUseCase(
    llmResponse: string,
    context: ConversationContext
  ): Promise<Partial<MLUseCase> | null> {
    const systemPrompt = `Extract ML use case configuration as JSON:
{
  "id": "unique_id",
  "name": "Use Case Name",
  "description": "Description",
  "category": "churn_prediction|lead_scoring|conversion_optimization|anomaly_detection|recommendation|ltv_prediction|risk_scoring",
  "config": {
    "targetVariable": "variable_to_predict",
    "features": ["feature1", "feature2"],
    "modelType": "automl|logistic_regression|random_forest|gradient_boosting",
    "trainingConfig": {
      "trainTestSplit": 0.8,
      "validationStrategy": "holdout",
      "evaluationMetrics": ["accuracy", "precision", "recall"]
    }
  }
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: llmResponse },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const mlConfig = JSON.parse(completion.choices[0].message.content || '{}');
      return {
        ...mlConfig,
        id: mlConfig.id || nanoid(),
        appId: context.appId,
        status: 'configuring' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Failed to parse ML use case:', error);
      return null;
    }
  }

  /**
   * Handle general queries
   */
  private async handleGeneralQuery(
    message: string,
    context: ConversationContext
  ): Promise<string> {
    const systemPrompt = `You are a helpful assistant for an AI app builder platform.
You help users create apps, add ML capabilities, and understand the platform.

Context: ${context.appId ? `Working on app: ${context.currentSpec?.name}` : 'No active app'}

Previous conversation:
${this.formatHistory(context.history.slice(-5))}

Answer the user's question helpfully and concisely.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content || 'I apologize, but I encountered an error processing your request.';
  }

  /**
   * Format conversation history for context
   */
  private formatHistory(messages: Message[]): string {
    return messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n\n');
  }

  /**
   * Get current conversation context
   */
  getContext(sessionId: string): ConversationContext | undefined {
    return this.contexts.get(sessionId);
  }

  /**
   * Clear conversation context
   */
  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
  }
}
