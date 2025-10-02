import { CircuitBreakerState } from '../entities/circuit-breaker-state.entity';

export interface CircuitBreakerRepository {
  getState(serviceName: string): Promise<CircuitBreakerState>;
  setState(state: CircuitBreakerState): Promise<void>;
}