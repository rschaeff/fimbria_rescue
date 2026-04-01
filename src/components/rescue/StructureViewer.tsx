'use client';

import { useEffect, useRef, useState } from 'react';
import type { StructurePath } from '@/lib/types';

interface StructureViewerProps {
  domainId: string;
  structures: StructurePath[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function StructureViewer({ domainId, structures }: StructureViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<any>(null);
  const [mode, setMode] = useState<string>('dimer_domain');
  const [showChainB, setShowChainB] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const structureForMode = structures.find((s) => s.mode === mode);

  // Load 3Dmol.js script
  useEffect(() => {
    if ((window as any).$3Dmol) {
      setLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://3dmol.org/build/3Dmol-min.js';
    script.async = true;
    script.onload = () => setLoaded(true);
    script.onerror = () => setError('Failed to load 3DMol.js');
    document.head.appendChild(script);
  }, []);

  // Load and render structure
  useEffect(() => {
    if (!loaded || !viewerRef.current || !structureForMode) return;

    const $3Dmol = (window as any).$3Dmol;
    if (!$3Dmol) return;

    const loadStructure = async () => {
      try {
        const resp = await fetch(`/api/rescue/${domainId}/structure/${mode}`);
        if (!resp.ok) {
          setError('Failed to load structure file');
          return;
        }
        const cifData = await resp.text();

        // Create viewer if needed, otherwise clear it
        if (!viewerInstance.current) {
          viewerInstance.current = $3Dmol.createViewer(viewerRef.current, {
            backgroundColor: 'white',
          });
        } else {
          viewerInstance.current.removeAllModels();
        }

        const v = viewerInstance.current;
        v.addModel(cifData, 'cif');

        // pLDDT color function: red (<50), white (50-70), blue (>70)
        const plddtColor = (atom: any) => {
          const b = atom.b;
          if (b < 50) {
            const t = b / 50;
            const r = 239;
            const g = Math.round(68 + (255 - 68) * t);
            const bl = Math.round(68 + (255 - 68) * t);
            return `rgb(${r},${g},${bl})`;
          } else if (b < 70) {
            const t = (b - 50) / 20;
            const r = Math.round(255 - (255 - 59) * t);
            const g = Math.round(255 - (255 - 130) * t);
            const bl = Math.round(255 - (255 - 246) * t);
            return `rgb(${r},${g},${bl})`;
          } else {
            return 'rgb(59,130,246)';
          }
        };

        const isDimer = mode === 'dimer_domain' || mode === 'dimer_protein';
        if (isDimer) {
          v.setStyle({ chain: 'A' }, { cartoon: { colorfunc: plddtColor } });
          if (showChainB) {
            v.setStyle({ chain: 'B' }, { cartoon: { color: '#d1d5db', opacity: 0.6 } });
          } else {
            v.setStyle({ chain: 'B' }, {});
          }
        } else {
          v.setStyle({}, { cartoon: { colorfunc: plddtColor } });
        }

        v.zoomTo();
        v.render();
        setError(null);
      } catch {
        setError('Error loading structure');
      }
    };

    loadStructure();
  }, [loaded, mode, showChainB, domainId, structureForMode]);

  if (structures.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">No structure files available.</p>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
        >
          {structures.find((s) => s.mode === 'monomer_domain') && <option value="monomer_domain">Monomer Domain</option>}
          {structures.find((s) => s.mode === 'dimer_domain') && <option value="dimer_domain">Dimer Domain</option>}
          {structures.find((s) => s.mode === 'monomer_protein') && <option value="monomer_protein">Monomer Protein</option>}
          {structures.find((s) => s.mode === 'dimer_protein') && <option value="dimer_protein">Dimer Protein</option>}
        </select>
        {(mode === 'dimer_domain' || mode === 'dimer_protein') && (
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={showChainB}
              onChange={(e) => setShowChainB(e.target.checked)}
              className="rounded"
            />
            Show chain B
          </label>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 mb-2">{error}</p>
      )}
      <div
        ref={viewerRef}
        className="w-full h-[500px] border border-gray-200 dark:border-gray-700 rounded-lg relative overflow-hidden"
      />
      <p className="text-xs text-gray-400 mt-2">
        Colored by pLDDT: red (&lt;50) / white (50-70) / blue (&gt;70)
      </p>
    </div>
  );
}
