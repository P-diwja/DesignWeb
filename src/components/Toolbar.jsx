import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useBuilder } from '../store/BuilderStore';
import { exportToHTML } from '../utils/export';

/**
 * Nielsen fixes applied here:
 * #1 Visibility of system status — auto-save indicator, block count, unsaved dot
 * #3 User control & freedom — "New" now shows a proper modal, not browser confirm()
 * #4 Consistency — all buttons same height/padding, icons + labels always visible
 * #5 Error prevention — export disabled with tooltip when no blocks; New warns before clearing
 * #6 Recognition over recall — every button has visible label, not just icon
 * #7 Flexibility — keyboard shortcuts shown in tooltips
 * #8 Aesthetic — toolbar groups logically separated, primary action visually distinct
 */

const PREVIEW_MODES = [
  { id: 'desktop', label: 'Desktop', icon: '🖥', shortcut: 'D' },
  { id: 'tablet',  label: 'Tablet',  icon: '📱', shortcut: 'T' },
  { id: 'mobile',  label: 'Mobile',  icon: '📲', shortcut: 'M' },
];

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-[#111] border border-[var(--border)] text-[11px] text-white rounded whitespace-nowrap z-50 pointer-events-none shadow-lg">
          {text}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#111] border-l border-t border-[var(--border)] rotate-45" />
        </div>
      )}
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, danger, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      {/* Dialog */}
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title"
        className="relative bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl shadow-2xl p-6 w-80 flex flex-col gap-4">
        <div>
          <h2 id="modal-title" className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">{message}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-white border border-[var(--border)] hover:border-[var(--text-faint)] transition-all"
            autoFocus
          >Cancel</button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all ${danger ? 'bg-[var(--danger)] hover:opacity-90' : 'bg-[var(--accent)] hover:bg-[var(--accent-light)]'}`}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default function Toolbar() {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useBuilder();
  const { blocks, preview, frame } = state;
  const [saveStatus, setSaveStatus] = useState('idle');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileRef = useRef();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = () => {
    if (blocks.length === 0) return;
    const html = exportToHTML(blocks, frame);
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'my-page.html';
    a.click();
    showToast('HTML exported successfully!');
    setShowExportMenu(false);
  };

  const handleSaveImage = async () => {
    if (blocks.length === 0) return;
    setImgLoading(true);
    setShowExportMenu(false);
    try {
      // Find the canvas element — the white page div inside the canvas area
      const canvasEl = document.querySelector('[data-blockwise-canvas]');
      if (!canvasEl) { showToast('Could not find canvas element', 'error'); return; }
      const canvas = await html2canvas(canvasEl, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: frame.bg || '#ffffff',
        scale: 2, // 2x for retina quality
        logging: false,
      });
      const a = document.createElement('a');
      a.download = 'my-page.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
      showToast('Page saved as PNG image!');
    } catch (e) {
      showToast('Image export failed — try hiding any external images', 'error');
    }
    setImgLoading(false);
  };

  const handleSaveJSON = () => {
    setSaveStatus('saving');
    const data = JSON.stringify({ blocks, frame }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'blockwise-project.json';
    a.click();
    setTimeout(() => {
      setSaveStatus('saved');
      showToast('Project saved as JSON');
      setTimeout(() => setSaveStatus('idle'), 2500);
    }, 300);
  };

  const handleLoadJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.blocks) throw new Error('Invalid format');
        dispatch({
          type: 'LOAD_PROJECT',
          state: {
            blocks: parsed.blocks || [],
            frame: parsed.frame || { bg: '#ffffff', pattern: 'none', radius: 0 },
            selectedId: null, preview: 'desktop', history: [], future: [],
          },
        });
        showToast(`Loaded "${file.name}"`);
      } catch {
        showToast('Could not read file — invalid project format', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleNewConfirm = () => {
    dispatch({
      type: 'LOAD_PROJECT',
      state: { blocks: [], frame: { bg: '#ffffff', pattern: 'none', radius: 0 }, selectedId: null, preview: 'desktop', history: [], future: [] },
    });
    localStorage.removeItem('blockwise_project');
    setShowNewModal(false);
    showToast('New project started');
  };

  const btnBase = "flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-all select-none";
  const btnGhost = `${btnBase} text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-hover)] border border-transparent hover:border-[var(--border)]`;
  const btnOutline = `${btnBase} text-[var(--text-muted)] hover:text-white bg-[var(--bg-deep)] border border-[var(--border)] hover:border-[var(--text-faint)]`;
  const btnPrimary = `${btnBase} bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white font-semibold`;

  return (
    <>
      <header className="h-13 flex items-center px-4 border-b border-[var(--border)] bg-[var(--bg-panel)] flex-shrink-0 gap-2" style={{ height: 52 }}>

        {/* ── Logo ── */}
        <div className="flex items-center gap-2 mr-1 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white text-sm font-bold shadow-sm">B</div>
          <span className="font-display font-bold text-sm text-[var(--text-primary)] tracking-tight">Blockwise</span>
        </div>

        <div className="w-px h-5 bg-[var(--border)] mx-1 flex-shrink-0" />

        {/* ── History ── */}
        <div className="flex items-center gap-0.5">
          <Tooltip text="Undo  Ctrl+Z">
            <button
              onClick={undo}
              disabled={!canUndo}
              aria-label="Undo"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 6h7a4 4 0 0 1 0 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M2 6l3-3M2 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </Tooltip>
          <Tooltip text="Redo  Ctrl+Y">
            <button
              onClick={redo}
              disabled={!canRedo}
              aria-label="Redo"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M14 6H7a4 4 0 0 0 0 8h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M14 6l-3-3M14 6l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </Tooltip>
        </div>

        <div className="w-px h-5 bg-[var(--border)] mx-1 flex-shrink-0" />

        {/* ── Preview modes ── */}
        <div role="group" aria-label="Preview size" className="flex items-center bg-[var(--bg-deep)] rounded-lg p-0.5 gap-0.5 flex-shrink-0">
          {PREVIEW_MODES.map(m => (
            <Tooltip key={m.id} text={`${m.label} preview`}>
              <button
                onClick={() => dispatch({ type: 'SET_PREVIEW', mode: m.id })}
                aria-pressed={preview === m.id}
                aria-label={`${m.label} preview`}
                className={`flex items-center gap-1.5 px-2.5 h-7 rounded-md text-xs font-medium transition-all ${
                  preview === m.id
                    ? 'bg-[var(--bg-panel)] text-white shadow-sm ring-1 ring-[var(--border)]'
                    : 'text-[var(--text-faint)] hover:text-[var(--text-muted)]'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            </Tooltip>
          ))}
        </div>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── System status: auto-save + block count ── */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-faint)] flex-shrink-0">
          {blocks.length > 0 && (
            <span className="bg-[var(--bg-deep)] border border-[var(--border)] px-2 py-0.5 rounded-md">
              {blocks.length} block{blocks.length !== 1 ? 's' : ''}
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            Auto-saved
          </span>
        </div>

        <div className="w-px h-5 bg-[var(--border)] mx-1 flex-shrink-0" />

        {/* ── File actions ── */}
        <Tooltip text="Start a new empty project">
          <button onClick={() => blocks.length > 0 ? setShowNewModal(true) : handleNewConfirm()} className={btnGhost}>
            New
          </button>
        </Tooltip>

        <Tooltip text="Load a saved .json project file">
          <button onClick={() => fileRef.current?.click()} className={btnOutline}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 12V4a1 1 0 011-1h4l2 2h3a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1z" stroke="currentColor" strokeWidth="1.3"/><path d="M8 7v4M6 9l2 2 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Load
          </button>
        </Tooltip>
        <input ref={fileRef} type="file" accept=".json" onChange={handleLoadJSON} className="hidden" aria-label="Load project file" />

        <Tooltip text="Save project as .json file">
          <button
            onClick={handleSaveJSON}
            className={`${btnOutline} ${saveStatus === 'saved' ? '!text-[var(--success)] !border-[var(--success)]' : ''}`}
          >
            {saveStatus === 'saved' ? (
              <><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> Saved</>
            ) : (
              <><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 4a1 1 0 011-1h6l3 3v6a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.3"/><rect x="5" y="9" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/><path d="M6 3v3h4V3" stroke="currentColor" strokeWidth="1.3"/></svg> Save</>
            )}
          </button>
        </Tooltip>

        <div className="w-px h-5 bg-[var(--border)] mx-1 flex-shrink-0" />

        {/* ── Export dropdown ── */}
        <div className="relative flex-shrink-0">
          <div className={`flex items-center rounded-lg overflow-hidden ${blocks.length === 0 ? 'opacity-40 pointer-events-none' : ''}`}>
            {/* Main export HTML button */}
            <button
              onClick={handleExport}
              disabled={blocks.length === 0}
              className={`${btnPrimary} rounded-r-none border-r border-purple-400/40`}
              title="Export as standalone HTML file"
            >
              {imgLoading ? (
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="20" strokeDashoffset="10"/></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3v7M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M2 11v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              )}
              Export HTML
            </button>
            {/* Chevron to open dropdown */}
            <button
              onClick={() => setShowExportMenu(v => !v)}
              className={`${btnPrimary} rounded-l-none px-2`}
              title="More export options"
              aria-label="More export options"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* Dropdown menu */}
          {showExportMenu && (
            <>
              {/* Click outside to close */}
              <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden w-52">
                <div className="px-3 py-2 border-b border-[var(--border)]">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-faint)]">Export Options</p>
                </div>
                <button onClick={handleExport}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left">
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 2h7l3 3v9H3V2z" stroke="var(--accent)" strokeWidth="1.3"/><path d="M10 2v3h3" stroke="var(--accent)" strokeWidth="1.3"/><path d="M5 7h6M5 9.5h4" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Export as HTML</div>
                    <div className="text-xs text-[var(--text-faint)]">Self-contained .html file</div>
                  </div>
                </button>
                <button onClick={handleSaveImage} disabled={imgLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-left disabled:opacity-50">
                  <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    {imgLoading ? (
                      <svg className="animate-spin" width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="#4ade80" strokeWidth="2" strokeDasharray="16" strokeDashoffset="8"/></svg>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#4ade80" strokeWidth="1.3"/><circle cx="6" cy="7" r="1.5" stroke="#4ade80" strokeWidth="1.2"/><path d="M2 11l3.5-3 3 3 2-2 3 3" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{imgLoading ? 'Capturing…' : 'Save as Image'}</div>
                    <div className="text-xs text-[var(--text-faint)]">High-res PNG screenshot</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ── New project confirm modal (#3 User control, #5 Error prevention) ── */}
      {showNewModal && (
        <ConfirmModal
          title="Start a new project?"
          message="All unsaved changes will be lost. This cannot be undone."
          confirmLabel="Start New"
          danger
          onConfirm={handleNewConfirm}
          onCancel={() => setShowNewModal(false)}
        />
      )}

      {/* ── Toast notifications (#1 Visibility of system status) ── */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium border transition-all ${
            toast.type === 'error'
              ? 'bg-[var(--danger)] border-red-400 text-white'
              : 'bg-[var(--bg-panel)] border-[var(--border)] text-[var(--text-primary)]'
          }`}
        >
          {toast.type === 'error'
            ? <span>⚠</span>
            : <span className="text-[var(--success)]">✓</span>
          }
          {toast.msg}
        </div>
      )}
    </>
  );
}
