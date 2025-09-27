import { Injectable } from '@nestjs/common';
import { CircuitBreakerPort } from '../../application/ports/circuit-breaker.port';
import { CircuitBreakerState, CircuitState } from '../../domain/entities/circuit-breaker-state.entity';

@Injectable()
export class CircuitBreakerService implements CircuitBreakerPort {
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

  async executeWithBreaker<T>(serviceName: string, operation: () => Promise<T>): Promise<T> {
    const state = await this.getState(serviceName);
    
    if (!state.canAttempt()) {
      throw new Error(`Circuit breaker is OPEN for ${serviceName}. Service unavailable.`);
    }

    try {
      const result = await operation();
      
      // Record success
      if (state.state !== CircuitState.CLOSED) {
        const newState = state.recordSuccess();
        await this.setState(newState);
      }
      
      return result;
    } catch (error) {
      // Record failure
      const newState = state.recordFailure();
      await this.setState(newState);
      throw error;
    }
  }
}