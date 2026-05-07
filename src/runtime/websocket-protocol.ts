import type {TerminalInputMessage, TerminalResizeMessage, TerminalSpawnRequest} from '@/shared/types';

export type WebSocketClientMessage =
    | { readonly type: 'workspace:scan'; readonly rootPath: string; readonly requestId: string }
    | { readonly type: 'terminal:spawn'; readonly request: TerminalSpawnRequest; readonly requestId: string }
    | { readonly type: 'terminal:input'; readonly message: TerminalInputMessage; readonly requestId: string }
    | { readonly type: 'terminal:resize'; readonly message: TerminalResizeMessage; readonly requestId: string }
    | { readonly type: 'terminal:kill'; readonly tabId: string; readonly requestId: string }
    | { readonly type: 'ping'; readonly requestId: string };

export interface ProtocolValidationResult {
    readonly valid: boolean;
    readonly reason?: string;
}

/**
 * Validates the small WebSocket protocol used by Web mode before dispatching it to host services.
 *
 * @param message - Unknown JSON payload received from the browser.
 * @returns A validation result with a human-readable reason when invalid.
 *
 * @example
 * ```ts
 * validateClientMessage({ type: 'ping', requestId: '1' }).valid;
 * // => true
 * ```
 */
export function validateClientMessage(message: unknown): ProtocolValidationResult {
    if (!isRecord(message)) return {valid: false, reason: 'Message must be an object.'};
    if (typeof message.type !== 'string') return {valid: false, reason: 'Message type is required.'};
    if (typeof message.requestId !== 'string' || message.requestId.length === 0) return {
        valid: false,
        reason: 'Request id is required.'
    };

    if (message.type === 'workspace:scan') return typeof message.rootPath === 'string' ? {valid: true} : {
        valid: false,
        reason: 'Workspace root path is required.'
    };
    if (message.type === 'terminal:spawn') return isRecord(message.request) && typeof message.request.tabId === 'string' ? {valid: true} : {
        valid: false,
        reason: 'Terminal spawn request is invalid.'
    };
    if (message.type === 'terminal:input') return isRecord(message.message) && typeof message.message.tabId === 'string' ? {valid: true} : {
        valid: false,
        reason: 'Terminal input message is invalid.'
    };
    if (message.type === 'terminal:resize') return isRecord(message.message) && typeof message.message.cols === 'number' ? {valid: true} : {
        valid: false,
        reason: 'Terminal resize message is invalid.'
    };
    if (message.type === 'terminal:kill') return typeof message.tabId === 'string' ? {valid: true} : {
        valid: false,
        reason: 'Terminal kill tab id is required.'
    };
    if (message.type === 'ping') return {valid: true};

    return {valid: false, reason: `Unsupported message type: ${message.type}.`};
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}
