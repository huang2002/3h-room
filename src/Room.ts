import { SSEController } from '3h-sse';
import { Member } from './Member';
import { BackendAdaptorWithResponses, Timer } from './common';
import {
    DuplicateIdentityError,
    MemberNotFoundError,
    MemberOverflowError,
} from './errors';
import EventEmitter from 'events';

/**
 * Type of room-related timestamps.
 */
export interface RoomTimestamps {
    /**
     * The timestamp when the room is created.
     */
    created: number;
    /**
     * The latest timestamp when any broadcast content is sent.
     */
    lastSent: number;
}
/** dts2md break */
/**
 * Type of options of {@link Room}.
 */
export interface RoomOptions<
    ResponseType,
    SSEControllerType extends SSEController<
        BackendAdaptorWithResponses<ResponseType>
    >,
> {
    /**
     * Max member count.
     */
    maxMemberCount: number;
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
 * Class of SSE rooms.
 * @event enter Emits right after a member enters the room.
 * The entered member will be provided as the only argument.
 * @event leave Emits right before a member leaves the room.
 * The left member will be provided as the only argument.
 */
export class Room<
    IdentityType = any,
    ResponseType = any,
    MemberType extends Member<IdentityType, ResponseType> = Member<
        IdentityType,
        ResponseType
    >,
    SSEControllerType extends SSEController<
        BackendAdaptorWithResponses<ResponseType>
    > = SSEController<BackendAdaptorWithResponses<ResponseType>>,
> extends EventEmitter {
    /** dts2md break */
    /**
     * Constructor of {@link Room}.
     */
    constructor(options: RoomOptions<ResponseType, SSEControllerType>) {
        super();
        this.maxMemberCount = options.maxMemberCount;
        this.sseController =
            options.sseController ?? (new SSEController() as SSEControllerType);
        this.timer = options?.timer ?? Date.now;
        this.timestamps = {
            created: this.timer(),
            lastSent: NaN,
        };
    }
    /** dts2md break */
    /**
     * Max member count.
     */
    maxMemberCount: number;
    /** dts2md break */
    /**
     * Server-sent event controller.
     */
    sseController: SSEControllerType;
    /** dts2md break */
    /**
     * Timer function.
     */
    readonly timer: Timer;
    /** dts2md break */
    /**
     * Room-related timestamps.
     */
    timestamps: RoomTimestamps;
    /** dts2md break */
    /**
     * Members in current room.
     */
    members: Map<IdentityType, MemberType> = new Map();
    /** dts2md break */
    /**
     * Add a member to the room.
     */
    addMember(member: MemberType) {
        const now = this.timer();

        const { members } = this;
        if (members.has(member.identity)) {
            throw new DuplicateIdentityError(member.identity);
        }
        if (members.size >= this.maxMemberCount) {
            throw new MemberOverflowError(member.identity);
        }

        members.set(member.identity, member);
        if (member.response) {
            this.sseController.backend?.addResponse(member.response);
        }

        member.timestamps.entered = now;

        member.emit('enter', this);
        this.emit('enter', member);
    }
    /** dts2md break */
    /**
     * Remove a member from the room.
     */
    removeMember(member: MemberType) {
        const { members } = this;
        if (!members.has(member.identity)) {
            throw new MemberNotFoundError(member.identity);
        }

        this.emit('leave', member);
        member.emit('leave', this);

        members.delete(member.identity);
        if (member.response) {
            this.sseController.backend?.removeResponse(member.response);
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
