import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { createBlock } from '../utils/blocks';

const BuilderContext = createContext(null);

const MAX_HISTORY = 50;

function cloneBlocks(blocks) {
  return blocks.map(b => ({ ...b, props: { ...b.props, cards: b.props.cards ? b.props.cards.map(c => ({ ...c })) : undefined } }));
}

function builderReducer(state, action) {
  switch (action.type) {
    case 'SET_BLOCKS':
      return { ...state, blocks: action.blocks };

    case 'ADD_BLOCK': {
      const newBlock = createBlock(action.blockType);
      const blocks = [...state.blocks];
      if (action.index !== undefined) {
        blocks.splice(action.index, 0, newBlock);
      } else {
        blocks.push(newBlock);
      }
      return { ...state, blocks, selectedId: newBlock.id };
    }

    case 'REMOVE_BLOCK':
      return {
        ...state,
        blocks: state.blocks.filter(b => b.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };

    case 'DUPLICATE_BLOCK': {
      const idx = state.blocks.findIndex(b => b.id === action.id);
      if (idx === -1) return state;
      const original = state.blocks[idx];
      const clone = {
        ...original,
        id: `${original.type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        props: { ...original.props, cards: original.props.cards ? original.props.cards.map(c => ({ ...c })) : undefined },
      };
      const blocks = [...state.blocks];
      blocks.splice(idx + 1, 0, clone);
      return { ...state, blocks, selectedId: clone.id };
    }

    case 'MOVE_BLOCK': {
      const { id, direction } = action;
      const idx = state.blocks.findIndex(b => b.id === id);
      if (idx === -1) return state;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= state.blocks.length) return state;
      const blocks = [...state.blocks];
      [blocks[idx], blocks[newIdx]] = [blocks[newIdx], blocks[idx]];
      return { ...state, blocks };
    }

    case 'REORDER_BLOCKS':
      return { ...state, blocks: action.blocks };

    case 'UPDATE_BLOCK_PROP': {
      const blocks = state.blocks.map(b =>
        b.id === action.id ? { ...b, props: { ...b.props, [action.key]: action.value } } : b
      );
      return { ...state, blocks };
    }

    case 'UPDATE_BLOCK_PROPS': {
      const blocks = state.blocks.map(b =>
        b.id === action.id ? { ...b, props: { ...b.props, ...action.props } } : b
      );
      return { ...state, blocks };
    }

    case 'SELECT_BLOCK':
      return { ...state, selectedId: action.id };

    case 'DESELECT':
      return { ...state, selectedId: null };

    case 'SET_PREVIEW':
      return { ...state, preview: action.mode };

    case 'SET_ZOOM':
      return { ...state, zoom: action.zoom };

    case 'SET_FRAME':
      return { ...state, frame: { ...state.frame, ...action.frame } };

    case 'LOAD_PROJECT':
      return { ...action.state, history: [], future: [] };

    default:
      return state;
  }
}

const INITIAL_STATE = {
  blocks: [],
  selectedId: null,
  preview: 'desktop',
  zoom: 100,
  frame: { bg: '#ffffff', pattern: 'none', radius: 0 },
  history: [],
  future: [],
};

// Track which actions should push to history
const HISTORY_ACTIONS = new Set([
  'ADD_BLOCK', 'REMOVE_BLOCK', 'DUPLICATE_BLOCK', 'MOVE_BLOCK',
  'REORDER_BLOCKS', 'UPDATE_BLOCK_PROP', 'UPDATE_BLOCK_PROPS', 'SET_FRAME',
]);

function withHistory(reducer) {
  return function(state, action) {
    if (action.type === 'UNDO') {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        ...state,
        ...prev,
        history: state.history.slice(0, -1),
        future: [{ blocks: state.blocks, frame: state.frame }, ...state.future.slice(0, MAX_HISTORY - 1)],
      };
    }
    if (action.type === 'REDO') {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        ...state,
        ...next,
        history: [...state.history.slice(-MAX_HISTORY + 1), { blocks: state.blocks, frame: state.frame }],
        future: state.future.slice(1),
      };
    }

    const newState = reducer(state, action);

    if (HISTORY_ACTIONS.has(action.type)) {
      return {
        ...newState,
        history: [...state.history.slice(-MAX_HISTORY + 1), { blocks: cloneBlocks(state.blocks), frame: state.frame }],
        future: [],
      };
    }
    return newState;
  };
}

const fullReducer = withHistory(builderReducer);

export function BuilderProvider({ children }) {
  const [state, dispatch] = useReducer(fullReducer, INITIAL_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('blockwise_project');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_PROJECT', state: { ...INITIAL_STATE, ...parsed, history: [], future: [] } });
      }
    } catch {}
  }, []);

  // Save to localStorage on change (debounced)
  const saveTimer = useRef(null);
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem('blockwise_project', JSON.stringify({
          blocks: state.blocks,
          frame: state.frame,
        }));
      } catch {}
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [state.blocks, state.frame]);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const canUndo = state.history.length > 0;
  const canRedo = state.future.length > 0;

  return (
    <BuilderContext.Provider value={{ state, dispatch, undo, redo, canUndo, canRedo }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  return useContext(BuilderContext);
}
