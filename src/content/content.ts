const BADGE_ATTR = 'data-deppeek-badge';

// Matches JSON dep lines like: "react": "^18.2.0"
const DEP_LINE_RE = /"(@?[a-zA-Z0-9][\w.-]*(?:\/[\w.-]+)?)":\s*"([^"]+)"/;

function isPackageJsonPage(): boolean {
  return /\/blob\/.+\/package\.json$/.test(window.location.pathname);
}

// Read the file content from GitHub's already-rendered DOM.
// Works for both public and private repos (no external fetch needed).
function getFileContentFromDOM(): string | null {
  const lines: string[] = [];
  let i = 1;
  while (true) {
    const el = document.getElementById(`LC${i}`);
    if (!el) break;
    lines.push(el.textContent ?? '');
    i++;
  }
  return lines.length > 0 ? lines.join('\n') : null;
}

function cleanVersion(spec: string): [number, number, number] | null {
  if (!spec || spec === '*' || spec === 'latest' || /^(file|workspace|link|portal):/.test(spec)) return null;
  const stripped = spec.replace(/^[\^~>=<v]+/, '').split(/[\s|]/)[0];
  const parts = stripped.split('.').map((s) => parseInt(s, 10));
  if (parts.length < 2 || parts.some(isNaN)) return null;
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

type UpdateType = 'major' | 'minor' | 'patch' | 'latest';

function getUpdateType(currentSpec: string, latestVersion: string): UpdateType {
  const cur = cleanVersion(currentSpec);
  const lat = cleanVersion(latestVersion);
  if (!cur || !lat) return 'latest';
  if (lat[0] > cur[0]) return 'major';
  if (lat[0] === cur[0] && lat[1] > cur[1]) return 'minor';
  if (lat[0] === cur[0] && lat[1] === cur[1] && lat[2] > cur[2]) return 'patch';
  return 'latest';
}

async function fetchLatestVersion(pkg: string): Promise<string | null> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${pkg}/latest`, { cache: 'default' });
    if (!res.ok) return null;
    const data = await res.json() as { version?: string };
    return data.version ?? null;
  } catch {
    return null;
  }
}

const BADGE_CONFIG: Record<UpdateType, { color: string; bg: string; label: (v: string) => string }> = {
  major:  { color: '#e03131', bg: 'rgba(224,49,49,0.1)',   label: (v) => `↑ ${v} major` },
  minor:  { color: '#e67700', bg: 'rgba(230,119,0,0.1)',   label: (v) => `↑ ${v} minor` },
  patch:  { color: '#2f9e44', bg: 'rgba(47,158,68,0.1)',   label: (v) => `↑ ${v} patch` },
  latest: { color: '#2f9e44', bg: 'rgba(47,158,68,0.1)',   label: () => '✓ latest' },
};

function createBadge(currentSpec: string, latestVersion: string): HTMLElement {
  const type = getUpdateType(currentSpec, latestVersion);
  const { color, bg, label } = BADGE_CONFIG[type];
  const el = document.createElement('span');
  el.setAttribute(BADGE_ATTR, type);
  el.textContent = label(latestVersion);
  el.style.cssText = [
    'display:inline-block',
    'margin-left:10px',
    'padding:2px 9px',
    'border-radius:8px',
    'font-size:11px',
    'font-weight:600',
    `background:${bg}`,
    `color:${color}`,
    'vertical-align:middle',
    'line-height:18px',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    'white-space:nowrap',
    'pointer-events:none',
    'user-select:none',
  ].join(';');
  return el;
}

function clearBadges(): void {
  document.querySelectorAll(`[${BADGE_ATTR}]`).forEach((el) => el.remove());
}

function codeViewReady(): boolean {
  return !!(
    document.getElementById('LC1') ||
    document.querySelector('td.blob-code-inner') ||
    document.querySelector('.react-code-line-contents') ||
    document.querySelector('[data-line-number="1"]')
  );
}

async function waitForCodeView(maxMs = 8000): Promise<boolean> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    if (codeViewReady()) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

async function run(): Promise<void> {
  if (!isPackageJsonPage()) return;
  clearBadges();

  // Wait for GitHub to render the code view
  if (!(await waitForCodeView())) return;

  // Read file content directly from the DOM — works for public AND private repos
  const rawText = getFileContentFromDOM();
  if (!rawText) return;

  let pkgJson: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  try {
    pkgJson = JSON.parse(rawText) as typeof pkgJson;
  } catch {
    return;
  }

  const allDeps: Record<string, string> = {
    ...(pkgJson.dependencies ?? {}),
    ...(pkgJson.devDependencies ?? {}),
  };
  if (Object.keys(allDeps).length === 0) return;

  // Map each dep name → its DOM line number by scanning LC{n} elements
  const depLineMap = new Map<string, number>();
  let i = 1;
  while (true) {
    const el = document.getElementById(`LC${i}`);
    if (!el) break;
    const match = DEP_LINE_RE.exec(el.textContent ?? '');
    if (match) {
      const [, pkgName] = match;
      if (pkgName in allDeps) depLineMap.set(pkgName, i);
    }
    i++;
  }

  // Fetch all latest versions in parallel
  const latestEntries = await Promise.all(
    Object.keys(allDeps).map(async (pkg) => [pkg, await fetchLatestVersion(pkg)] as const)
  );
  const latestMap = new Map(latestEntries);

  // Inject a badge into each dep's line element
  for (const [pkgName, lineNum] of depLineMap) {
    const latest = latestMap.get(pkgName);
    if (!latest) continue;

    const lineEl = document.getElementById(`LC${lineNum}`);
    if (!lineEl) continue;

    lineEl.querySelector(`[${BADGE_ATTR}]`)?.remove();
    lineEl.appendChild(createBadge(allDeps[pkgName], latest));
  }
}

void run();

// GitHub SPA navigation events
document.addEventListener('turbo:load', () => { void run(); });
document.addEventListener('turbo:render', () => { void run(); });
