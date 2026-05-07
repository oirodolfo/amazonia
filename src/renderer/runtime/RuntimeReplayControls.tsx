import type {RuntimeReplayPlaybackState} from '@/shared/replay/runtime-replay-controller';

export interface RuntimeReplayControlsProps {
    readonly state: RuntimeReplayPlaybackState;
    readonly onPlay: () => void;
    readonly onPause: () => void;
    readonly onSpeedChange: (speed: number) => void;
}

/**
 * Renders replay transport controls.
 *
 * @param props - Replay transport state and callbacks.
 * @returns Replay controls.
 *
 * @example
 * ```tsx
 * <RuntimeReplayControls state={state} />
 * ```
 */
export function RuntimeReplayControls(
    props: RuntimeReplayControlsProps,
): React.Element {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/10 bg-black/40 p-3">
            <button
                className="rounded-xl border border-emerald-400/20 px-3 py-2 text-xs text-emerald-200"
                onClick={props.onPlay}
            >
                Play
            </button>

            <button
                className="rounded-xl border border-zinc-700 px-3 py-2 text-xs text-zinc-300"
                onClick={props.onPause}
            >
                Pause
            </button>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>Speed</span>

                <input
                    min={0.25}
                    max={4}
                    step={0.25}
                    type="range"
                    value={props.state.speed}
                    onChange={(event) => props.onSpeedChange(Number(event.target.value))}
                />
            </div>

            <div className="ml-auto text-xs text-zinc-500">
                Frame {props.state.currentFrame}
            </div>
        </div>
    );
}
