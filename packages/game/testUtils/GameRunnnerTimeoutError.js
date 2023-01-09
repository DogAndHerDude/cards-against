export class GameRunnerTimeoutError extends Error {
    constructor(timeout, eventsTrace) {
        super(`GameRunner timed out after ${timeout}ms`);
        this.eventsTrace = eventsTrace;
        this.events = [];
        this.events = eventsTrace.map(({ event }) => event);
    }
}
