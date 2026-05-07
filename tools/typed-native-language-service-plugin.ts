import type ts from "typescript/lib/tsserverlibrary";

type PluginConfig = {
  readonly helperModule?: string;
  readonly diagnosticCategory?: "suggestion" | "warning";
};

type NativeReplacement = {
  readonly nativeName: string;
  readonly helperName: string;
  readonly message: string;
};

const PLUGIN_NAME = "typed-native-language-service-plugin";
const DEFAULT_HELPER_MODULE = "@/utils/index";
const DIAGNOSTIC_CODE = 930_001;

const REPLACEMENTS: readonly NativeReplacement[] = [
  {
    nativeName: "Object.keys",
    helperName: "objectKeys",
    message:
      "Use objectKeys() to preserve keyof inference instead of widening keys to string[].",
  },
  {
    nativeName: "Object.values",
    helperName: "objectValues",
    message: "Use objectValues() to preserve the object's value union.",
  },
  {
    nativeName: "Object.entries",
    helperName: "objectEntries",
    message: "Use objectEntries() to preserve key/value tuple relationships.",
  },
  {
    nativeName: "Object.fromEntries",
    helperName: "objectFromEntries",
    message:
      "Use objectFromEntries() to reconstruct a typed object from typed entries.",
  },
  {
    nativeName: "Object.hasOwn",
    helperName: "hasOwn",
    message: "Use hasOwn() as a key-narrowing type guard.",
  },
  {
    nativeName: "Array.isArray",
    helperName: "isArrayOf",
    message: "Use isArrayOf() when the item type must also be validated.",
  },
  {
    nativeName: "JSON.parse",
    helperName: "parseJsonUnknown",
    message: "Use parseJsonUnknown() to avoid leaking any from JSON.parse().",
  },
];

/**
 * Creates a TypeScript language service plugin that reports editor-only suggestions for native JavaScript APIs
 * that can be replaced by stronger typed wrappers.
 *
 * @remarks
 * This plugin intentionally does not change TypeScript emit or command-line typechecking. TypeScript language
 * service plugins only augment editor behavior, so the codemod should be used when you want to rewrite files.
 *
 * @param mod - TypeScript server module provided by tsserver.
 * @returns The language service plugin factory.
 *
 * @example
 * export = init;
 */
function init(mod: { readonly typescript: typeof ts }): ts.server.PluginModule {
  const tsModule = mod.typescript;

  return {
    create(info) {
      const config = normalizeConfig(info.config);
      const logger = createLogger(info, config);
      const oldLanguageService = info.languageService;
      const proxy = Object.create(null) as ts.LanguageService;

      for (const key of Object.keys(oldLanguageService) as Array<
        keyof ts.LanguageService
      >) {
        const value = oldLanguageService[key];

        proxy[key] =
          typeof value === "function"
            ? (((...args: readonly unknown[]) =>
                Reflect.apply(value, oldLanguageService, args)) as never)
            : value;
      }

      proxy.getSemanticDiagnostics = (fileName) => {
        const prior = oldLanguageService.getSemanticDiagnostics(fileName);
        const sourceFile = oldLanguageService
          .getProgram()
          ?.getSourceFile(fileName);

        if (!sourceFile) {
          return prior;
        }

        return [
          ...prior,
          ...collectDiagnostics(tsModule, sourceFile, config, logger),
        ];
      };

      proxy.getCodeFixesAtPosition = (
        fileName,
        start,
        end,
        errorCodes,
        formatOptions,
        preferences,
      ) => {
        const prior = oldLanguageService.getCodeFixesAtPosition(
          fileName,
          start,
          end,
          errorCodes,
          formatOptions,
          preferences,
        );

        if (!errorCodes.includes(DIAGNOSTIC_CODE)) {
          return prior;
        }

        const sourceFile = oldLanguageService
          .getProgram()
          ?.getSourceFile(fileName);

        if (!sourceFile) {
          return prior;
        }

        const fix = createCodeFixAtPosition(
          tsModule,
          sourceFile,
          start,
          config,
        );

        return fix ? [...prior, fix] : prior;
      };

      logger(`Loaded with helper module "${config.helperModule}".`);

      return proxy;
    },
  };
}

/**
 * Normalizes plugin configuration passed from tsconfig.
 *
 * @remarks
 * TypeScript plugin config is structurally loose because it comes from JSON. This helper keeps the rest of the
 * plugin typed and avoids spreading unknown config values through the implementation.
 *
 * @param input - Raw plugin config from tsserver.
 * @returns Normalized plugin config.
 *
 * @example
 * const config = normalizeConfig({ helperModule: "@/typed-native" });
 * // config.helperModule === "@/typed-native"
 */
function normalizeConfig(input: unknown): Required<PluginConfig> {
  const raw = isRecord(input) ? input : {};

  return {
    helperModule:
      typeof raw.helperModule === "string" && raw.helperModule.length > 0
        ? raw.helperModule
        : DEFAULT_HELPER_MODULE,
    diagnosticCategory:
      raw.diagnosticCategory === "warning" ? "warning" : "suggestion",
  };
}

