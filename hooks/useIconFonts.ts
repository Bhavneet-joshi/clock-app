import { useState } from 'react';

/**
 * This hook is kept for backwards compatibility, but simplified since we no longer use vector icons.
 * It now immediately returns true since we're using pixel-style text icons instead.
 */
export default function useIconFonts() {
  // Always return true since we don't need icon fonts anymore
  return true;
} 