import * as React from 'react';
import type { WorkspaceAction, WorkspaceManifest } from '@/shared';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/renderer/components/ui';
import { t } from '@/renderer/i18n/messages';

interface CommandPaletteProps {
  readonly open: boolean;
  readonly workspace: WorkspaceManifest | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly onRunAction: (action: WorkspaceAction) => void;
}

export function CommandPalette({ open, workspace, onOpenChange, onRunAction }: CommandPaletteProps): React.ReactElement | null {
  React.useEffect(() => {
    const handler = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onOpenChange, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-24 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <Command className="w-[720px] overflow-hidden rounded-2xl border border-emerald-300/20 bg-zinc-950 shadow-[0_0_80px_rgba(16,185,129,.18)]" onClick={(event) => event.stopPropagation()}>
        <CommandInput className="w-full border-b border-white/10 bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-zinc-600" placeholder={t('command.placeholder')} />
        <CommandList className="max-h-[460px] overflow-auto p-2">
          <CommandGroup heading={t('command.actions')}>
            {workspace?.actions.map((action) => (
              <CommandItem key={action.id} value={`${action.packageName} ${action.label} ${action.command}`} onSelect={() => { onRunAction(action); onOpenChange(false); }} className="cursor-pointer rounded-xl px-3 py-2 text-sm text-zinc-300 data-[selected=true]:bg-emerald-400/10 data-[selected=true]:text-emerald-100">
                <span>{action.packageName}</span><span className="mx-2 text-zinc-600">›</span><span>{action.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