/**
 * Collects editor diagnostics for native calls that can be improved with typed wrappers.
 *
 * @remarks
 * The implementation is intentionally syntax-based and fast. It avoids asking the checker for every node,
 * which keeps the editor responsive in large projects.
 *
 * @param tsModule - Active TypeScript module from tsserver.
 * @param sourceFile - File currently being inspected.
 * @param config - Normalized plugin config.
 * @param logger - Plugin logger.
 * @returns Suggestion diagnostics for matching native calls.
 *
 * @example
 * const diagnostics = collectDiagnostics(ts, sourceFile, config, logger);
 * // diagnostics: ts.DiagnosticWithLocation[]
 */
function collectDiagnostics(
  tsModule: typeof ts,
  sourceFile: ts.SourceFile,
  config: Required<PluginConfig>,
  logger: (message: string) => void,
): ts.DiagnosticWithLocation[] {
  const diagnostics: ts.DiagnosticWithLocation[] = [];

  const visit = (node: ts.Node): void => {
    const replacement = getReplacementForNode(tsModule, node);

    if (replacement && tsModule.isCallExpression(node)) {
      diagnostics.push({
        file: sourceFile,
        start: node.expression.getStart(sourceFile),
        length: node.expression.getWidth(sourceFile),
        code: DIAGNOSTIC_CODE,
        category:
          config.diagnosticCategory === "warning"
            ? tsModule.DiagnosticCategory.Warning
            : tsModule.DiagnosticCategory.Suggestion,
        messageText: replacement.message,
        source: PLUGIN_NAME,
      });

      logger(`Suggested ${replacement.helperName} in ${sourceFile.fileName}.`);
    }

    tsModule.forEachChild(node, visit);
  };

  visit(sourceFile);

  return diagnostics;
}

/**
 * Creates a code fix for the native call at the given editor position.
 *
 * @remarks
 * This is intentionally conservative. It rewrites only the callee expression and inserts a named import when
 * the helper is not already imported from the configured helper module.
 *
 * @param tsModule - Active TypeScript module from tsserver.
 * @param sourceFile - File currently being edited.
 * @param position - Diagnostic start position.
 * @param config - Normalized plugin config.
 * @returns A TypeScript code fix action or undefined when no safe match exists.
 *
 * @example
 * const fix = createCodeFixAtPosition(ts, sourceFile, start, config);
 */
function createCodeFixAtPosition(
  tsModule: typeof ts,
  sourceFile: ts.SourceFile,
  position: number,
  config: Required<PluginConfig>,
): ts.CodeFixAction | undefined {
  const call = findCallExpressionAtPosition(tsModule, sourceFile, position);

  if (!call) {
    return undefined;
  }

  const replacement = getReplacementForNode(tsModule, call);

  if (!replacement) {
    return undefined;
  }

  const changes: ts.FileTextChanges[] = [
    {
      fileName: sourceFile.fileName,
      textChanges: [
        {
          span: {
            start: call.expression.getStart(sourceFile),
            length: call.expression.getWidth(sourceFile),
          },
          newText: replacement.helperName,
        },
        ...createImportTextChanges(
          tsModule,
          sourceFile,
          replacement.helperName,
          config.helperModule,
        ),
      ],
    },
  ];

  return {
    fixName: `typed-native-${replacement.helperName}`,
    description: `Replace with ${replacement.helperName}()`,
    changes,
  };
}

/**
 * Finds the call expression whose callee starts at the diagnostic position.
 *
 * @remarks
 * Language service diagnostics point at spans, not semantic symbols. This small AST walk maps the span back to
 * the call expression so the code fix can be generated safely.
 *
 * @param tsModule - Active TypeScript module from tsserver.
 * @param sourceFile - File currently being edited.
 * @param position - Diagnostic start position.
 * @returns Matching call expression or undefined.
 *
 * @example
 * const call = findCallExpressionAtPosition(ts, sourceFile, position);
 */
function findCallExpressionAtPosition(
  tsModule: typeof ts,
  sourceFile: ts.SourceFile,
  position: number,
): ts.CallExpression | undefined {
  let match: ts.CallExpression | undefined;

  const visit = (node: ts.Node): void => {
    if (match) {
      return;
    }

    if (
      tsModule.isCallExpression(node) &&
      node.expression.getStart(sourceFile) === position
    ) {
      match = node;
      return;
    }

    tsModule.forEachChild(node, visit);
  };

  visit(sourceFile);

  return match;
}

/**
 * Resolves whether a node is a supported native call.
 *
 * @remarks
 * This function only matches explicit native member expressions such as `Object.keys(...)`.
 * It does not rewrite aliased variables because that would require deeper symbol analysis and could surprise
 * the user in the editor.
 *
 * @param tsModule - Active TypeScript module from tsserver.
 * @param node - Node to inspect.
 * @returns Matching replacement metadata.
 *
 * @example
 * const replacement = getReplacementForNode(ts, callExpression);
 */
