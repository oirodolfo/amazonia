export type LocaleKey = 'en' | 'pt-BR';
export type MessageKey =
  | 'app.title'
  | 'sidebar.openWorkspace'
  | 'sidebar.searchPlaceholder'
  | 'terminal.emptyTitle'
  | 'terminal.restore'
  | 'output.title'
  | 'output.noRuns'
  | 'output.timeline'
  | 'graph.title'
  | 'graph.empty'
  | 'command.placeholder'
  | 'command.actions'
  | 'command.packages';

export const MESSAGES: Record<LocaleKey, Record<MessageKey, string>> = {
  en: {
    'app.title': 'Curupira Workbench',
    'sidebar.openWorkspace': 'Open Workspace',
    'sidebar.searchPlaceholder': 'Search actions and packages',
    'terminal.emptyTitle': 'Open a workspace or start a shell',
    'terminal.restore': 'Restore terminals',
    'output.title': 'Friendly Output',
    'output.noRuns': 'Run an action to see status cards here.',
    'output.timeline': 'Run Timeline',
    'graph.title': 'Action Graph',
    'graph.empty': 'Open a workspace to map packages and actions.',
    'command.placeholder': 'Search actions, packages, commands...',
    'command.actions': 'Actions',
    'command.packages': 'Packages',
  },
  'pt-BR': {
    'app.title': 'Curupira Workbench',
    'sidebar.openWorkspace': 'Abrir workspace',
    'sidebar.searchPlaceholder': 'Buscar actions e packages',
    'terminal.emptyTitle': 'Abra um workspace ou inicie um shell',
    'terminal.restore': 'Restaurar terminais',
    'output.title': 'Output amigável',
    'output.noRuns': 'Execute uma action para ver cards de status aqui.',
    'output.timeline': 'Timeline de runs',
    'graph.title': 'Grafo de actions',
    'graph.empty': 'Abra um workspace para mapear packages e actions.',
    'command.placeholder': 'Buscar actions, packages, comandos...',
    'command.actions': 'Actions',
    'command.packages': 'Packages',
  },
};

/**
 * Resolves a localized UI message.
 *
 * @param key - Message key.
 * @param locale - Desired locale.
 * @returns A translated message with English fallback.
 *
 * @example
 * ```ts
 * t('sidebar.openWorkspace', 'pt-BR') // 'Abrir workspace'
 * ```
 */
export function t(key: MessageKey, locale: LocaleKey = 'en'): string {
  return MESSAGES[locale]?.[key] ?? MESSAGES.en[key];
}
