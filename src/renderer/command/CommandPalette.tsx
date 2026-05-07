import { Command } from '@cmdk/react';
import type { WorkspaceAction } from '@/shared/actions/action-types';

export interface CommandPaletteProps {
  readonly open: boolean;
  readonly actions: readonly WorkspaceAction[];
  readonly onOpenChange: (open: boolean) => void;
  readonly onRunAction: (actionId: string) => void;
  readonly t: (key: string) => string;
}

/**
 * Renders the Ctrl+K command palette for packages and actions.
 *
 * @param props - Palette state and actions.
 * @returns Command palette element.
 *
 * @example
 * ```tsx
 * <CommandPalette open={open} actions={actions} onRunAction={runAction} />
 * ```
 */
export function CommandPalette(props: CommandPaletteProps): JSX.Element | null {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-[10vh] backdrop-blur-md" onClick={() => props.onOpenChange(false)}>
      <Command className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-emerald-400/20 bg-zinc-950 shadow-2xl shadow-emerald-950/40" onClick={(event) => event.stopPropagation()}>
        <Command.Input className="w-full border-b border-emerald-400/10 bg-transparent px-5 py-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" placeholder={props.t('command.placeholder')} />
        <Command.List className="max-h-[55vh] overflow-auto p-2">
          <Command.Empty className="p-6 text-center text-sm text-zinc-500">{props.t('command.empty')}</Command.Empty>
          <Command.Group heading={props.t('command.actions')} className="text-xs text-zinc-500">
            {props.actions.map((action) => (
              <Command.Item key={action.id} value={`${action.packageName} ${action.name} ${action.command}`} className="flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-sm text-zinc-300 aria-selected:bg-emerald-400/10 aria-selected:text-emerald-50" onSelect={() => { props.onRunAction(action.id); props.onOpenChange(false); }}>
                <span><span className="block font-medium">{action.name}</span><span className="block text-xs text-zinc-500">{action.packageName}</span></span>
                <span className="rounded-lg border border-emerald-400/10 px-2 py-1 text-[10px] uppercase tracking-wider text-emerald-300">{action.tool}</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
