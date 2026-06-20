// ═══════════════════════════════════════════════════════════
//  THE ONE RING CHRONICLES - SAVE/LOAD SYSTEM
//  localStorage persistence
// ═══════════════════════════════════════════════════════════

import type { GameState } from './types';

const SAVE_KEY = 'one_ring_chronicles_save';

export function saveGame(state: GameState): boolean {
  try {
    const saveData = JSON.stringify(state);
    localStorage.setItem(SAVE_KEY, saveData);
    return true;
  } catch (e) {
    console.error('Failed to save game:', e);
    return false;
  }
}

export function loadGame(): GameState | null {
  try {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) return null;
    return JSON.parse(saveData) as GameState;
  } catch (e) {
    console.error('Failed to load game:', e);
    return null;
  }
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function deleteSave(): boolean {
  try {
    localStorage.removeItem(SAVE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

export function exportSave(): string {
  const saveData = localStorage.getItem(SAVE_KEY);
  return saveData ? btoa(saveData) : '';
}

export function importSave(encoded: string): boolean {
  try {
    const decoded = atob(encoded);
    JSON.parse(decoded); // validate
    localStorage.setItem(SAVE_KEY, decoded);
    return true;
  } catch (e) {
    return false;
  }
}
