# ScandalScope Architecture Analysis & Refactor Plan

## Current Architecture Issues

### 1. Tightly Coupled Modules

#### Store Dependencies
- `useStore.ts` (1,200+ lines) violates single responsibility principle
- Direct coupling between UI state, business logic, and data persistence
- Mixed concerns: theme management, user auth, analysis logic, and performance metrics

#### Analysis Service Issues
- `analysis.ts` contains multiple responsibilities:
  - API integration (Perspective API, OpenAI)
  - Business logic (scoring, risk calculation)
  - Mock data generation
  - UI utility functions
- Hard-coded API endpoints and configuration
- No clear separation between external services

#### Component Coupling
- Components directly import and use store selectors
- Business logic embedded in UI components
- No clear data flow boundaries

### 2. Violation of Separation of Concerns

#### Mixed Responsibilities
```typescript
// Current problematic pattern in useStore.ts
export const useStore = create<Store>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // UI State
        theme: 'dark',
        sidebarOpen: false,
        
        // Business Logic
        addToHistory: (analysis) => { /* complex logic */ },
        
        // External API concerns
        setLeaderboard: (leaderboard) => { /* API data */ },
        
        // Performance monitoring
        updateMetrics: (metrics) => { /* system metrics */ }
      }))
    )
  )
);
```

## Proposed Refactor Plan

### Phase 1: Service Layer Extraction

#### 1.1 Analysis Service Refactor
```typescript
// src/services/analysis/AnalysisService.ts
export interface AnalysisService {
  analyzeText(text: string, config?: AnalysisConfig): Promise<AnalysisResult>;
  validateInput(text: string): ValidationResult;
}

// src/services/analysis/providers/PerspectiveProvider.ts
export interface ToxicityProvider {
  analyzeToxicity(text: string): Promise<AnalysisCategories>;
}

// src/services/analysis/providers/OpenAIProvider.ts
export interface ContentGenerator {
  generateRoast(text: string, riskLevel: RiskLevel): Promise<string>;
  generateApology(text: string, riskLevel: RiskLevel): Promise<string>;
}
```

#### 1.2 Configuration Management
```typescript
// src/config/ApiConfig.ts
export interface ApiConfig {
  perspectiveApiKey: string;
  openaiApiKey: string;
  baseUrl: string;
  timeout: number;
  maxRetries: number;
}

// src/config/ConfigProvider.ts
export class ConfigProvider {
  private static instance: ConfigProvider;
  private config: ApiConfig;
  
  static getInstance(): ConfigProvider {
    if (!ConfigProvider.instance) {
      ConfigProvider.instance = new ConfigProvider();
    }
    return ConfigProvider.instance;
  }
  
  getConfig(): ApiConfig {
    return this.config;
  }
}
```

### Phase 2: Domain Model Separation

#### 2.1 Domain Entities
```typescript
// src/domain/entities/Analysis.ts
export class Analysis {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly score: CancelScore,
    public readonly categories: AnalysisCategories,
    public readonly timestamp: Date
  ) {}
  
  getRiskLevel(): RiskLevel {
    return this.score.getRiskLevel();
  }
  
  isHighRisk(): boolean {
    return this.score.value >= 70;
  }
}

// src/domain/valueObjects/CancelScore.ts
export class CancelScore {
  constructor(public readonly value: number) {
    if (value < 0 || value > 100) {
      throw new Error('Cancel score must be between 0 and 100');
    }
  }
  
  getRiskLevel(): RiskLevel {
    if (this.value < 20) return 'SAFE';
    if (this.value < 40) return 'MILD';
    if (this.value < 60) return 'MODERATE';
    if (this.value < 80) return 'HIGH';
    return 'EXTREME';
  }
}
```

#### 2.2 Repository Pattern
```typescript
// src/domain/repositories/AnalysisRepository.ts
export interface AnalysisRepository {
  save(analysis: Analysis): Promise<void>;
  findById(id: string): Promise<Analysis | null>;
  findByUserId(userId: string): Promise<Analysis[]>;
  findRecent(limit: number): Promise<Analysis[]>;
}

// src/infrastructure/repositories/LocalStorageAnalysisRepository.ts
export class LocalStorageAnalysisRepository implements AnalysisRepository {
  private readonly storageKey = 'scandalscope_analyses';
  
  async save(analysis: Analysis): Promise<void> {
    const analyses = await this.getAll();
    analyses.unshift(analysis);
    localStorage.setItem(this.storageKey, JSON.stringify(analyses.slice(0, 100)));
  }
  
  async findById(id: string): Promise<Analysis | null> {
    const analyses = await this.getAll();
    return analyses.find(a => a.id === id) || null;
  }
  
  private async getAll(): Promise<Analysis[]> {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data).map(this.deserialize) : [];
  }
  
  private deserialize(data: any): Analysis {
    return new Analysis(
      data.id,
      data.text,
      new CancelScore(data.score),
      data.categories,
      new Date(data.timestamp)
    );
  }
}
```