function getReplacementForNode(
  tsModule: typeof ts,
  node: ts.Node,
): NativeReplacement | undefined {
  if (!tsModule.isCallExpression(node)) {
    return undefined;
  }

  if (!tsModule.isPropertyAccessExpression(node.expression)) {
    return undefined;
  }

  const nativeName = node.expression.getText();

  return REPLACEMENTS.find(
    (replacement) => replacement.nativeName === nativeName,
  );
}

/**
 * Creates text changes that add a named import when needed.
 *
 * @remarks
 * The import strategy favors existing imports from the helper module. If no matching import exists, it inserts
 * a new import after the last import declaration to keep the file tidy.
 *
 * @param tsModule - Active TypeScript module from tsserver.
 * @param sourceFile - File currently being edited.
 * @param helperName - Helper symbol to import.
 * @param helperModule - Module specifier for the helper package.
 * @returns Text changes needed to make the helper available.
 *
 * @example
 * const changes = createImportTextChanges(ts, sourceFile, "objectKeys", "@/typed-native");
 */
function createImportTextChanges(
  tsModule: typeof ts,
  sourceFile: ts.SourceFile,
  helperName: string,
  helperModule: string,
): ts.TextChange[] {
  const existingImport = findImportDeclaration(
    tsModule,
    sourceFile,
    helperModule,
  );

  if (
    existingImport &&
    importHasSpecifier(tsModule, existingImport, helperName)
  ) {
    return [];
  }

  if (
    existingImport?.importClause?.namedBindings &&
    tsModule.isNamedImports(existingImport.importClause.namedBindings)
  ) {
    const namedImports = existingImport.importClause.namedBindings;
    const insertPosition = namedImports.elements.end;

    return [
      {
        span: {
          start: insertPosition,
          length: 0,
        },
        newText:
          namedImports.elements.length > 0 ? `, ${helperName}` : helperName,
      },
    ];
  }

  const imports = sourceFile.statements.filter(tsModule.isImportDeclaration);
  const insertPosition =
    imports.length > 0 ? imports[imports.length - 1]!.end + 1 : 0;

  return [
    {
      span: {
        start: insertPosition,
        length: 0,
      },
      newText: `import { ${helperName} } from "${helperModule}";\n`,
    },
  ];
}

/**
 * Finds an import declaration by module specifier.
 *
 * @remarks
 * This helper keeps module detection syntax-only, which is enough for named helper imports and avoids expensive
 * symbol resolution in editor hot paths.
 *
 * @param tsModule - Active TypeScript module from tsserver.
 * @param sourceFile - File currently being edited.
 * @param helperModule - Module specifier to find.
 * @returns Matching import declaration or undefined.
 *
 * @example
 * const declaration = findImportDeclaration(ts, sourceFile, "@/typed-native");
 */
function findImportDeclaration(
  tsModule: typeof ts,
  sourceFile: ts.SourceFile,
  helperModule: string,
): ts.ImportDeclaration | undefined {
  return sourceFile.statements.find(
    (statement): statement is ts.ImportDeclaration => {
      if (!tsModule.isImportDeclaration(statement)) {
        return false;
      }

      return (
        tsModule.isStringLiteral(statement.moduleSpecifier) &&
        statement.moduleSpecifier.text === helperModule
      );
    },
  );
}

/**
 * Checks whether an import declaration already imports a named helper.
 *
 * @remarks
 * This prevents duplicate imports and keeps editor fixes idempotent.
 *
 * @param tsModule - Active TypeScript module from tsserver.
 * @param declaration - Import declaration to inspect.
 * @param helperName - Named import to find.
 * @returns Whether the helper is already imported.
 *
 * @example
 * const exists = importHasSpecifier(ts, declaration, "objectKeys");
 */
function importHasSpecifier(
  tsModule: typeof ts,
  declaration: ts.ImportDeclaration,
  helperName: string,
): boolean {
  const bindings = declaration.importClause?.namedBindings;

  if (!bindings || !tsModule.isNamedImports(bindings)) {
    return false;
  }

  return bindings.elements.some((element) => element.name.text === helperName);
}

/**
 * Creates a safe plugin logger.
 *
 * @remarks
 * tsserver logging is optional depending on editor setup. This wrapper avoids crashing the plugin if logging is
 * unavailable or disabled.
 *
 * @param info - Plugin create info from tsserver.
 * @param config - Normalized plugin config.
 * @returns Logger function.
 *
 * @example
 * const logger = createLogger(info, config);
 */
function createLogger(
  info: ts.server.PluginCreateInfo,
  config: Required<PluginConfig>,
): (message: string) => void {
  return (message) => {
    try {
      info.project.projectService.logger.info(`[${PLUGIN_NAME}] ${message}`);
    } catch {
      if (config.diagnosticCategory === "warning") {
        return;
      }
    }
  };
}

/**
 * Checks whether a value is a non-null object record.
 *
 * @remarks
 * This tiny guard prevents unsafe property reads from unknown plugin config.
 *
 * @param value - Value to check.
 * @returns Whether the value is a plain record shape.
 *
 * @example
 * if (isRecord(config)) {
 *   config.helperModule;
 * }
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export default init;
