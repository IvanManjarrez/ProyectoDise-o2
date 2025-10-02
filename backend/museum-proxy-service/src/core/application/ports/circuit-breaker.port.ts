import { CircuitBreakerState } from '../../domain/entities/circuit-breaker-state.entity';

export interface CircuitBreakerPort {
  getState(serviceName: string): Promise<CircuitBreakerState>;
  setState(state: CircuitBreakerState): Promise<void>;
  executeWithBreaker<T>(serviceName: string, operation: () => Promise<T>): Promise<T>;
}