### Phase 3: Application Services

#### 3.1 Use Cases
```typescript
// src/application/useCases/AnalyzeTextUseCase.ts
export class AnalyzeTextUseCase {
  constructor(
    private analysisService: AnalysisService,
    private analysisRepository: AnalysisRepository,
    private eventBus: EventBus
  ) {}
  
  async execute(request: AnalyzeTextRequest): Promise<AnalyzeTextResponse> {
    // Validation
    const validation = this.analysisService.validateInput(request.text);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }
    
    // Analysis
    const result = await this.analysisService.analyzeText(
      request.text, 
      request.config
    );
    
    // Create domain entity
    const analysis = new Analysis(
      generateId(),
      request.text,
      new CancelScore(result.cancelScore),
      result.categories,
      new Date()
    );
    
    // Persist
    await this.analysisRepository.save(analysis);
    
    // Emit event
    this.eventBus.emit(new AnalysisCompletedEvent(analysis));
    
    return {
      analysis,
      roast: result.roast,
      apology: result.apology,
      recommendations: result.recommendations
    };
  }
}
```

#### 3.2 Event System
```typescript
// src/application/events/EventBus.ts
export interface EventBus {
  emit<T extends DomainEvent>(event: T): void;
  subscribe<T extends DomainEvent>(
    eventType: string, 
    handler: EventHandler<T>
  ): void;
}

// src/application/events/AnalysisEvents.ts
export class AnalysisCompletedEvent implements DomainEvent {
  constructor(
    public readonly analysis: Analysis,
    public readonly timestamp: Date = new Date()
  ) {}
  
  getEventType(): string {
    return 'AnalysisCompleted';
  }
}
```

### Phase 4: State Management Refactor

#### 4.1 Separated Stores
```typescript
// src/store/slices/AnalysisStore.ts
interface AnalysisState {
  current: Analysis | null;
  history: Analysis[];
  isAnalyzing: boolean;
}

interface AnalysisActions {
  setCurrent: (analysis: Analysis | null) => void;
  addToHistory: (analysis: Analysis) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
}

export const useAnalysisStore = create<AnalysisState & AnalysisActions>()(
  immer((set) => ({
    current: null,
    history: [],
    isAnalyzing: false,
    
    setCurrent: (analysis) => set((state) => {
      state.current = analysis;
    }),
    
    addToHistory: (analysis) => set((state) => {
      state.history.unshift(analysis);
      state.history = state.history.slice(0, 100);
    }),
    
    setAnalyzing: (isAnalyzing) => set((state) => {
      state.isAnalyzing = isAnalyzing;
    })
  }))
);

// src/store/slices/UIStore.ts
interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  showConfetti: boolean;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    immer((set) => ({
      theme: 'dark',
      sidebarOpen: false,
      showConfetti: false,
      
      setTheme: (theme) => set((state) => {
        state.theme = theme;
      }),
      
      toggleSidebar: () => set((state) => {
        state.sidebarOpen = !state.sidebarOpen;
      }),
      
      setShowConfetti: (show) => set((state) => {
        state.showConfetti = show;
      })
    })),
    { name: 'ui-store' }
  )
);
```

#### 4.2 Store Composition
```typescript
// src/store/RootStore.ts
export class RootStore {
  constructor(
    public readonly analysis: AnalysisStore,
    public readonly ui: UIStore,
    public readonly user: UserStore,
    public readonly leaderboard: LeaderboardStore
  ) {}
}

// src/store/StoreProvider.tsx
const StoreContext = createContext<RootStore | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useMemo(() => new RootStore(
    new AnalysisStore(),
    new UIStore(),
    new UserStore(),
    new LeaderboardStore()
  ), []);
  
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used within StoreProvider');
  return store;
};
```

### Phase 5: Dependency Injection

#### 5.1 Service Container
```typescript
// src/infrastructure/ServiceContainer.ts
export class ServiceContainer {
  private services = new Map<string, any>();
  
  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
  }
  
  resolve<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not registered`);
    }
    return factory();
  }
}

