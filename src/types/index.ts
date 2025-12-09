/**
 * Core type definitions for Synthora platform
 * These represent the intermediate representation of apps, data models, and ML components
 */

// ============================================
// App Specification Types
// ============================================

export interface AppSpecification {
  id: string;
  name: string;
  description: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  dataModels: DataModel[];
  screens: Screen[];
  workflows: Workflow[];
  permissions: PermissionRule[];
  integrations: Integration[];
}

// Data Models
export interface DataModel {
  id: string;
  name: string;
  description?: string;
  fields: Field[];
  relations: Relation[];
  indexes: Index[];
  hooks: DataHook[];
}

export interface Field {
  name: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  defaultValue?: any;
  validation?: ValidationRule[];
  description?: string;
}

export type FieldType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'email'
  | 'url'
  | 'json'
  | 'array'
  | 'reference';

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'custom';
  value: any;
  message: string;
}

export interface Relation {
  type: 'oneToOne' | 'oneToMany' | 'manyToMany';
  targetModel: string;
  foreignKey?: string;
  onDelete?: 'cascade' | 'setNull' | 'restrict';
}

export interface Index {
  fields: string[];
  unique: boolean;
}

export interface DataHook {
  event: 'beforeCreate' | 'afterCreate' | 'beforeUpdate' | 'afterUpdate' | 'beforeDelete' | 'afterDelete';
  action: string; // Function name or workflow ID
}

// Screens & UI
export interface Screen {
  id: string;
  name: string;
  path: string;
  type: ScreenType;
  layout: Layout;
  components: Component[];
  permissions: string[];
  tracking: TrackingConfig;
}

export type ScreenType = 
  | 'list'
  | 'detail'
  | 'form'
  | 'dashboard'
  | 'custom';

export interface Layout {
  type: 'single' | 'split' | 'grid' | 'flex';
  sections: LayoutSection[];
}

export interface LayoutSection {
  id: string;
  grid?: { cols: number; rows: number };
  components: string[]; // Component IDs
}

export interface Component {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  dataSource?: DataSource;
  events?: ComponentEvent[];
  mlIntegration?: MLIntegration;
}

export type ComponentType =
  | 'text'
  | 'input'
  | 'button'
  | 'table'
  | 'chart'
  | 'form'
  | 'card'
  | 'list'
  | 'kanban'
  | 'calendar'
  | 'mlWidget'; // Special ML-powered components

export interface DataSource {
  type: 'model' | 'api' | 'mlModel';
  source: string;
  filters?: Filter[];
  sort?: Sort[];
  limit?: number;
}

export interface Filter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

export interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ComponentEvent {
  trigger: 'click' | 'change' | 'submit' | 'load';
  action: EventAction;
}

export interface EventAction {
  type: 'navigate' | 'apiCall' | 'workflow' | 'mlPrediction';
  target: string;
  params?: Record<string, any>;
}

// Workflows
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  enabled: boolean;
}

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'webhook' | 'mlThreshold';
  config: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  type: 'condition' | 'action' | 'mlPrediction' | 'loop';
  config: Record<string, any>;
  nextStep?: string | ConditionalNext;
}

export interface ConditionalNext {
  condition: string;
  trueStep: string;
  falseStep: string;
}

// Permissions
export interface PermissionRule {
  id: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  roles: string[];
  condition?: string;
}

// Integrations
export interface Integration {
  id: string;
  type: 'email' | 'slack' | 'stripe' | 'custom';
  config: Record<string, any>;
  credentials?: Record<string, string>;
}

// ============================================
// Event & Data Layer Types
// ============================================

export interface Event {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  appId: string;
  type: EventType;
  screenId?: string;
  componentId?: string;
  properties: Record<string, any>;
}

export type EventType =
  | 'page_view'
  | 'component_click'
  | 'form_submit'
  | 'api_call'
  | 'error'
  | 'custom';

export interface TrackingConfig {
  autoTrack: boolean;
  customEvents?: CustomEvent[];
}

export interface CustomEvent {
  name: string;
  trigger: string;
  properties: string[];
}

export interface Feature {
  name: string;
  type: 'numerical' | 'categorical' | 'boolean' | 'timestamp';
  source: FeatureSource;
  transformation?: string;
  description?: string;
}

export interface FeatureSource {
  type: 'event' | 'model' | 'derived';
  query: string;
  aggregation?: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'last';
  timeWindow?: string;
}

