import { BackendAdaptor } from '3h-sse';

/**
 * Type of timer function that returns current timestamp.
 */
export type Timer = () => number;
/** dts2md break */
/**
 * Backend adaptor with responses.
 */
export interface BackendAdaptorWithResponses<ResponseType = unknown> extends BackendAdaptor {
    addResponse(response: ResponseType): void;
    removeResponse(response: ResponseType): void;
}
