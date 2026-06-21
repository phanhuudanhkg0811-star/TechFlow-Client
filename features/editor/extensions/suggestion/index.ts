import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
  keymap,
} from "@codemirror/view";
import { StateEffect, StateField } from "@codemirror/state";

import { fetcher } from "./fetcher";
import {
  AI_SUGGESTION_CHANGE_EVENT,
  isCandidateAiSuggestionEnabled,
} from "@/features/editor/ai-suggestion-preference";

// StateEffect: A way to send "messages" to update state.
// We define one effect type for setting the suggestion text.
const setSuggestionEffect = StateEffect.define<string | null>();

// StateField: Holds our suggestion state in the editor.
// - create(): Returns the initial value when the editor loads
// - update(): Called on every transaction (keystroke, etc.) to potentially update the value
const suggestionState = StateField.define<string | null>({
  create() {
    return null;
  },
  update(value, transaction) {
    // Check each effect in this transaction
    // If we find our setSuggestionEffect, return its new value
    // Otherwise, keep the current value unchanged
    for (const effect of transaction.effects) {
      if (effect.is(setSuggestionEffect)) {
        return effect.value;
      }
    }
    return value;
  },
});

// WidgetType: Creates custom DOM elements to display in the editor.
// toDOM() is called by CodeMirror to create the actual HTML element.
class SuggestionWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.textContent = this.text;
    span.style.opacity = "0.4"; // Ghost text appearance
    span.style.pointerEvents = "none"; // Don't interfere with clicks
    return span;
  }
}

let debounceTimer: number | null = null;
let isWaitingForSuggestion = false;
const DEBOUNCE_DELAY = 5000;
let currentAbortController: AbortController | null = null;

const scheduleSuggestionDispatch = (
  view: EditorView,
  suggestion: string | null,
) => {
  window.setTimeout(() => {
    if (!view.dom.isConnected) return;

    view.dispatch({ effects: setSuggestionEffect.of(suggestion) });
  }, 0);
};

const clearSuggestion = (view: EditorView) => {
  if (view.state.field(suggestionState, false) === null) return;
  scheduleSuggestionDispatch(view, null);
};

const generatePayload = (view: EditorView, fileName: string, testId: string) => {
  const code = view.state.doc.toString();
  if (!code || code.trim().length === 0) return null;

  const cursorPosition = view.state.selection.main.head;
  const currentLine = view.state.doc.lineAt(cursorPosition);
  const cursorInLine = cursorPosition - currentLine.from;

  const previousLines: string[] = [];
  const previousLinesToFetch = Math.min(5, currentLine.number - 1);
  for (let i = previousLinesToFetch; i >= 1; i--) {
    previousLines.push(view.state.doc.line(currentLine.number - i).text);
  }

  const nextLines: string[] = [];
  const totalLines = view.state.doc.lines;
  const linesToFetch = Math.min(5, totalLines - currentLine.number);
  for (let i = 1; i <= linesToFetch; i++) {
    nextLines.push(view.state.doc.line(currentLine.number + i).text);
  }

  return {
    testId,
    fileName,
    code,
    currentLine: currentLine.text,
    previousLines: previousLines.join("\n"),
    textBeforeCursor: currentLine.text.slice(0, cursorInLine),
    textAfterCursor: currentLine.text.slice(cursorInLine),
    nextLines: nextLines.join("\n"),
    lineNumber: currentLine.number,
  }
}

const createDebouncePlugin = (fileName: string, testId: string) => {
  return ViewPlugin.fromClass(
    class {
      private view: EditorView;

      private handleAiSuggestionToggle = () => {
        if (currentAbortController !== null) {
          currentAbortController.abort();
          currentAbortController = null;
        }

        isWaitingForSuggestion = false;
        clearSuggestion(this.view);
        if (debounceTimer !== null) {
          clearTimeout(debounceTimer);
          debounceTimer = null;
        }
      };

      constructor(view: EditorView) {
        this.view = view;
        window.addEventListener(
          AI_SUGGESTION_CHANGE_EVENT,
          this.handleAiSuggestionToggle,
        );
        this.triggerSuggestion(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet) {
          this.triggerSuggestion(update.view);
        }
      }

      triggerSuggestion(view: EditorView) {
        if (!isCandidateAiSuggestionEnabled()) {
          isWaitingForSuggestion = false;
          clearSuggestion(view);
          return;
        }

        if (debounceTimer !== null) {
          clearTimeout(debounceTimer);
        }

        if (currentAbortController !== null) {
          currentAbortController.abort();
        }

        isWaitingForSuggestion = true;

        debounceTimer = window.setTimeout(async () => {
          const payload = generatePayload(view, fileName, testId);
          if (!payload) {
            isWaitingForSuggestion = false;
            clearSuggestion(view);
            return;
          }
          currentAbortController = new AbortController();
          const suggestion = await fetcher(
            payload,
            currentAbortController.signal
          );

          isWaitingForSuggestion = false;
          scheduleSuggestionDispatch(view, suggestion);
        }, DEBOUNCE_DELAY);
      }

      destroy() {
        window.removeEventListener(
          AI_SUGGESTION_CHANGE_EVENT,
          this.handleAiSuggestionToggle,
        );

        if (debounceTimer !== null) {
          clearTimeout(debounceTimer);
        }

        if (currentAbortController !== null) {
          currentAbortController.abort();
        }
      }
    }
  )
}

const renderPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.build(view);
    }

    update(update: ViewUpdate) {
      // Rebuild decorations if doc changed, cursor moved, or suggestion changed
      const suggestionChanged = update.transactions.some((transaction) => {
        return transaction.effects.some((effect) => {
          return effect.is(setSuggestionEffect);
        });
      });

      // Rebuild decorations if doc changed, cursor moved, or suggestion changed
      const shouldRebuild =
        update.docChanged || update.selectionSet || suggestionChanged;

      if (shouldRebuild) {
        this.decorations = this.build(update.view);
      }
    }

    build(view: EditorView) {
      if (isWaitingForSuggestion) {
        return Decoration.none;
      }

      // Get current suggestion from state
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) {
        return Decoration.none;
      }

      // Create a widget decoration at the cursor position
      const cursor = view.state.selection.main.head;
      return Decoration.set([
        Decoration.widget({
          widget: new SuggestionWidget(suggestion),
          side: 1, // Render after cursor (side: 1), not before (side: -1)
        }).range(cursor),
      ]);
    }
  },
  { decorations: (plugin) => plugin.decorations } // Tell CodeMirror to use our decorations
);

const acceptSuggestionKeymap = keymap.of([
  {
    key: "Tab",
    run: (view) => {
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) {
        return false; // No suggestion? Let Tab do its normal thing (indent)
      }

      const cursor = view.state.selection.main.head;
      view.dispatch({
        changes: { from: cursor, insert: suggestion }, // Insert the suggestion text
        selection: { anchor: cursor + suggestion.length }, // Move cursor to end
        effects: setSuggestionEffect.of(null), // Clear the suggestion
      });
      return true; // We handled Tab, don't indent
    },
  },
]);

export const suggestion = (fileName: string, testId: string) => [
  suggestionState, // Our state storage
  createDebouncePlugin(fileName, testId), // Triggers suggestions on typing
  renderPlugin, // Renders the ghost text
  acceptSuggestionKeymap, // Tab to accept
];
