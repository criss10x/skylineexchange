/**
 * Skyline Exchange - USB ESC/POS Thermal Printer Driver
 * Supports WebUSB API for direct USB connection to thermal receipt printers,
 * with automatic endpoint discovery and graceful fallback to system print.
 */

class UsbPrinter {
  constructor() {
    this.device = null;
    this.endpointOut = null;
    this.interfaceNumber = null;
    this.isConnected = false;
    this.onStatusChange = null;
  }

  isSupported() {
    return typeof navigator !== 'undefined' && 'usb' in navigator;
  }

  updateStatus(status, text) {
    if (this.onStatusChange) {
      this.onStatusChange({ connected: this.isConnected, status, text });
    }
  }

  async connect() {
    if (!this.isSupported()) {
      if (typeof window !== 'undefined' && window.isSecureContext === false) {
        throw new Error('WebUSB membutuhkan koneksi aman HTTPS atau localhost.');
      }
      throw new Error('WebUSB tidak didukung di browser ini. Gunakan Google Chrome atau Microsoft Edge di PC/Android.');
    }

    try {
      this.updateStatus('connecting', 'Mencari printer USB...');

      // Open chooser dialog for any USB thermal printer
      this.device = await navigator.usb.requestDevice({ filters: [] });

      await this.device.open();
      if (this.device.configuration === null) {
        await this.device.selectConfiguration(1);
      }

      // Search configuration for printer interface and bulk OUT endpoint
      let targetInterface = null;
      let targetEndpoint = null;

      if (this.device.configuration && Array.isArray(this.device.configuration.interfaces)) {
        for (const iface of this.device.configuration.interfaces) {
          if (Array.isArray(iface.alternates)) {
            for (const alt of iface.alternates) {
              const outEp = alt.endpoints?.find(e => e.direction === 'out' && (e.type === 'bulk' || e.type === 'interrupt'));
              if (outEp) {
                targetInterface = iface.interfaceNumber;
                targetEndpoint = outEp.endpointNumber;
                break;
              }
            }
          }
          if (targetEndpoint !== null) break;
        }
      }

      if (targetInterface === null) {
        targetInterface = 0;
        const alt = this.device.configuration?.interfaces?.[0]?.alternates?.[0];
        const outEp = alt?.endpoints?.find(e => e.direction === 'out');
        targetEndpoint = outEp ? outEp.endpointNumber : 1;
      }

      try {
        await this.device.claimInterface(targetInterface);
      } catch (claimErr) {
        await this.device.close();
        throw new Error('Port USB printer sedang digunakan secara eksklusif oleh Windows Driver. Gunakan tombol "Cetak USB / Driver" untuk mencetak langsung lewat Windows.');
      }

      this.interfaceNumber = targetInterface;
      this.endpointOut = targetEndpoint;
      this.isConnected = true;

      const deviceName = this.device.productName || 'USB Thermal Printer';
      this.updateStatus('connected', `Terhubung: ${deviceName}`);
      return deviceName;
    } catch (err) {
      this.isConnected = false;
      this.updateStatus('error', err.message);
      throw err;
    }
  }

  async disconnect() {
    if (this.device && this.device.opened) {
      try {
        if (this.interfaceNumber !== null) {
          await this.device.releaseInterface(this.interfaceNumber);
        }
        await this.device.close();
      } catch {
        // Ignore disconnect errors
      }
    }
    this.isConnected = false;
    this.device = null;
    this.endpointOut = null;
    this.interfaceNumber = null;
    this.updateStatus('disconnected', 'Printer USB terputus');
  }

  async print(escPosBytes) {
    if (!this.isConnected || !this.device || !this.device.opened) {
      throw new Error('Printer USB belum terhubung.');
    }

    this.updateStatus('printing', 'Mengirim data ke printer USB...');

    // Transmit in 64-byte chunks
    const CHUNK_SIZE = 64;
    for (let offset = 0; offset < escPosBytes.length; offset += CHUNK_SIZE) {
      const chunk = escPosBytes.slice(offset, offset + CHUNK_SIZE);
      await this.device.transferOut(this.endpointOut, chunk);
    }

    this.updateStatus('connected', `Terhubung: ${this.device.productName || 'USB Thermal Printer'}`);
    return true;
  }
}

if (typeof window !== 'undefined') {
  window.UsbPrinter = UsbPrinter;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UsbPrinter;
}
