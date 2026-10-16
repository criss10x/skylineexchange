/**
 * Skyline Exchange - Bluetooth ESC/POS Thermal Printer Driver
 * Supports Web Bluetooth API with chunked BLE transmission, 80mm & 58mm formatting,
 * and comprehensive GATT service discovery.
 */

class BluetoothPrinter {
  constructor() {
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.isConnected = false;
    this.onStatusChange = null;

    // Comprehensive list of Bluetooth Thermal Printer GATT Services
    this.serviceUUIDs = [
      // 1. HM-10 / CC2541 UART (Widely used in Goojprt, Panda, PT-210, MPT-II, POS-5802, Eppos, Iware, etc.)
      '0000ffe0-0000-1000-8000-00805f9b34fb',
      // 2. Generic BLE POS Services
      '0000ff00-0000-1000-8000-00805f9b34fb',
      '0000fff0-0000-1000-8000-00805f9b34fb',
      '0000e0ff-0000-1000-8000-00805f9b34fb',
      // 3. Standard Printer GATT Services
      '000018f0-0000-1000-8000-00805f9b34fb',
      '000018f1-0000-1000-8000-00805f9b34fb',
      // 4. Microchip / ISSC Transparent UART
      '49535343-fe7d-4ae5-8fa9-9fafd205e455',
      // 5. PosBank / Xprinter
      'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
      // 6. Nordic UART Service (NUS) - used in Zebra, Star Micronics, modern BLE 5 printers
      '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
      // 7. Tencent / Asian BLE POS standard
      '0000fee7-0000-1000-8000-00805f9b34fb',
      // 8. Other portable thermal printer chipsets (ZJiang, GPrinter, Feasycom)
      '0000af30-0000-1000-8000-00805f9b34fb',
      '0000ae00-0000-1000-8000-00805f9b34fb',
      '0000fd00-0000-1000-8000-00805f9b34fb'
    ];
  }

