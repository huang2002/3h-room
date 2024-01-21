import { BackendAdaptor } from '3h-sse';

/**
 * Type of timer function that returns current timestamp.
 */
export type Timer = () => number;
/** dts2md break */
/**
 * Backend adaptor with responses.
 */
export interface BackendAdaptorWithResponses<ResponseType = unknown>
    extends BackendAdaptor {
    addResponse(response: ResponseType): void;
    removeResponse(response: ResponseType): void;
}
/** dts2md break */
/**
 * An EventEmitter interface with events well typed.
 */
export interface TypedEventEmitter<
    EventMap extends Record<string | symbol, any[]>,
> {
    emit<T extends keyof EventMap>(event: T, ...args: EventMap[T]): boolean;
    addListener<T extends keyof EventMap>(
        event: T,
        callback: (...args: EventMap[T]) => void,
    ): this;
    on<T extends keyof EventMap>(
        event: T,
        callback: (...args: EventMap[T]) => void,
    ): this;
    removeListener<T extends keyof EventMap>(
        event: T,
        callback: (...args: EventMap[T]) => void,
    ): this;
    off<T extends keyof EventMap>(
        event: T,
        callback: (...args: EventMap[T]) => void,
    ): this;
    once<T extends keyof EventMap>(
        event: T,
        callback: (...args: EventMap[T]) => void,
    ): this;
}
