/**
 * Skyline Exchange - Serial / COM Port ESC/POS Thermal Printer Driver
 * Supports Web Serial API for direct communication with thermal printers
 * connected via USB-Serial or paired via Bluetooth Virtual COM ports in Windows.
 */

class SerialPrinter {
  constructor() {
    this.port = null;
    this.isConnected = false;
    this.onStatusChange = null;
    this.baudRate = 9600;
  }

  isSupported() {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  updateStatus(status, text) {
    if (this.onStatusChange) {
      this.onStatusChange({ connected: this.isConnected, status, text });
    }
  }

  async connect() {
    if (!this.isSupported()) {
      if (typeof window !== 'undefined' && window.isSecureContext === false) {
        throw new Error('Web Serial membutuhkan koneksi aman HTTPS atau localhost.');
      }
      throw new Error('Web Serial tidak didukung di browser ini. Gunakan Google Chrome atau Microsoft Edge di PC.');
    }

    try {
      this.updateStatus('connecting', 'Mencari port Serial / COM printer...');

      // Request user to select a serial port (shows paired Bluetooth and USB COM ports)
      this.port = await navigator.serial.requestPort();

      // Common POS printer baud rates: default 9600, or fallback to 115200 / 38400
      try {
        await this.port.open({ baudRate: 9600 });
        this.baudRate = 9600;
      } catch (openErr) {
        try {
          await this.port.open({ baudRate: 115200 });
          this.baudRate = 115200;
        } catch {
          if (!this.port.writable) {
            throw openErr;
          }
        }
      }

      this.isConnected = true;
      const info = this.port.getInfo ? this.port.getInfo() : {};
      const portDesc = info.usbVendorId ? `USB COM (0x${info.usbVendorId.toString(16)})` : 'Serial / Bluetooth COM';
      this.updateStatus('connected', `Terhubung: ${portDesc}`);
      return portDesc;
    } catch (err) {
      this.isConnected = false;
      this.updateStatus('error', err.message);
      throw err;
    }
  }

  async disconnect() {
    if (this.port) {
      try {
        await this.port.close();
      } catch {
        // Ignore close errors
      }
    }
    this.isConnected = false;
    this.port = null;
    this.updateStatus('disconnected', 'Printer Serial terputus');
  }

  async print(escPosBytes) {
    if (!this.isConnected || !this.port) {
      throw new Error('Printer Serial / COM belum terhubung.');
    }

    if (!this.port.writable) {
      await this.port.open({ baudRate: this.baudRate || 9600 });
    }

    this.updateStatus('printing', 'Mengirim data ke printer Serial...');

    const writer = this.port.writable.getWriter();
    try {
      // Transmit in 64-byte chunks to avoid buffer overflow on mini printers
      const CHUNK_SIZE = 64;
      for (let offset = 0; offset < escPosBytes.length; offset += CHUNK_SIZE) {
        const chunk = escPosBytes.slice(offset, offset + CHUNK_SIZE);
        await writer.write(chunk);
      }
    } finally {
      writer.releaseLock();
    }

    this.updateStatus('connected', 'Terhubung: Serial / Bluetooth COM');
    return true;
  }
}

if (typeof window !== 'undefined') {
  window.SerialPrinter = SerialPrinter;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SerialPrinter;
}