// src/infrastructure/ServiceRegistration.ts
export function registerServices(container: ServiceContainer): void {
  // Configuration
  container.register('config', () => ConfigProvider.getInstance());
  
  // External services
  container.register('perspectiveProvider', () => 
    new PerspectiveProvider(container.resolve('config'))
  );
  container.register('openaiProvider', () => 
    new OpenAIProvider(container.resolve('config'))
  );
  
  // Domain services
  container.register('analysisService', () => 
    new AnalysisServiceImpl(
      container.resolve('perspectiveProvider'),
      container.resolve('openaiProvider')
    )
  );
  
  // Repositories
  container.register('analysisRepository', () => 
    new LocalStorageAnalysisRepository()
  );
  
  // Use cases
  container.register('analyzeTextUseCase', () => 
    new AnalyzeTextUseCase(
      container.resolve('analysisService'),
      container.resolve('analysisRepository'),
      container.resolve('eventBus')
    )
  );
}
```

### Phase 6: Testing Strategy

#### 6.1 Unit Tests
```typescript
// src/domain/entities/__tests__/Analysis.test.ts
describe('Analysis', () => {
  it('should calculate risk level correctly', () => {
    const analysis = new Analysis(
      'test-id',
      'test text',
      new CancelScore(85),
      mockCategories,
      new Date()
    );
    
    expect(analysis.getRiskLevel()).toBe('HIGH');
    expect(analysis.isHighRisk()).toBe(true);
  });
});

// src/application/useCases/__tests__/AnalyzeTextUseCase.test.ts
describe('AnalyzeTextUseCase', () => {
  let useCase: AnalyzeTextUseCase;
  let mockAnalysisService: jest.Mocked<AnalysisService>;
  let mockRepository: jest.Mocked<AnalysisRepository>;
  let mockEventBus: jest.Mocked<EventBus>;
  
  beforeEach(() => {
    mockAnalysisService = createMockAnalysisService();
    mockRepository = createMockRepository();
    mockEventBus = createMockEventBus();
    
    useCase = new AnalyzeTextUseCase(
      mockAnalysisService,
      mockRepository,
      mockEventBus
    );
  });
  
  it('should analyze text and save result', async () => {
    const request = { text: 'test text', config: {} };
    const mockResult = createMockAnalysisResult();
    
    mockAnalysisService.analyzeText.mockResolvedValue(mockResult);
    
    const response = await useCase.execute(request);
    
    expect(mockRepository.save).toHaveBeenCalled();
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      expect.any(AnalysisCompletedEvent)
    );
    expect(response.analysis).toBeDefined();
  });
});
```

#### 6.2 Integration Tests
```typescript
// src/__tests__/integration/AnalysisFlow.test.ts
describe('Analysis Flow Integration', () => {
  let container: ServiceContainer;
  
  beforeEach(() => {
    container = new ServiceContainer();
    registerTestServices(container);
  });
  
  it('should complete full analysis flow', async () => {
    const useCase = container.resolve<AnalyzeTextUseCase>('analyzeTextUseCase');
    const repository = container.resolve<AnalysisRepository>('analysisRepository');
    
    const result = await useCase.execute({
      text: 'This is a test message',
      config: { includeRoast: true }
    });
    
    expect(result.analysis).toBeDefined();
    
    const saved = await repository.findById(result.analysis.id);
    expect(saved).toEqual(result.analysis);
  });
});
```

## Implementation Timeline

### Week 1-2: Foundation
- [ ] Extract configuration management
- [ ] Create service interfaces
- [ ] Implement basic dependency injection

### Week 3-4: Domain Layer
- [ ] Create domain entities and value objects
- [ ] Implement repository pattern
- [ ] Add domain events

### Week 5-6: Application Layer
- [ ] Implement use cases
- [ ] Create event system
- [ ] Add application services

### Week 7-8: Infrastructure
- [ ] Refactor external service integrations
- [ ] Implement concrete repositories
- [ ] Update API clients

### Week 9-10: State Management
- [ ] Split monolithic store
- [ ] Implement store composition
- [ ] Add proper selectors

### Week 11-12: Testing & Polish
- [ ] Add comprehensive test suite
- [ ] Performance optimization
- [ ] Documentation updates

## Benefits of Refactor

### 1. Improved Testability
- Clear interfaces enable easy mocking
- Separated concerns allow focused unit tests
- Dependency injection enables test doubles

### 2. Better Maintainability
- Single responsibility principle
- Clear module boundaries
- Reduced coupling between components

### 3. Enhanced Scalability
- Easy to add new analysis providers
- Pluggable architecture for new features
- Clear extension points

### 4. Improved Developer Experience
- Better IDE support with clear interfaces
- Easier onboarding for new developers
- Clear separation of concerns

## Migration Strategy

### 1. Gradual Migration
- Implement new architecture alongside existing code
- Migrate components one by one
- Maintain backward compatibility during transition

### 2. Feature Flags
- Use feature flags to toggle between old and new implementations
- Gradual rollout to users
- Easy rollback if issues arise

### 3. Parallel Development
- New features use new architecture
- Legacy features gradually migrated
- Clear migration path for each module

This refactor plan transforms ScandalScope from a tightly coupled monolith into a well-structured, testable, and maintainable application following clean architecture principles.