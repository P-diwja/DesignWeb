import { useCallback, useEffect, useState } from 'react';
import {
  DndContext, PointerSensor, useSensor, useSensors,
  closestCenter, MouseSensor, TouchSensor,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { BuilderProvider, useBuilder } from './store/BuilderStore';
import Toolbar from './components/Toolbar';
import BlocksPalette from './components/BlocksPalette';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';

function BuilderApp() {
  const { state, dispatch, undo, redo } = useBuilder();
  const { blocks } = state;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (e.key === 'Escape') dispatch({ type: 'DESELECT' });
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedId) {
        dispatch({ type: 'REMOVE_BLOCK', id: state.selectedId });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, state.selectedId, dispatch]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;

    // Dropped from palette
    if (activeData?.type === 'palette') {
      const blockType = activeData.blockType;
      const overIndex = blocks.findIndex(b => b.id === over.id);
      dispatch({ type: 'ADD_BLOCK', blockType, index: overIndex >= 0 ? overIndex : undefined });
      return;
    }

    // Reordering canvas blocks
    if (activeData?.type === 'canvas' && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        dispatch({ type: 'REORDER_BLOCKS', blocks: arrayMove(blocks, oldIndex, newIndex) });
      }
    }
  }, [blocks, dispatch]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
        <Toolbar />
        <div className="flex flex-1 overflow-hidden">
          <BlocksPalette />
          <Canvas />
          <PropertiesPanel />
        </div>
      </div>
    </DndContext>
  );
}

export default function App() {
  return (
    <BuilderProvider>
      <BuilderApp />
    </BuilderProvider>
  );
}
