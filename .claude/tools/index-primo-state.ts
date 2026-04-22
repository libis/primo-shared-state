#!/usr/bin/env ts-node
/**
 * index-primo-state.ts
 *
 * Scans the decompiled Primo host source and extracts NgRx state metadata into:
 *   <sourceDir>/primo-state-index.json  (machine-readable)
 *   <sourceDir>/PRIMO_STATE_INDEX.md    (human-readable)
 *
 * Usage:
 *   npx ts-node --project .claude/tools/tsconfig.json .claude/tools/index-primo-state.ts <sourceDir>
 *   npm run index-state -- <sourceDir>
 *
 * <sourceDir> is the path to the root of the decompiled source, e.g.:
 *   ../src_bootstrap_ts.b86105f1e861f4f0
 */

import { Project, SyntaxKind, Node, ScriptTarget } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';

// ── Types ────────────────────────────────────────────────────────────────────

interface FieldEntry {
  name: string;
  type: string;
  optional: boolean;
}

interface ActionEntry {
  variable: string;
  typeString: string;
  payload: string | null;
}

interface EffectEntry {
  name: string;
  listensTo: string[];
  httpEffect: boolean;
  sideEffect: boolean;
}

interface SliceEntry {
  featureKey: string;
  stateInterface: string | null;
  extendsEntityState: string | null;
  fields: FieldEntry[];
  actions: ActionEntry[];
  effects: EffectEntry[];
  relativeDir: string;
}

interface StateIndex {
  generatedAt: string;
  sourceDir: string;
  slices: SliceEntry[];
}

// ── Entry point ──────────────────────────────────────────────────────────────

const sourceDir = process.argv[2];
if (!sourceDir) {
  console.error('Usage: index-primo-state.ts <path-to-decompiled-source>');
  process.exit(1);
}

const absoluteSourceDir = path.resolve(sourceDir);
if (!fs.existsSync(absoluteSourceDir)) {
  console.error(`Source directory not found: ${absoluteSourceDir}`);
  process.exit(1);
}

const stateDir = path.join(absoluteSourceDir, 'src', 'app', 'state');
if (!fs.existsSync(stateDir)) {
  console.error(`State directory not found: ${stateDir}`);
  process.exit(1);
}

console.log(`Indexing: ${absoluteSourceDir}`);

const project = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: {
    skipLibCheck: true,
    noEmit: true,
    target: ScriptTarget.ES2020,
    allowJs: false,
    strict: false,
  },
});

// ── Scan feature modules ─────────────────────────────────────────────────────

const featureDirs = fs.readdirSync(stateDir, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => path.join(stateDir, e.name));

const slices: SliceEntry[] = [];

