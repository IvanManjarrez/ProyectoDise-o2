import { Injectable } from '@nestjs/common';
import { CircuitBreakerRepository } from '../../domain/repositories/circuit-breaker.repository';
import { CircuitBreakerState } from '../../domain/entities/circuit-breaker-state.entity';

@Injectable()
export class InMemoryCircuitBreakerRepository implements CircuitBreakerRepository {
  private states = new Map<string, CircuitBreakerState>();

  async getState(serviceName: string): Promise<CircuitBreakerState> {
    const existing = this.states.get(serviceName);
    if (existing) {
      return existing;
    }
    
    const newState = CircuitBreakerState.create(serviceName);
    this.states.set(serviceName, newState);
    return newState;
  }

  async setState(state: CircuitBreakerState): Promise<void> {
    this.states.set(state.serviceName, state);
  }
}