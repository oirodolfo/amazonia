import {createOpenTarget} from '@/shared/openers/open-targets';
import type {ParsedOutputLink} from '@/shared/output/output-parser';

export interface OutputLinkOpener {
    openTarget(target: ReturnType<typeof createOpenTarget>): Promise<boolean>;
}

/**
 * Opens a friendly output link through the preload opener API.
 *
 * @param opener - Renderer-safe opener API.
 * @param link - Parsed output link.
 * @returns Whether the opener accepted the target.
 *
 * @example
 * ```ts
 * await openFriendlyOutputLink(window.workbench!.openers, link)
 * ```
 */
export async function openFriendlyOutputLink(
    opener: OutputLinkOpener,
    link: ParsedOutputLink,
): Promise<boolean> {
    return opener.openTarget(createOpenTarget(link));
}
