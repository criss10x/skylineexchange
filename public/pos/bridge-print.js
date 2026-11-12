/**
 * Skyline Exchange - Print Bridge client
 * Sends raw ESC/POS bytes to "Skyline Print Bridge" (public/pos/print-bridge/SkylinePrintBridge.cmd),
 * a small helper on the cashier PC that hands them to a Windows printer as RAW.
 * This is the path for USB printers that already have a Windows driver (e.g. iWare DM-76H):
 * the driver holds the USB port, so WebUSB cannot open it.
 */

class BridgePrinter {
  constructor(baseUrl = 'http://127.0.0.1:9123') {
    this.baseUrl = baseUrl;
    this.isConnected = false;
    this.version = '';
    this.printers = [];
    this.suggested = '';
    this.onStatusChange = null;
  }

  // Chosen printer is per PC, so it lives in this browser rather than in the shared settings
  get printerName() {
    try { return localStorage.getItem('pos_bridge_printer') || ''; } catch { return ''; }
  }

  set printerName(name) {
    try {
      if (name) localStorage.setItem('pos_bridge_printer', name);
      else localStorage.removeItem('pos_bridge_printer');
    } catch {}
  }

  // Set after the first successful check; only then does the POS probe the bridge on its own
  get wasSeen() {
    try { return localStorage.getItem('pos_bridge_seen') === '1'; } catch { return false; }
  }

  // Saved choice if Windows still has it, else the printer the bridge recognised as a receipt printer
  activePrinter() {
    const saved = this.printerName;
    if (saved && this.printers.includes(saved)) return saved;
    return this.suggested || '';
  }

  async check(timeoutMs = 2000) {
    try {
      const res = await fetch(`${this.baseUrl}/status`, { cache: 'no-store', signal: AbortSignal.timeout(timeoutMs) });
      const data = await res.json();
      this.isConnected = !!data.ok;
      this.version = data.version || '';
      this.printers = Array.isArray(data.printers) ? data.printers : [];
      this.suggested = data.suggested || '';
      if (this.isConnected) { try { localStorage.setItem('pos_bridge_seen', '1'); } catch {} }
    } catch {
      this.isConnected = false;
      this.printers = [];
      this.suggested = '';
    }
    if (this.onStatusChange) this.onStatusChange(this);
    return this.isConnected;
  }

  async print(escPosBytes) {
    const name = this.activePrinter();
    if (!name) throw new Error('Printer struk belum dipilih di Pengaturan > Printer.');
    let res;
    try {
      res = await fetch(`${this.baseUrl}/print?printer=${encodeURIComponent(name)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: escPosBytes,
        signal: AbortSignal.timeout(20000)
      });
    } catch {
      this.isConnected = false;
      if (this.onStatusChange) this.onStatusChange(this);
      throw new Error('Skyline Print Bridge tidak aktif di PC ini.');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || `Print Bridge HTTP ${res.status}`);
    return name;
  }
}

if (typeof window !== 'undefined') {
  window.BridgePrinter = BridgePrinter;
}
