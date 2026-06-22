import { useState, useRef, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BlockRenderer from './BlockRenderer';
import { useBuilder } from '../store/BuilderStore';

const PREVIEW_WIDTHS = { desktop: '100%', tablet: '768px', mobile: '390px' };
const PREVIEW_LABELS = { desktop: null, tablet: '768px — Tablet', mobile: '390px — Mobile' };
const BLOCK_ICONS = { header:'🔤', navbar:'📌', hero:'🚀', text:'📝', image:'🖼️', cards:'🃏', testimonial:'💬', form:'📬', divider:'➖', footer:'📄', button:'🔘', row:'⊞' };
const CONFIRM_DELETE = new Set(['hero','cards','testimonial','form','footer']);

function IconBtn({ onClick, title, className='', children }) {
  return (
    <button title={title} aria-label={title} onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded-md transition-all text-xs flex-shrink-0 ${className}`}>
      {children}
    </button>
  );
}

function BlockWrapper({ block, isSelected, index, total }) {
  const { dispatch } = useBuilder();
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const resizeRef = useRef(null);
  const startRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id, data: { type: 'canvas', blockId: block.id },
  });

  const p = block.props;
  const blockWidth  = p._width   || 100;
  const blockZIndex = p._zIndex  || 0;
  const blockOpacity= p._opacity ?? 1;
  const blockAlign  = p._align   || 'center';
  // Overlap: pull this block UP over the previous one (negative margin-top)
  const blockOverlap= p._overlap || 0; // px, positive = pulls up

  const showControls = (hovered || isSelected) && !isDragging;
  const isFirst = index === 0, isLast = index === total - 1;
  const set = useCallback((key, val) => dispatch({ type: 'UPDATE_BLOCK_PROP', id: block.id, key, value: val }), [block.id, dispatch]);

  // Width resize handle
  const handleResizeStart = (e) => {
    e.stopPropagation(); e.preventDefault();
    const containerW = resizeRef.current?.parentElement?.offsetWidth || 900;
    startRef.current = { x: e.clientX, initW: blockWidth, containerW };
    const onMove = (me) => {
      const pct = Math.min(100, Math.max(20, startRef.current.initW + ((me.clientX - startRef.current.x) / startRef.current.containerW) * 100));
      set('_width', Math.round(pct));
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const marginMap = { left: '0 auto 0 0', center: '0 auto', right: '0 0 0 auto' };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.25 : 1,
        // KEY FIX: use relative positioning + negative marginTop for overlap
        // z-index stays in normal stacking context so block never disappears
        position: 'relative',
        zIndex: blockZIndex + 1, // +1 so 0 still stacks above canvas bg
        marginTop: blockOverlap > 0 ? `-${blockOverlap}px` : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => dispatch({ type: 'SELECT_BLOCK', id: block.id })}
      className={`cursor-pointer ${!isDragging && isSelected ? 'outline outline-2 outline-[var(--accent)] outline-offset-[-2px]' : !isDragging && hovered ? 'outline outline-1 outline-[var(--accent-light)] outline-offset-[-1px]' : ''}`}
    >
      <div
        ref={resizeRef}
        style={{
          width: blockWidth === 100 ? '100%' : `${blockWidth}%`,
          margin: blockWidth === 100 ? undefined : marginMap[blockAlign] || '0 auto',
          opacity: blockOpacity,
          position: 'relative',
        }}
      >
        {/* Block label */}
        {showControls && (
          <div className={`absolute top-0 left-0 z-30 flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-br-lg pointer-events-none select-none ${isSelected ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-panel)] text-[var(--text-muted)] border-r border-b border-[var(--border)]'}`}>
            {BLOCK_ICONS[block.type] || '🧩'} {block.type}
          </div>
        )}

        {/* Toolbar */}
        {showControls && (
          <div className="absolute top-0 right-0 z-30 flex items-center gap-0.5 bg-[var(--bg-panel)] border border-[var(--border)] rounded-bl-xl px-1.5 py-1 shadow-lg select-none" onClick={e => e.stopPropagation()}>
            <IconBtn title={isFirst ? 'Already at top' : 'Move up'} onClick={() => dispatch({ type: 'MOVE_BLOCK', id: block.id, direction: 'up' })} className={isFirst ? 'opacity-30 cursor-not-allowed text-[var(--text-faint)]' : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-hover)]'}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 9V3M3 6l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </IconBtn>
            <IconBtn title={isLast ? 'Already at bottom' : 'Move down'} onClick={() => dispatch({ type: 'MOVE_BLOCK', id: block.id, direction: 'down' })} className={isLast ? 'opacity-30 cursor-not-allowed text-[var(--text-faint)]' : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-hover)]'}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 3v6M3 6l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </IconBtn>
            <div className="w-px h-4 bg-[var(--border)] mx-0.5"/>
            {/* Overlap controls — pull up/down over previous block */}
            <IconBtn title={`Overlap up more (currently ${blockOverlap}px)`} onClick={() => set('_overlap', blockOverlap + 20)} className="text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-hover)]">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <rect x="3" y="1" width="8" height="6" rx="1" fill="var(--bg-panel)" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M7 3v2M6 4h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </IconBtn>
            <IconBtn title={`Reduce overlap (currently ${blockOverlap}px)`} onClick={() => set('_overlap', Math.max(0, blockOverlap - 20))} className={blockOverlap === 0 ? 'opacity-30 cursor-not-allowed text-[var(--text-faint)]' : 'text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-hover)]'}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <rect x="3" y="1" width="8" height="6" rx="1" fill="var(--bg-panel)" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M5 4h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </IconBtn>
            {blockOverlap > 0 && <span className="text-[9px] text-[var(--accent)] px-0.5 select-none">-{blockOverlap}px</span>}
            <div className="w-px h-4 bg-[var(--border)] mx-0.5"/>
            <button {...attributes} {...listeners} title="Drag to reorder" onClick={e => e.stopPropagation()}
              className="w-7 h-7 flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-hover)] rounded-md cursor-grab active:cursor-grabbing">
              <svg width="10" height="12" viewBox="0 0 10 14" fill="currentColor"><circle cx="3" cy="2" r="1.2"/><circle cx="7" cy="2" r="1.2"/><circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/><circle cx="3" cy="12" r="1.2"/><circle cx="7" cy="12" r="1.2"/></svg>
            </button>
            <div className="w-px h-4 bg-[var(--border)] mx-0.5"/>
            <IconBtn title="Duplicate" onClick={e => { e.stopPropagation(); dispatch({ type: 'DUPLICATE_BLOCK', id: block.id }); }} className="text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-hover)]">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4 4V2.5A1.5 1.5 0 015.5 1H11.5A1.5 1.5 0 0113 2.5V8.5A1.5 1.5 0 0111.5 10H10" stroke="currentColor" strokeWidth="1.3"/></svg>
            </IconBtn>
            <IconBtn title="Delete block" onClick={e => { e.stopPropagation(); CONFIRM_DELETE.has(block.type) ? setConfirmDelete(true) : dispatch({ type: 'REMOVE_BLOCK', id: block.id }); }} className="text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-red-500/10">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4.5M8.5 6v4.5M3 3.5l.75 8a1 1 0 001 .9h4.5a1 1 0 001-.9l.75-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </IconBtn>
          </div>
        )}

        {/* Width % badge */}
        {showControls && blockWidth !== 100 && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 bg-[var(--accent)] text-white text-[9px] px-1.5 py-0.5 rounded-t-md pointer-events-none select-none">{blockWidth}%</div>
        )}

        {/* Left selection bar */}
        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--accent)] z-20 pointer-events-none" />}

        <BlockRenderer block={block} />

        {/* Right-edge width resize handle */}
        {showControls && (
          <div onMouseDown={handleResizeStart} onClick={e => e.stopPropagation()} title="Drag to resize width"
            className="absolute right-0 top-0 bottom-0 w-3 z-30 flex items-center justify-center cursor-col-resize"
            style={{ transform: 'translateX(50%)' }}>
            <div className="w-1 h-10 rounded-full bg-[var(--accent)] opacity-70 hover:opacity-100 hover:w-1.5 transition-all" />
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={e => e.stopPropagation()}>
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl p-5 shadow-2xl flex flex-col gap-3 max-w-xs w-full mx-4">
            <div><div className="font-semibold text-sm text-[var(--text-primary)]">Delete this block?</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">Undo with Ctrl+Z.</div></div>
            <div className="flex gap-2">
              <button autoFocus onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-lg border border-[var(--border)] text-xs text-[var(--text-muted)] hover:text-white">Cancel</button>
              <button onClick={() => { dispatch({ type: 'REMOVE_BLOCK', id: block.id }); setConfirmDelete(false); }} className="flex-1 py-2 rounded-lg bg-[var(--danger)] text-white text-xs font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DropZoneEmpty() {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas_empty' });
  return (
    <div ref={setNodeRef} className={`flex-1 flex flex-col items-center justify-center gap-5 transition-all ${isOver ? 'bg-[var(--accent-glow)]' : ''}`} style={{ minHeight: 500 }}>
      <div className={`w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all ${isOver ? 'border-[var(--accent)] scale-110' : 'border-[var(--border)]'}`}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className={isOver ? 'text-[var(--accent)]' : 'text-[var(--text-faint)]'}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </div>
      <div className="text-center">
        <div className="text-[var(--text-muted)] font-semibold text-sm">{isOver ? 'Release to add' : 'Canvas is empty'}</div>
        <div className="text-[var(--text-faint)] text-xs mt-1">Drag or click a block from the left panel</div>
      </div>
      <div className="flex items-center gap-2">
        {['🚀 Hero','⊞ Row','🔘 Button'].map(h => (
          <div key={h} className="px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-faint)]">{h}</div>
        ))}
      </div>
    </div>
  );
}

export default function Canvas() {
  const { state, dispatch } = useBuilder();
  const { blocks, selectedId, preview, frame, zoom } = state;

  const patternStyle = frame.pattern === 'dots'
    ? { backgroundImage: 'radial-gradient(circle,#c0c0c0 1px,transparent 1px)', backgroundSize: '20px 20px' }
    : frame.pattern === 'grid'
    ? { backgroundImage: 'linear-gradient(#e0e0e0 1px,transparent 1px),linear-gradient(90deg,#e0e0e0 1px,transparent 1px)', backgroundSize: '32px 32px' }
    : frame.pattern === 'lines'
    ? { backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 30px,#e0e0e0 30px,#e0e0e0 31px)' }
    : {};

  const scale = (zoom || 100) / 100;

  return (
    <main className="flex-1 overflow-auto flex flex-col items-center bg-[var(--bg-deep)]"
      style={{ padding: '24px 24px 60px' }}
      onClick={e => { if (e.target === e.currentTarget) dispatch({ type: 'DESELECT' }); }}>

      {/* Zoom + preview label */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        {PREVIEW_LABELS[preview] && (
          <div className="px-3 py-1 bg-[var(--bg-panel)] border border-[var(--border)] rounded-full text-[11px] text-[var(--text-faint)] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"/>{PREVIEW_LABELS[preview]}
          </div>
        )}
        <div className="flex items-center gap-2 bg-[var(--bg-panel)] border border-[var(--border)] rounded-full px-3 py-1">
          <button onClick={() => dispatch({ type:'SET_ZOOM', zoom: Math.max(25,(zoom||100)-10) })} className="text-[var(--text-muted)] hover:text-white w-5 h-5 flex items-center justify-center text-sm font-bold">−</button>
          <input type="range" min="25" max="150" step="5" value={zoom||100} onChange={e => dispatch({ type:'SET_ZOOM', zoom: Number(e.target.value) })} className="w-24 accent-[var(--accent)]"/>
          <button onClick={() => dispatch({ type:'SET_ZOOM', zoom: Math.min(150,(zoom||100)+10) })} className="text-[var(--text-muted)] hover:text-white w-5 h-5 flex items-center justify-center text-sm font-bold">+</button>
          <span className="text-[11px] text-[var(--text-faint)] w-8 text-center">{zoom||100}%</span>
          {zoom !== 100 && <button onClick={() => dispatch({ type:'SET_ZOOM', zoom:100 })} className="text-[9px] text-[var(--accent)] hover:underline">Reset</button>}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ width: PREVIEW_WIDTHS[preview], maxWidth:'100%', transformOrigin:'top center', transform:`scale(${scale})`, marginBottom: scale < 1 ? `${(1-scale)*-600}px` : 0 }}>
        <div data-blockwise-canvas style={{ background: frame.bg, borderRadius: frame.radius, overflow:'hidden', minHeight:600, boxShadow: preview!=='desktop'?'0 0 0 1px rgba(255,255,255,0.06),0 20px 60px rgba(0,0,0,0.5)':'none', transition:'width 0.35s ease', ...patternStyle }}
          onClick={e => { if (e.target===e.currentTarget) dispatch({ type:'DESELECT' }); }}>
          {blocks.length === 0 ? <DropZoneEmpty /> : (
            <SortableContext items={blocks.map(b=>b.id)} strategy={verticalListSortingStrategy}>
              {blocks.map((block, i) => (
                <BlockWrapper key={block.id} block={block} isSelected={selectedId===block.id} index={i} total={blocks.length}/>
              ))}
            </SortableContext>
          )}
        </div>
      </div>

      {blocks.length > 0 && (
        <div className="mt-6 flex items-center gap-3 text-[10px] text-[var(--text-faint)] flex-shrink-0">
          {[['Del','delete'],['Esc','deselect'],['Ctrl Z','undo']].map(([k,l]) => (
            <span key={k}><kbd className="bg-[var(--bg-card)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[9px]">{k}</kbd> {l}</span>
          ))}
        </div>
      )}
    </main>
  );
}
