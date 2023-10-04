/**
 * Raised when duplicate identities occur.
 */
export class DuplicateIdentityError extends Error {
    constructor(identity: unknown) {
        super('duplicate identity: ' + identity);
    }
}
/** dts2md break */
/**
 * Raised when specific member cannot be found.
 */
export class MemberNotFoundError extends Error {
    constructor(identity: unknown) {
        super('member identity not found: ' + identity);
    }
}
/** dts2md break */
/**
 * Raised when max member count exceeded.
 */
export class MemberOverflowError extends Error {
    constructor(identity: unknown) {
        super('max member count exceeded. new member identity: ' + identity);
    }
}