  isSupported() {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  updateStatus(status, text) {
    if (this.onStatusChange) {
      this.onStatusChange({ connected: this.isConnected, status, text });
    }
  }

  async connect() {
    if (!this.isSupported()) {
      if (typeof window !== 'undefined' && window.isSecureContext === false) {
        throw new Error('Web Bluetooth membutuhkan koneksi aman HTTPS atau localhost.');
      }
      throw new Error('Web Bluetooth tidak didukung di browser ini. Gunakan Google Chrome atau Microsoft Edge di PC/Android.');
    }

    try {
      this.updateStatus('connecting', 'Mencari printer Bluetooth...');

      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: this.serviceUUIDs
      });

      this.device.addEventListener('gattserverdisconnected', () => {
        this.isConnected = false;
        this.server = null;
        this.characteristic = null;
        this.updateStatus('disconnected', 'Printer terputus');
      });

      if (!this.device.gatt) {
        throw new Error('Perangkat tidak memiliki modul GATT Bluetooth yang kompatibel.');
      }

      this.server = await this.device.gatt.connect();
      this.updateStatus('discovering', 'Menghubungkan ke layanan printer...');

      // Find compatible writable characteristic from recognized services
      let foundChar = null;
      for (const serviceUuid of this.serviceUUIDs) {
        try {
          const service = await this.server.getPrimaryService(serviceUuid);
          const characteristics = await service.getCharacteristics();
          for (const c of characteristics) {
            if (c.properties.write || c.properties.writeWithoutResponse) {
              foundChar = c;
              break;
            }
          }
        } catch {
          // Continue searching other services
        }
        if (foundChar) break;
      }

      if (!foundChar) {
        // Fallback: search all available services exposed by device
        try {
          const services = await this.server.getPrimaryServices();
          for (const service of services) {
            try {
              const characteristics = await service.getCharacteristics();
              for (const c of characteristics) {
                if (c.properties.write || c.properties.writeWithoutResponse) {
                  foundChar = c;
                  break;
                }
              }
            } catch {
              // Ignore single service inspection failure
            }
            if (foundChar) break;
          }
        } catch {
          // Fallback discovery completed
        }
      }

      if (!foundChar) {
        throw new Error('Gagal menemukan jalur tulis printer. Pastikan printer dalam keadaan menyala dan mendukung Bluetooth.');
      }

      this.characteristic = foundChar;
      this.isConnected = true;
      const deviceName = this.device.name || 'Thermal Printer';
      this.updateStatus('connected', `Terhubung: ${deviceName}`);
      return deviceName;
    } catch (err) {
      this.isConnected = false;
      this.updateStatus('error', err.message);
      throw err;
    }
  }

  async disconnect() {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      await this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.updateStatus('disconnected', 'Printer terputus');
  }

  // Format Helper: fixed width padding (default 48 for 80mm, 32 for 58mm)
  static padLine(left, right, width = 48) {
    const l = String(left || '');
    const r = String(right || '');
    const spaces = Math.max(1, width - l.length - r.length);
    return l + ' '.repeat(spaces) + r;
  }

  static centerLine(text, width = 48) {
    const str = String(text || '').slice(0, width);
    const leftPad = Math.floor((width - str.length) / 2);
    const rightPad = width - str.length - leftPad;
    return ' '.repeat(Math.max(0, leftPad)) + str + ' '.repeat(Math.max(0, rightPad));
  }

  /**
   * Format 4-Column Table:
   * Prevents digit truncation by allocating sufficient columns and wrapping when numbers are wide.
   * 80mm (48 chars): Valas(6), Jml(10), Kurs(12), Subtotal(20) = 48
   * 58mm (32 chars): 2-line layout or single-line when compact.
   */
  static formatTableRow(valas, jml, kurs, subtotal, width = 48) {
    const sVal = String(valas || '');
    const sJml = String(jml || '');
    const sKurs = String(kurs || '');
    const sSub = String(subtotal || '');

    if (width === 32) {
      // 58mm compact layout
      const singleLine = `${sVal.padEnd(5)} ${sJml.padStart(6)} ${sKurs.padStart(7)} ${sSub.padStart(11)}`;
      if (singleLine.length <= 32 && sVal.length <= 5 && sJml.length <= 6 && sKurs.length <= 7 && sSub.length <= 11) {
        return singleLine;
      }
      // Clean 2-line format guarantees zero clipped numbers on narrow 58mm paper
      const line1 = `${sVal} x ${sJml} @ ${sKurs}`;
      const line2 = sSub.padStart(32);
      return `${line1}\n${line2}`;
    }

    // 80mm standard POS layout (48 chars)
    if (sVal.length <= 6 && sJml.length <= 10 && sKurs.length <= 12 && sSub.length <= 20) {
      const c1 = sVal.padEnd(6);
      const c2 = sJml.padStart(10);
      const c3 = sKurs.padStart(12);
      const c4 = sSub.padStart(20);
      return `${c1}${c2}${c3}${c4}`;
    }

    // Wrap if amounts or rates are unusually large
    const line1 = `${sVal} x ${sJml} @ ${sKurs}`;
    const line2 = sSub.padStart(48);
    return `${line1}\n${line2}`;
  }

  /**
   * Build Raw ESC/POS bytes for 80mm or 58mm receipt with Dual Language support (ID / EN)
   */
  buildEscPos(data, settings, lang = 'id') {
    const isEn = lang === 'en';
    const is80 = (settings.paper_size || '80') === '80';
    const width = is80 ? 48 : 32;
    const dividerDash = '-'.repeat(width);
    const dividerDouble = '='.repeat(width);

    const encoder = new TextEncoder();
    const bytes = [];

    const addBytes = (...arr) => bytes.push(...arr);
    const addText = (str) => {
      const encoded = encoder.encode(str);
      for (let i = 0; i < encoded.length; i++) {
        bytes.push(encoded[i]);
      }
    };
    const addLine = (str = '') => {
      addText(str + '\n');
    };

    // ESC @ - Initialize printer
    addBytes(0x1B, 0x40);

    // ESC t 0 - Select Code Page 437 (Standard ASCII / European)
    addBytes(0x1B, 0x74, 0x00);

    // Header: Store Name (Center, Double Height & Width, Emphasized)
    addBytes(0x1B, 0x61, 0x01); // Center
    addBytes(0x1B, 0x21, 0x30); // Double height + double width
    addLine(settings.store_name || 'SKYLINE EXCHANGE');
    addBytes(0x1B, 0x21, 0x00); // Normal size

    // Subheader Address & Contact
    addLine(settings.store_address || 'Jl. Bypass Ngurah Rai No. 4X, Kuta, Bali');
    addLine(`WA: ${settings.store_phone || '+6285-122-777-970'}`);

    if (settings.show_permit === '1' && settings.store_permit) {
      addLine(`${isEn ? 'License' : 'Izin KUPVA'}: ${settings.store_permit}`);
    }

    // Divider
    addLine(dividerDash);

    // Left Align for Transaction Info
    addBytes(0x1B, 0x61, 0x00); // Left align
    addLine(BluetoothPrinter.padLine(isEn ? 'Receipt No' : 'No. Struk', data.receipt_no, width));
    addLine(BluetoothPrinter.padLine(isEn ? 'Date & Time' : 'Tgl & Jam', data.created_at_formatted, width));
    const txTypeStr = data.type === 'BELI' 
      ? (isEn ? 'BUY CURRENCY' : 'BELI VALAS (BUY)') 
      : (isEn ? 'SELL CURRENCY' : 'JUAL VALAS (SELL)');
    addLine(BluetoothPrinter.padLine(isEn ? 'Type' : 'Tipe Transaksi', txTypeStr, width));
    addLine(BluetoothPrinter.padLine('Teller', data.teller_name, width));

    // Customer Data
    addLine(dividerDash);
    addLine(BluetoothPrinter.padLine(isEn ? 'Customer' : 'Nama Customer', (data.customer_name || '-').toUpperCase(), width));
    if (data.customer_phone) {
      addLine(BluetoothPrinter.padLine(isEn ? 'Phone No' : 'No. Telepon', data.customer_phone, width));
    }
    if (data.customer_id_no) {
      addLine(BluetoothPrinter.padLine(isEn ? 'Passport / ID' : 'No. ID/KTP/Paspor', data.customer_id_no, width));
    }
    if (data.is_delivery) {
      addLine(BluetoothPrinter.padLine(isEn ? 'Service' : 'Layanan', isEn ? 'DELIVERY SERVICE' : 'DELIVERY (ANTAR)', width));
      if (data.delivery_address) {
        addLine(`${isEn ? 'Address' : 'Alamat'}: ${data.delivery_address}`);
      }
    }

    // Table Header 4 Columns
    addLine(dividerDouble);
    addLine(BluetoothPrinter.formatTableRow(isEn ? 'CURR' : 'VALAS', isEn ? 'QTY' : 'JML', isEn ? 'RATE' : 'KURS', 'SUB TOTAL', width));
    addLine(dividerDash);

    // Table Rows
    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        const valas = item.currency_code;
        const jml = item.amount.toLocaleString(isEn ? 'en-US' : 'id-ID');
        const kurs = item.rate.toLocaleString('id-ID');
        const subtotal = 'Rp ' + item.subtotal_idr.toLocaleString('id-ID');
        addLine(BluetoothPrinter.formatTableRow(valas, jml, kurs, subtotal, width));
      }
    }

    // Total Calculation
    addLine(dividerDouble);
    addBytes(0x1B, 0x21, 0x08); // Emphasized (bold)
    addLine(BluetoothPrinter.padLine('TOTAL IDR', 'Rp ' + data.total_idr.toLocaleString('id-ID'), width));
    addBytes(0x1B, 0x21, 0x00); // Normal
    addLine(BluetoothPrinter.padLine(isEn ? 'PAYMENT' : 'PEMBAYARAN', 'Rp ' + data.paid_amount.toLocaleString('id-ID'), width));
    addLine(BluetoothPrinter.padLine(isEn ? 'CHANGE' : 'KEMBALIAN', 'Rp ' + data.change_amount.toLocaleString('id-ID'), width));
    addLine(dividerDash);

    // Signatures (Teller & Customer)
    addLine('');
    const signLeftHead = is80 ? '        Teller' : '    Teller';
    const signRightHead = is80 ? 'Customer        ' : 'Customer    ';
    addLine(BluetoothPrinter.padLine(signLeftHead, signRightHead, width));
    addLine('');
    addLine('');
    addLine('');

    const tellerSignature = `( ${(data.teller_name || 'TELLER').toUpperCase()} )`;
    const customerSignature = `( ${(data.customer_signature_name || data.customer_name || 'CUSTOMER').toUpperCase()} )`;
    addLine(BluetoothPrinter.padLine(tellerSignature, customerSignature, width));

    // Footer / Disclaimer
    addLine('');
    addBytes(0x1B, 0x61, 0x01); // Center align
    if (isEn) {
      addLine('* Please check your banknotes before leaving the counter.');
      addLine('* Exchanged currency cannot be returned or refunded.');
      addLine('THANK YOU FOR YOUR VISIT');
    } else {
      addLine('* ' + (settings.disclaimer_1 || 'Periksa fisik uang sebelum meninggalkan kasir.'));
      addLine('* ' + (settings.disclaimer_2 || 'Uang yang sudah ditukar tidak dapat dikembalikan.'));
      addLine('TERIMA KASIH ATAS KUNJUNGAN ANDA');
    }

    // Feed and Paper Cut / Tear space
    addLine('\n\n\n\n');
    addBytes(0x1D, 0x56, 0x41, 0x10); // Partial cut if hardware supported

    return new Uint8Array(bytes);
  }

  /**
   * Build Test ESC/POS sample receipt to verify printer connectivity and paper width
   */
  buildTestEscPos(settings, lang = 'id') {
    const isEn = lang === 'en';
    const is80 = (settings.paper_size || '80') === '80';
    const width = is80 ? 48 : 32;
    const dividerDash = '-'.repeat(width);
    const dividerDouble = '='.repeat(width);

    const encoder = new TextEncoder();
    const bytes = [];
    const addBytes = (...arr) => bytes.push(...arr);
    const addText = (str) => {
      const encoded = encoder.encode(str);
      for (let i = 0; i < encoded.length; i++) bytes.push(encoded[i]);
    };
    const addLine = (str = '') => addText(str + '\n');

    // Initialize and Code Page 437
    addBytes(0x1B, 0x40);
    addBytes(0x1B, 0x74, 0x00);

    // Header
    addBytes(0x1B, 0x61, 0x01); // Center
    addBytes(0x1B, 0x21, 0x30); // Double height & width
    addLine(settings.store_name || 'SKYLINE EXCHANGE');
    addBytes(0x1B, 0x21, 0x00);
    addLine(settings.store_address || 'Jl. Bypass Ngurah Rai No. 4X, Kuta, Bali');
    addLine(`WA: ${settings.store_phone || '+6285-122-777-970'}`);

    addLine(dividerDash);
    addBytes(0x1B, 0x21, 0x08);
    addLine(isEn ? '*** BLUETOOTH PRINTER TEST ***' : '*** TES PRINTER BLUETOOTH ***');
    addBytes(0x1B, 0x21, 0x00);
    addLine(dividerDash);

    // Left Align Info
    addBytes(0x1B, 0x61, 0x00);
    const now = new Date();
    const timeStr = now.toLocaleDateString(isEn ? 'en-US' : 'id-ID') + ' ' + now.toLocaleTimeString(isEn ? 'en-US' : 'id-ID');
    addLine(BluetoothPrinter.padLine(isEn ? 'Status' : 'Status', isEn ? 'CONNECTED OK' : 'TERHUBUNG OK', width));
    addLine(BluetoothPrinter.padLine(isEn ? 'Paper Size' : 'Ukuran Kertas', is80 ? '80 mm (48 Kolom)' : '58 mm (32 Kolom)', width));
    addLine(BluetoothPrinter.padLine(isEn ? 'Date & Time' : 'Tanggal & Waktu', timeStr, width));
    addLine(BluetoothPrinter.padLine('Device', this.device ? (this.device.name || 'Thermal BLE') : 'Bluetooth Printer', width));

    addLine(dividerDouble);
    addLine(BluetoothPrinter.formatTableRow(isEn ? 'CURR' : 'VALAS', isEn ? 'QTY' : 'JML', isEn ? 'RATE' : 'KURS', 'SUB TOTAL', width));
    addLine(dividerDash);
    addLine(BluetoothPrinter.formatTableRow('USD', '100', '16,350', 'Rp 1,635,000', width));
    addLine(dividerDouble);
    addBytes(0x1B, 0x21, 0x08);
    addLine(BluetoothPrinter.padLine('TOTAL IDR', 'Rp 1,635,000', width));
    addBytes(0x1B, 0x21, 0x00);
    addLine(dividerDash);

    // Footer
    addBytes(0x1B, 0x61, 0x01);
    addLine('');
    addLine(isEn ? 'Printer is verified and ready for cashier.' : 'Printer terverifikasi & siap untuk transaksi kasir.');
    addLine('SKYLINE EXCHANGE POS');
    addLine('\n\n\n\n');
    addBytes(0x1D, 0x56, 0x41, 0x10);

    return new Uint8Array(bytes);
  }

  /**
   * Send ESC/POS bytes to Bluetooth printer in chunked packets (20-byte safe BLE MTU)
   */
  async print(escPosBytes) {
    if (!this.isConnected || !this.characteristic) {
      throw new Error('Printer belum terhubung via Bluetooth.');
    }

    this.updateStatus('printing', 'Mengirim data ke printer...');

    // 20 bytes is the universally safe BLE ATT MTU default (23 bytes minus 3 header bytes)
    const CHUNK_SIZE = 20;
    const props = this.characteristic.properties || {};
    const canWriteWithoutResponse = Boolean(props.writeWithoutResponse);
    const hasWriteWithoutResponseMethod = typeof this.characteristic.writeValueWithoutResponse === 'function';

    for (let offset = 0; offset < escPosBytes.length; offset += CHUNK_SIZE) {
      const chunk = escPosBytes.slice(offset, offset + CHUNK_SIZE);
      let written = false;

      if (canWriteWithoutResponse && hasWriteWithoutResponseMethod) {
        try {
          await this.characteristic.writeValueWithoutResponse(chunk);
          written = true;
        } catch {
          written = false;
        }
      }

      if (!written) {
        if (typeof this.characteristic.writeValueWithResponse === 'function') {
          await this.characteristic.writeValueWithResponse(chunk);
        } else {
          await this.characteristic.writeValue(chunk);
        }
      }

      // 25ms delay to prevent buffer overflow on low-cost thermal printer chips
      await new Promise(r => setTimeout(r, 25));
    }

    this.updateStatus('connected', `Terhubung: ${this.device ? (this.device.name || 'Thermal Printer') : 'Printer'}`);
    return true;
  }
}

if (typeof window !== 'undefined') {
  window.BluetoothPrinter = BluetoothPrinter;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BluetoothPrinter;
}
