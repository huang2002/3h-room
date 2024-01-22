import { SSEController } from '3h-sse';
import { BackendAdaptorWithResponses, Timer } from './common';
import { EventEmitter } from 'events';

/**
 * Type of member-related timestamps.
 */
export interface MemberTimestamps {
    /**
     * The timestamp when the member is created.
     */
    created: number;
    /**
     * The timestamp when the member entered current room.
     */
    entered: number;
    /**
     * The latest timestamp when any content is sent to the member.
     */
    lastSent: number;
}
/** dts2md break */
/**
 * Type of options of {@link Member}.
 */
export interface MemberOptions<
    IdentityType,
    ResponseType,
    SSEControllerType extends SSEController<
        BackendAdaptorWithResponses<ResponseType>
    >,
> {
    /**
     * Unique identity.
     */
    identity: IdentityType;
    /**
     * Corresponding response object.
     * @default null
     */
    response?: ResponseType | null;
    /**
     * The SSE controller to use.
     * @default new SSEController()
     */
    sseController?: SSEControllerType;
    /**
     * Timer function.
     * @default Date.now
     */
    timer?: Timer;
}
/** dts2md break */
/**
 * Class of room members.
 * @event enter Emits right after the member enters a room.
 * The entered room will be provided as the only argument.
 * @event leave Emits right before the member leaves a room.
 * The left room will be provided as the only argument.
 */
export class Member<
    IdentityType = unknown,
    ResponseType = any,
    SSEControllerType extends SSEController<
        BackendAdaptorWithResponses<ResponseType>
    > = SSEController<BackendAdaptorWithResponses<ResponseType>>,
> extends EventEmitter {
    /** dts2md break */
    /**
     * Constructor of {@link Member}.
     */
    constructor(
        options: MemberOptions<IdentityType, ResponseType, SSEControllerType>,
    ) {
        super();
        this.identity = options.identity;
        this.sseController =
            options.sseController ?? (new SSEController() as SSEControllerType);
        this.timer = options.timer ?? Date.now;
        this.timestamps = {
            created: this.timer(),
            entered: NaN,
            lastSent: NaN,
        };
        if (options.response) {
            this.setResponse(options.response);
        }
    }
    /** dts2md break */
    /**
     * Unique identity.
     */
    identity: IdentityType;
    /** dts2md break */
    /**
     * Timer function.
     */
    timer: Timer;
    /** dts2md break */
    /**
     * Server-sent event controller.
     */
    sseController: SSEControllerType;
    /** dts2md break */
    /**
     * Member-related timestamps.
     */
    timestamps: MemberTimestamps;
    /** dts2md break */
    /**
     * Corresponding response object.
     */
    protected _response: ResponseType | null = null;
    /** dts2md break */
    /**
     * Corresponding response object.
     */
    get response() {
        return this._response;
    }
    /** dts2md break */
    /**
     * Update response object.
     */
    setResponse(newResponse: ResponseType | null) {
        const oldResponse = this._response;
        if (oldResponse) {
            this.sseController.backend?.removeResponse(oldResponse);
        }

        this._response = newResponse;
        if (newResponse) {
            this.sseController.backend?.addResponse(newResponse);
        }
    }
    /** dts2md break */
    /**
     * Send specific content as-is.
     */
    sendVerbatim(content: string) {
        const now = this.timer();
        this.sseController.sendVerbatim(content);
        this.timestamps.lastSent = now;
    }
    /** dts2md break */
    /**
     * Send an event with optional data.
     */
    sendEvent(name: string, data?: string) {
        const now = this.timer();
        this.sseController.sendEvent(name, data);
        this.timestamps.lastSent = now;
    }
}
