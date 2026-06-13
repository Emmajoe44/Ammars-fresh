const PRINT_STYLES = `
  @page { size: A4; margin: 14mm 12mm; }
  body { margin: 0; color: #0f172a; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }
`;

function restorePrintDoc(previous: string | null) {
  if (previous) document.body.setAttribute("data-print-doc", previous);
  else document.body.removeAttribute("data-print-doc");
}

function printHtmlInWindow(win: Window, html: string): boolean {
  const doc = win.document;
  doc.open();
  doc.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Print</title><style>${PRINT_STYLES}</style></head><body>${html}</body></html>`,
  );
  doc.close();
  try {
    win.focus();
    win.print();
    return true;
  } catch {
    return false;
  }
}

function printViaIframe(selector: string): boolean {
  const source = document.querySelector<HTMLElement>(selector);
  if (!source) return false;

  const iframe = document.createElement("iframe");
  iframe.setAttribute(
    "style",
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden",
  );
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  if (!win || !printHtmlInWindow(win, source.innerHTML)) {
    iframe.remove();
    return false;
  }

  const cleanup = () => iframe.remove();
  win.addEventListener("afterprint", cleanup, { once: true });
  setTimeout(cleanup, 60_000);
  return true;
}

function printViaPopup(selector: string): boolean {
  const source = document.querySelector<HTMLElement>(selector);
  if (!source) return false;

  const popup = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!popup) return false;

  if (!printHtmlInWindow(popup, source.innerHTML)) {
    popup.close();
    return false;
  }

  popup.addEventListener("afterprint", () => popup.close(), { once: true });
  setTimeout(() => popup.close(), 60_000);
  return true;
}

/**
 * Print a document variant that is already rendered in the page
 * (`.print-area[data-print-doc="…"]`). No React state update — works inside
 * the same user-gesture and avoids "No browsing context" in strict embeds.
 */
export function printDocument(docType: string) {
  if (typeof window === "undefined") return;

  const previous = document.body.getAttribute("data-print-doc");
  document.body.setAttribute("data-print-doc", docType);

  const selector = `.print-area[data-print-doc="${docType}"]`;
  const cleanup = () => restorePrintDoc(previous);

  window.addEventListener("afterprint", cleanup, { once: true });

  let printed = false;
  try {
    window.print();
    printed = true;
  } catch {
    // Main window print blocked (e.g. embedded preview).
  }

  if (!printed) {
    cleanup();
    if (!printViaIframe(selector)) printViaPopup(selector);
  }
}
