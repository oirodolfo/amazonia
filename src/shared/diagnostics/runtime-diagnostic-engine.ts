export interface RuntimeDiagnostic {
    readonly id: string;
    readonly severity: 'error' | 'warning' | 'info';
    readonly message: string;
    readonly file: string | null;
}

export function detectRuntimeDiagnostics(
    lines: readonly string[],
): RuntimeDiagnostic[] {
    return lines.flatMap((line, index) => {
        const lower = line.toLowerCase();

        if (lower.includes('error')) {
            return [{
                id: `diag:${index}`,
                severity: 'error',
                message: line,
                file: null,
            }];
        }

        if (lower.includes('warn')) {
            return [{
                id: `diag:${index}`,
                severity: 'warning',
                message: line,
                file: null,
            }];
        }

        return [];
    });
}
