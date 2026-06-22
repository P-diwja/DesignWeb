import { useDraggable } from '@dnd-kit/core';
import { BLOCK_TYPES, BLOCK_ORDER } from '../utils/blocks';
import { useBuilder } from '../store/BuilderStore';

/**
 * Nielsen fixes:
 * #1 Visibility — active drag shows "dragging" state clearly
 * #4 Consistency — all block items same height, same icon+label+desc structure
 * #6 Recognition over recall — descriptions always visible, not just on hover
 * #8 Aesthetic — clean hierarchy, muted descriptions, accent on action
 * #10 Help — tip at bottom explains both interaction modes
 */

function DraggableBlockItem({ type, def, blockCount }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette_${type}`,
    data: { type: 'palette', blockType: type },
  });
  const { dispatch } = useBuilder();

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      role="button"
      aria-label={`Add ${def.label} block. ${def.description}`}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dispatch({ type: 'ADD_BLOCK', blockType: type }); } }}
      onClick={() => dispatch({ type: 'ADD_BLOCK', blockType: type })}
      style={{ opacity: isDragging ? 0.35 : 1 }}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing transition-all hover:bg-[var(--bg-hover)] border border-transparent hover:border-[var(--border)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] select-none"
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)] flex items-center justify-center text-base flex-shrink-0 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-glow)] transition-all">
        {def.icon}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[var(--text-primary)] leading-tight">{def.label}</div>
        <div className="text-[11px] text-[var(--text-faint)] truncate mt-0.5">{def.description}</div>
      </div>

      {/* Add indicator */}
      <div className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0 transition-all">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 2v6M2 5h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
    </div>
  );
}

export default function BlocksPalette() {
  const { state } = useBuilder();
  const blockCount = state.blocks.length;

  return (
    <aside
      className="w-56 flex-shrink-0 border-r border-[var(--border)] bg-[var(--bg-panel)] flex flex-col overflow-hidden"
      aria-label="Block palette"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)]">Blocks</h2>
        <p className="text-[11px] text-[var(--text-faint)] mt-0.5">
          {BLOCK_ORDER.length} types available
        </p>
      </div>

      {/* Block list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {BLOCK_ORDER.map(type => (
          <DraggableBlockItem key={type} type={type} def={BLOCK_TYPES[type]} blockCount={blockCount} />
        ))}
      </div>

      {/* Footer hint (#10 Help) */}
      <div className="px-4 py-3 border-t border-[var(--border)] flex-shrink-0 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-faint)]">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 3v2.5L7.5 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <span><strong className="text-[var(--text-muted)]">Click</strong> to append at bottom</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-faint)]">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <span><strong className="text-[var(--text-muted)]">Drag</strong> to place anywhere</span>
        </div>
      </div>
    </aside>
  );
}
