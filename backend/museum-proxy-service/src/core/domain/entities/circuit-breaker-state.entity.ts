export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export class CircuitBreakerState {
  constructor(
    public readonly serviceName: string,
    public readonly state: CircuitState = CircuitState.CLOSED,
    public readonly failureCount: number = 0,
    public readonly lastFailureTime?: Date,
    public readonly nextAttemptTime?: Date
  ) {}

  static create(serviceName: string): CircuitBreakerState {
    return new CircuitBreakerState(serviceName);
  }

  recordFailure(): CircuitBreakerState {
    const newFailureCount = this.failureCount + 1;
    const now = new Date();
    
    if (newFailureCount >= 5) {
      const nextAttempt = new Date(now.getTime() + 30000); // 30 seconds
      return new CircuitBreakerState(
        this.serviceName,
        CircuitState.OPEN,
        newFailureCount,
        now,
        nextAttempt
      );
    }
    
    return new CircuitBreakerState(
      this.serviceName,
      this.state,
      newFailureCount,
      now,
      this.nextAttemptTime
    );
  }

  recordSuccess(): CircuitBreakerState {
    return new CircuitBreakerState(this.serviceName);
  }

  canAttempt(): boolean {
    if (this.state === CircuitState.CLOSED) return true;
    if (this.state === CircuitState.OPEN && this.nextAttemptTime) {
      return new Date() >= this.nextAttemptTime;
    }
    return this.state === CircuitState.HALF_OPEN;
  }
}