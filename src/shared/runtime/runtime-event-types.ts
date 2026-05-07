export interface RuntimeTerminalEventPayload {
  readonly sessionId: string;
  readonly raw: string;
}

export interface RuntimeTimelineEventPayload {
  readonly timelineId: string;
  readonly durationMs: number;
}

export interface RuntimeGraphEventPayload {
  readonly nodeId: string;
  readonly edgeCount: number;
}

export type RuntimeKnownEventPayload =
  | RuntimeTerminalEventPayload
  | RuntimeTimelineEventPayload
  | RuntimeGraphEventPayload;