// ============================================
// ML Platform Types
// ============================================

export interface MLUseCase {
  id: string;
  name: string;
  description: string;
  category: MLCategory;
  templateId?: string;
  appId: string;
  config: MLConfig;
  status: MLStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type MLCategory =
  | 'churn_prediction'
  | 'lead_scoring'
  | 'conversion_optimization'
  | 'anomaly_detection'
  | 'recommendation'
  | 'ltv_prediction'
  | 'risk_scoring'
  | 'custom';

export type MLStatus =
  | 'configuring'
  | 'training'
  | 'deployed'
  | 'failed'
  | 'archived';

export interface MLConfig {
  targetVariable: string;
  features: string[];
  modelType: ModelType;
  hyperparameters?: Record<string, any>;
  trainingConfig: TrainingConfig;
  deploymentConfig: DeploymentConfig;
}

export type ModelType =
  | 'automl'
  | 'logistic_regression'
  | 'random_forest'
  | 'gradient_boosting'
  | 'neural_network'
  | 'custom';

export interface TrainingConfig {
  dataSource: string;
  trainTestSplit: number;
  validationStrategy: 'holdout' | 'cv' | 'timeseries';
  evaluationMetrics: string[];
}

export interface DeploymentConfig {
  endpoint: string;
  autoscaling: boolean;
  monitoring: MonitoringConfig;
  retrainingTrigger?: RetrainingTrigger;
}

export interface MonitoringConfig {
  latencyThreshold: number;
  errorRateThreshold: number;
  driftDetection: boolean;
  alertChannels: string[];
}

export interface RetrainingTrigger {
  type: 'schedule' | 'drift' | 'performance' | 'manual';
  config: Record<string, any>;
}

export interface MLModel {
  id: string;
  useCaseId: string;
  version: number;
  algorithm: string;
  features: string[];
  metrics: ModelMetrics;
  artifacts: ModelArtifacts;
  deployedAt?: Date;
  status: 'training' | 'ready' | 'deployed' | 'archived';
}

export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  mae?: number;
  rmse?: number;
  custom?: Record<string, number>;
}

export interface ModelArtifacts {
  modelPath: string;
  featureImportance?: Record<string, number>;
  confusionMatrix?: number[][];
  metadata: Record<string, any>;
}

export interface Prediction {
  id: string;
  modelId: string;
  timestamp: Date;
  input: Record<string, any>;
  output: any;
  confidence?: number;
  latency: number;
}

// ============================================
// Insight Integration Types
// ============================================

export interface MLIntegration {
  modelId: string;
  displayType: 'badge' | 'score' | 'recommendation' | 'chart' | 'alert';
  config: IntegrationConfig;
  refreshInterval?: number;
}

export interface IntegrationConfig {
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  threshold?: number;
  formatting?: FormattingRule;
}

export interface FormattingRule {
  type: 'percentage' | 'currency' | 'custom';
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  modelId: string;
  condition: RuleCondition;
  actions: RuleAction[];
  enabled: boolean;
}

export interface RuleCondition {
  field: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
  value: any;
}

export interface RuleAction {
  type: 'email' | 'notification' | 'webhook' | 'workflow' | 'updateField';
  config: Record<string, any>;
}

export interface Dashboard {
  id: string;
  appId: string;
  name: string;
  widgets: Widget[];
  layout: DashboardLayout;
}

export interface Widget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'funnel' | 'cohort' | 'mlInsight';
  dataSource: DataSource;
  config: Record<string, any>;
}

export interface DashboardLayout {
  columns: number;
  widgets: WidgetPosition[];
}

export interface WidgetPosition {
  widgetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================
// Conversation Orchestrator Types
// ============================================

export interface ConversationContext {
  sessionId: string;
  userId: string;
  appId?: string;
  history: Message[];
  currentSpec?: Partial<AppSpecification>;
  currentMLUseCase?: Partial<MLUseCase>;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  artifacts?: Artifact[];
}

export interface Artifact {
  type: 'spec' | 'code' | 'model' | 'chart';
  content: any;
}

export interface Intent {
  type: IntentType;
  confidence: number;
  entities: Record<string, any>;
}

export type IntentType =
  | 'create_app'
  | 'modify_app'
  | 'add_feature'
  | 'create_ml_usecase'
  | 'deploy_model'
  | 'view_insights'
  | 'configure_integration'
  | 'question'
  | 'other';
