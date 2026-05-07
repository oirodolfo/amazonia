/**
 * Simple intelligent ranking based on frequency + recency.
 */
export interface ActionStats {
  id: string;
  frequency: number;
  lastUsedAt: number;
}

export function rankActions(actions: ActionStats[]): ActionStats[] {
  return [...actions].sort((a, b) => {
    const scoreA = a.frequency * 2 + a.lastUsedAt / 1e12;
    const scoreB = b.frequency * 2 + b.lastUsedAt / 1e12;
    return scoreB - scoreA;
  });
}