for (const featureDir of featureDirs) {
  const relativeDir = path.relative(absoluteSourceDir, featureDir);
  const files = fs.readdirSync(featureDir).filter(f => f.endsWith('.ts'));

  const reducerFile = files.find(f => f.includes('.reducer.'));
  const actionsFile = files.find(f => f.includes('.action.') || f.includes('.actions.'));
  const effectsFile = files.find(f => f.includes('.effect.') || f.includes('.effects.'));

  if (!reducerFile && !actionsFile) {
    // Not a feature module (e.g. meta-reducers, snippets utility dirs)
    continue;
  }

  const slice: SliceEntry = {
    featureKey: path.basename(featureDir),
    stateInterface: null,
    extendsEntityState: null,
    fields: [],
    actions: [],
    effects: [],
    relativeDir,
  };

  // ── Reducer: feature key + state interface ─────────────────────────────────
  if (reducerFile) {
    const reducerPath = path.join(featureDir, reducerFile);
    const sf = project.addSourceFileAtPath(reducerPath);

    // Feature key constant: export const fooFeatureName = 'Search'
    for (const vs of sf.getVariableStatements()) {
      if (!vs.hasExportKeyword()) continue;
      for (const decl of vs.getDeclarations()) {
        if (/feature(?:Name|Key)$/i.test(decl.getName())) {
          const init = decl.getInitializer();
          if (init) {
            slice.featureKey = init.getText().replace(/['"]/g, '');
          }
        }
      }
    }

    // State interface: export interface FooState [extends EntityState<T>] { ... }
    for (const iface of sf.getInterfaces()) {
      if (!iface.isExported()) continue;
      const name = iface.getName();
      if (!name.endsWith('State')) continue;

      slice.stateInterface = name;

      // Check for EntityState<T> in extends clause
      for (const ext of iface.getExtends()) {
        const exprText = ext.getExpression().getText();
        if (exprText === 'EntityState') {
          const typeArgs = ext.getTypeArguments();
          slice.extendsEntityState = typeArgs[0]?.getText() ?? 'unknown';
        }
      }

      // Extract fields
      for (const prop of iface.getProperties()) {
        slice.fields.push({
          name: prop.getName(),
          type: prop.getTypeNode()?.getText() ?? 'unknown',
          optional: prop.hasQuestionToken(),
        });
      }
      break; // take the first *State interface found
    }
  }

  // ── Actions: action catalog ────────────────────────────────────────────────
  if (actionsFile) {
    const actionsPath = path.join(featureDir, actionsFile);
    const sf = project.addSourceFileAtPath(actionsPath);

    for (const vs of sf.getVariableStatements()) {
      if (!vs.hasExportKeyword()) continue;
      for (const decl of vs.getDeclarations()) {
        const init = decl.getInitializer();
        if (!init || !Node.isCallExpression(init)) continue;

        const expr = init.getExpression().getText();
        if (!expr.endsWith('createAction')) continue;

        const args = init.getArguments();
        const typeString = args[0]?.getText().replace(/^['"`]|['"`]$/g, '') ?? '';

        let payload: string | null = null;
        for (let i = 1; i < args.length; i++) {
          const argText = args[i].getText();
          // props<{ ... }>() — extract the generic type argument
          if (Node.isCallExpression(args[i])) {
            const callExpr = args[i] as import('ts-morph').CallExpression;
            const typeArgs = callExpr.getTypeArguments();
            if (typeArgs.length > 0) {
              payload = typeArgs[0].getText();
            } else if (argText.includes('props')) {
              // fallback: regex extract
              const m = argText.match(/props<(.+)>\s*\(\s*\)/s);
              if (m) payload = m[1].trim();
            }
          } else if (argText.includes('props')) {
            const m = argText.match(/props<(.+)>\s*\(\s*\)/s);
            if (m) payload = m[1].trim();
          }
        }

        slice.actions.push({
          variable: decl.getName(),
          typeString,
          payload,
        });
      }
    }
  }

  // ── Effects: safety gate annotations ──────────────────────────────────────
  if (effectsFile) {
    const effectsPath = path.join(featureDir, effectsFile);
    const sf = project.addSourceFileAtPath(effectsPath);

    for (const cls of sf.getClasses()) {
      for (const prop of cls.getProperties()) {
        const init = prop.getInitializer();
        if (!init) continue;

        const initText = init.getText();
        const isCreateEffect =
          Node.isCallExpression(init) &&
          (init as import('ts-morph').CallExpression).getExpression().getText() === 'createEffect';

        if (!isCreateEffect) continue;

        const effectName = prop.getName();

        // Extract ofType arguments via regex (handles multi-line, aliased imports)
        const ofTypeMatches = [...initText.matchAll(/ofType\(\s*([^)]+?)\s*\)/gs)];
        const listensTo: string[] = [];
        for (const m of ofTypeMatches) {
          const args = m[1].split(',').map(s => s.trim().split('\n').pop()!.trim()).filter(Boolean);
          listensTo.push(...args);
        }

        // HTTP effect: uses a higher-order flattening operator (always async/HTTP in this codebase)
        const httpOps = ['switchMap(', 'mergeMap(', 'concatMap(', 'exhaustMap('];
        const httpEffect = httpOps.some(op => initText.includes(op));

        // Side effect: uses tap but NOT a higher-order op (analytics, navigation, storage)
        const sideEffect = initText.includes('tap(') && !httpEffect;

        slice.effects.push({ name: effectName, listensTo, httpEffect, sideEffect });
      }
    }
  }

  slices.push(slice);
  process.stdout.write(`  ✓ ${slice.featureKey} (${slice.actions.length} actions, ${slice.effects.length} effects)\n`);
}

// ── Build index ──────────────────────────────────────────────────────────────

const index: StateIndex = {
  generatedAt: new Date().toISOString(),
  sourceDir: path.basename(absoluteSourceDir),
  slices: slices.sort((a, b) => a.featureKey.localeCompare(b.featureKey)),
};

// ── Write JSON ───────────────────────────────────────────────────────────────

const jsonPath = path.join(absoluteSourceDir, 'primo-state-index.json');
fs.writeFileSync(jsonPath, JSON.stringify(index, null, 2), 'utf8');
console.log(`\nWrote: ${jsonPath}`);

// ── Write Markdown ────────────────────────────────────────────────────────────

function escapeTable(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

const lines: string[] = [
  `# Primo State Index`,
  ``,
  `Generated: ${index.generatedAt}  `,
  `Source: \`${index.sourceDir}\`  `,
  `Slices: ${slices.length}`,
  ``,
  `---`,
  ``,
  `## Usage during /regenerate`,
  ``,
  `Load this file as context **instead of** reading the raw reducer/action/effect source files.`,
  `It provides feature keys, state interfaces, action catalog, and effect safety annotations`,
  `for all ${slices.length} slices. Dig into specific source files only for detail not captured here.`,
  ``,
  `**Safety gate rule:** Actions listed under \`✅ http-effect\` must NOT be exported from`,
  `\`shared-actions.ts\` — dispatching them from a remote would trigger an HTTP call in the host.`,
  `Actions under \`❌ pure-state\` or \`⚡ side-effect\` are candidates for export (still apply`,
  `the full safety-gate checklist from \`regenerate.md\`).`,
  ``,
  `---`,
  ``,
];

for (const slice of index.slices) {
  lines.push(`## ${slice.featureKey}`);
  lines.push(``);

  const entityInfo = slice.extendsEntityState ? `  EntityState: \`${slice.extendsEntityState}\`` : '';
  lines.push(`Feature key: \`${slice.featureKey}\`${entityInfo}  `);
  if (slice.stateInterface) {
    lines.push(`State interface: \`${slice.stateInterface}\``);
  }
  lines.push(``);

  if (slice.fields.length > 0) {
    lines.push(`### State fields`);
    lines.push(``);
    lines.push(`| Field | Type | Optional |`);
    lines.push(`|-------|------|----------|`);
    for (const f of slice.fields) {
      lines.push(`| \`${f.name}\` | \`${escapeTable(f.type)}\` | ${f.optional ? '?' : ''} |`);
    }
    lines.push(``);
  }

  if (slice.actions.length > 0) {
    lines.push(`### Actions`);
    lines.push(``);
    lines.push(`| Variable | Type string | Payload |`);
    lines.push(`|----------|-------------|---------|`);
    for (const a of slice.actions) {
      const payload = a.payload ? `\`${escapeTable(a.payload)}\`` : '—';
      lines.push(`| \`${a.variable}\` | \`${escapeTable(a.typeString)}\` | ${payload} |`);
    }
    lines.push(``);
  }

  if (slice.effects.length > 0) {
    lines.push(`### Effects (safety gate)`);
    lines.push(``);
    lines.push(`| Effect | Listens to | Type |`);
    lines.push(`|--------|-----------|------|`);
    for (const e of slice.effects) {
      const triggers = e.listensTo.join(', ') || '—';
      const type = e.httpEffect
        ? '✅ http-effect — do NOT export triggers'
        : e.sideEffect
        ? '⚡ side-effect (tap)'
        : '❌ pure-state';
      lines.push(`| \`${e.name}\` | ${escapeTable(triggers)} | ${type} |`);
    }
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(``);
}

const mdPath = path.join(absoluteSourceDir, 'PRIMO_STATE_INDEX.md');
fs.writeFileSync(mdPath, lines.join('\n'), 'utf8');
console.log(`Wrote: ${mdPath}`);
console.log(`\nDone — ${slices.length} slices indexed.`);
