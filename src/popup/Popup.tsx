import '../globals.css';
import { createRoot } from 'react-dom/client';

type UpdateType = 'major' | 'minor' | 'patch' | 'latest';

const LEGEND: Array<{ type: UpdateType; label: string; desc: string }> = [
  { type: 'major',  label: '↑ 2.0.0 major', desc: 'Breaking change available' },
  { type: 'minor',  label: '↑ 1.2.0 minor',  desc: 'New features available'   },
  { type: 'patch',  label: '↑ 1.0.1 patch',  desc: 'Bug fix available'         },
  { type: 'latest', label: '✓ latest',        desc: 'Already up to date'        },
];

const BADGE_STYLE: Record<UpdateType, string> = {
  major:  'bg-red-500/10 text-red-600',
  minor:  'bg-orange-500/10 text-orange-600',
  patch:  'bg-green-600/10 text-green-700',
  latest: 'bg-green-600/10 text-green-700',
};

function Badge({ type, label }: { type: UpdateType; label: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${BADGE_STYLE[type]}`}>
      {label}
    </span>
  );
}

function App() {
  return (
    <div className="w-82.5 pb-1">
      <div className="p-4 text-[13px] text-gray-800">
        <h1 className="font-['Patrick_Hand'] flex items-center gap-2.5 text-[22px] font-semibold mb-1.5">
          <img src="/icon128.png" alt="icon" className="w-[32px] h-[32px]" />
          GitHub package.json Peek
        </h1>

        <p className="font-['Patrick_Hand'] text-gray-500 leading-relaxed my-3.5">
          Open any{' '}
          <code className="font-mono text-sm bg-gray-100 px-1 py-0.5 rounded border border-gray-200 text-blue-700">
            package.json
          </code>{' '}on GitHub<br/>
          to see dependency update badges inline.
        </p>

        <div className="border-t border-gray-200 pt-3 flex flex-col gap-1.5">
          <p className="font-['Patrick_Hand'] text-sm font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
            Badge types
          </p>
          {LEGEND.map(({ type, label, desc }) => (
            <div key={type} className="flex items-center gap-2">
              <Badge type={type} label={label} />
              <span className="font-['Patrick_Hand'] text-gray-500 text-sm">{desc}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-100 px-5 py-2.5">
        <p className="font-['Patrick_Hand'] m-0 text-[12px] text-gray-400 text-right font-medium">
          made by{' '}
          <button
            onClick={() => chrome.tabs.create({ url: 'https://github.com/TATA-V' })}
            className="text-gray-500 font-semibold hover:text-gray-800 transition-colors cursor-pointer bg-transparent border-none p-0 underline underline-offset-2 text-[12px]"
          >
            tatahyeonv
          </button>
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
