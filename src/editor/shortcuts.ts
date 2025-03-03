import type { InlineShortcutDefinition } from '../public/options';
import { LETTER } from '../core-definitions/definitions';
import type { Atom } from '../core/atom';

import { MathfieldOptionsPrivate } from './options';

export { InlineShortcutDefinition };

/**
 * Return an array of potential shortcuts
 */
export function countInlineShortcutsStartingWith(
  s: string,
  config: MathfieldOptionsPrivate
): number {
  let count = 0;

  for (const key of Object.keys(config.inlineShortcuts)) {
    if (key.startsWith(s)) count += 1;
  }

  return count;
}

/**
 *
 * @param siblings atoms preceding this potential shortcut
 */
function validateShortcut(
  siblings: null | Atom[],
  shortcut: InlineShortcutDefinition
): string {
  if (!shortcut) return '';

  // If it's a simple shortcut (no conditional), it's always valid
  if (typeof shortcut === 'string') return shortcut;

  // If we have no context, we assume all the shortcuts are valid
  if (!siblings) return shortcut.value;

  let nothing = false;
  let letter = false;
  let digit = false;
  let isFunction = false;
  let frac = false;
  let surd = false;
  let binop = false;
  let relop = false;
  let operator = false;
  let punct = false;
  let array = false;
  let openfence = false;
  let closefence = false;
  let text = false;
  let space = false;
  let sibling = siblings[siblings.length - 1];
  let index = siblings.length - 1;
  while (sibling && /msubsup|placeholder/.test(sibling.type)) {
    index -= 1;
    sibling = siblings[index];
  }

  nothing = !sibling || sibling.type === 'first'; // Start of a group
  if (sibling) {
    if (shortcut.mode !== undefined && sibling.mode !== shortcut.mode) {
      return '';
    }

    text = sibling.mode === 'text';
    letter = !text && sibling.type === 'mord' && LETTER.test(sibling.value);
    digit = !text && sibling.type === 'mord' && /\d+$/.test(sibling.value);
    isFunction = !text && sibling.isFunction;
    frac = sibling.type === 'genfrac';
    surd = sibling.type === 'surd';
    binop = sibling.type === 'mbin';
    relop = sibling.type === 'mrel';
    operator = sibling.type === 'mop';
    punct = sibling.type === 'mpunct' || sibling.type === 'minner';
    array = sibling.type === 'array';
    openfence = sibling.type === 'mopen';
    closefence = sibling.type === 'mclose' || sibling.type === 'leftright';
    space = sibling.type === 'space';
  }

  if (shortcut.after !== undefined) {
    // If this is a conditional shortcut, consider the conditions now
    if (
      (shortcut.after.includes('nothing') && nothing) ||
      (shortcut.after.includes('letter') && letter) ||
      (shortcut.after.includes('digit') && digit) ||
      (shortcut.after.includes('function') && isFunction) ||
      (shortcut.after.includes('frac') && frac) ||
      (shortcut.after.includes('surd') && surd) ||
      (shortcut.after.includes('binop') && binop) ||
      (shortcut.after.includes('relop') && relop) ||
      (shortcut.after.includes('operator') && operator) ||
      (shortcut.after.includes('punct') && punct) ||
      (shortcut.after.includes('array') && array) ||
      (shortcut.after.includes('openfence') && openfence) ||
      (shortcut.after.includes('closefence') && closefence) ||
      (shortcut.after.includes('text') && text) ||
      (shortcut.after.includes('space') && space)
    ) {
      return shortcut.value;
    }

    return '';
  }

  return shortcut.value;
}

/**
 *
 * @param context - atoms preceding the candidate, potentially used
 * to reduce which shortcuts are applicable. If 'null', no restrictions are
 * applied.
 * @param s - candidate inline shortcuts (e.g. `'pi'`)
 * @return A replacement string matching the shortcut (e.g. `'\pi'`)
 */
export function getInlineShortcut(
  context: null | Atom[],
  s: string,
  shortcuts?: Record<string, InlineShortcutDefinition>
): string {
  if (!shortcuts) return '';
  return validateShortcut(context, shortcuts[s]);
}
