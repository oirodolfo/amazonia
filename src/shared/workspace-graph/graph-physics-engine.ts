export interface GraphPhysicsVector {
  readonly x: number;
  readonly y: number;
}

export interface GraphPhysicsEngineNode {
  readonly id: string;
  readonly position: GraphPhysicsVector;
  readonly velocity: GraphPhysicsVector;
  readonly mass: number;
}

export interface GraphPhysicsSimulationFrame {
  readonly nodes: readonly GraphPhysicsEngineNode[];
  readonly tick: number;
}

/**
 * Advances graph physics nodes with a lightweight deterministic simulation.
 *
 * @param frame - Current simulation frame.
 * @returns Updated simulation frame.
 *
 * @example
 * ```ts
 * advanceGraphPhysicsSimulation(frame)
 * ```
 */
export function advanceGraphPhysicsSimulation(
  frame: GraphPhysicsSimulationFrame,
): GraphPhysicsSimulationFrame {
  return {
    tick: frame.tick + 1,
    nodes: frame.nodes.map((node) => ({
      ...node,
      position: {
        x: node.position.x + node.velocity.x,
        y: node.position.y + node.velocity.y,
      },
    })),
  };
}
