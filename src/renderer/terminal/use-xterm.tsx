import {
    type IDisposable,
    type ITerminalAddon,
    type ITerminalInitOnlyOptions,
    type ITerminalOptions,
    Terminal,
} from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import {
    type ComponentPropsWithoutRef,
    type RefCallback,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

export interface UseXTermListeners {
    readonly onBinary?: (data: string) => void;
    readonly onCursorMove?: () => void;
    readonly onData?: (data: string) => void;
    readonly onKey?: (event: { readonly key: string; readonly domEvent: KeyboardEvent }) => void;
    readonly onLineFeed?: () => void;
    readonly onScroll?: (newPosition: number) => void;
    readonly onSelectionChange?: () => void;
    readonly onRender?: (event: { readonly start: number; readonly end: number }) => void;
    readonly onResize?: (event: { readonly cols: number; readonly rows: number }) => void;
    readonly onTitleChange?: (newTitle: string) => void;
    readonly customKeyEventHandler?: (event: KeyboardEvent) => boolean;
}

export interface UseXTermProps {
    readonly addons?: readonly ITerminalAddon[];
    readonly autoFocus?: boolean;
    readonly options?: ITerminalOptions & ITerminalInitOnlyOptions;
    readonly listeners?: UseXTermListeners;
    readonly onTerminalReady?: (terminal: Terminal) => void;
    readonly onTerminalDisposed?: () => void;
}

export interface UseXTermResult {
    readonly ref: RefCallback<HTMLDivElement>;
    readonly host: HTMLDivElement | null;
    readonly instance: Terminal | null;
}

/**
 * Creates a managed xterm instance for React components.
 *
 * @param props - Terminal options, addons and listener callbacks.
 * @returns Terminal host ref and live terminal instance.
 *
 * @example
 * ```tsx
 * const { ref, instance } = useXTerm({
 *   listeners: {
 *     onData: (data) => writeToPty(data),
 *   },
 * });
 * ```
 */
export function useXTerm(props: UseXTermProps = {}): UseXTermResult {
    const {
        addons,
        autoFocus = true,
        listeners,
        onTerminalDisposed,
        onTerminalReady,
        options,
    } = props;

    const listenersRef = useRef<UseXTermListeners | undefined>(listeners);
    const readyRef = useRef<typeof onTerminalReady>(onTerminalReady);
    const disposedRef = useRef<typeof onTerminalDisposed>(onTerminalDisposed);
    const [host, setHost] = useState<HTMLDivElement | null>(null);
    const [terminalInstance, setTerminalInstance] = useState<Terminal | null>(null);

    const normalizedOptions = useMemo(
        () => ({
            fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
            fontSize: 14,
            cursorStyle: 'bar' as const,
            cursorBlink: true,
            convertEol: true,
            scrollback: 50000,
            theme: {
                background: '#111111',
                foreground: '#e4e4e7',
                cursor: '#34d399',
                selectionBackground: '#064e3b',
            },
            ...options,
        }),
        [options],
    );

    useEffect(() => {
        listenersRef.current = listeners;
    }, [listeners]);

    useEffect(() => {
        readyRef.current = onTerminalReady;
    }, [onTerminalReady]);

    useEffect(() => {
        disposedRef.current = onTerminalDisposed;
    }, [onTerminalDisposed]);

    const ref = useCallback((node: HTMLDivElement | null) => {
        setHost(node);
    }, []);

    useEffect(() => {
        if (!host) {
            return undefined;
        }

        const terminal = new Terminal(normalizedOptions);
        const disposables: IDisposable[] = [];

        for (const addon of addons ?? []) {
            terminal.loadAddon(addon);
        }

        registerTerminalListeners(terminal, listenersRef, disposables);
        terminal.open(host);

        if (autoFocus) {
            terminal.focus();
        }

        setTerminalInstance(terminal);
        readyRef.current?.(terminal);

        return () => {
            for (const disposable of disposables) {
                disposable.dispose();
            }

            terminal.dispose();
            setTerminalInstance(null);
            disposedRef.current?.();
        };
    }, [addons, autoFocus, host, normalizedOptions]);

    return {
        ref,
        host,
        instance: terminalInstance,
    };
}

/**
 * Registers terminal listeners while keeping React callback identity stable.
 *
 * @param terminal - Xterm terminal instance.
 * @param listenersRef - Mutable listener ref.
 * @param disposables - Disposable collector.
 * @returns Nothing.
 */
function registerTerminalListeners(
    terminal: Terminal,
    listenersRef: React.MutableRefObject<UseXTermListeners | undefined>,
    disposables: IDisposable[],
): void {
    disposables.push(
        terminal.onBinary((data) => listenersRef.current?.onBinary?.(data)),
        terminal.onCursorMove(() => listenersRef.current?.onCursorMove?.()),
        terminal.onData((data) => listenersRef.current?.onData?.(data)),
        terminal.onKey((event) => listenersRef.current?.onKey?.(event)),
        terminal.onLineFeed(() => listenersRef.current?.onLineFeed?.()),
        terminal.onScroll((position) => listenersRef.current?.onScroll?.(position)),
        terminal.onSelectionChange(() => listenersRef.current?.onSelectionChange?.()),
        terminal.onRender((event) => listenersRef.current?.onRender?.(event)),
        terminal.onResize((event) => listenersRef.current?.onResize?.(event)),
        terminal.onTitleChange((title) => listenersRef.current?.onTitleChange?.(title)),
    );

    if (listenersRef.current?.customKeyEventHandler) {
        terminal.attachCustomKeyEventHandler((event) => {
            return listenersRef.current?.customKeyEventHandler?.(event) ?? true;
        });
    }
}

export interface XTermProps
    extends Omit<ComponentPropsWithoutRef<'div'>, 'onResize' | 'onScroll'>,
        UseXTermProps {
}

/**
 * React component wrapper around useXTerm.
 *
 * @param props - Div props plus terminal configuration.
 * @returns Xterm host div.
 *
 * @example
 * ```tsx
 * <XTerm listeners={{ onData: console.log }} />
 * ```
 */
export function XTerm({
                          addons,
                          autoFocus,
                          className = '',
                          listeners,
                          onTerminalDisposed,
                          onTerminalReady,
                          options,
                          ...props
                      }: XTermProps): React.Element {
    const {ref} = useXTerm({
        addons,
        autoFocus,
        listeners,
        onTerminalDisposed,
        onTerminalReady,
        options,
    });

    return <div className={className} ref={ref} {...props} />;
}

export default XTerm;
