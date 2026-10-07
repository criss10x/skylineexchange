/**
 * Skyline Exchange - 58mm Bluetooth ESC/POS Thermal Printer Driver
 * Supports Web Bluetooth API with chunked BLE transmission + 32-column formatting
 */

class BluetoothPrinter {
  constructor() {
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.isConnected = false;
    this.onStatusChange = null;

    // Common Bluetooth Printer GATT Services & Characteristics
    this.serviceUUIDs = [
      '000018f0-0000-1000-8000-00805f9b34fb',
      '49535343-fe7d-4ae5-8fa9-9fafd205e455',
      'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
      '0000e0ff-0000-1000-8000-00805f9b34fb',
      '0000fff0-0000-1000-8000-00805f9b34fb'
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
      throw new Error('Web Bluetooth tidak didukung di browser ini. Gunakan Google Chrome atau Edge.');
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

      this.server = await this.device.gatt.connect();
      this.updateStatus('discovering', 'Menghubungkan ke layanan printer...');

      // Find compatible writable characteristic
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
        // Fallback: search all available services
        const services = await this.server.getPrimaryServices();
        for (const service of services) {
          const characteristics = await service.getCharacteristics();
          for (const c of characteristics) {
            if (c.properties.write || c.properties.writeWithoutResponse) {
              foundChar = c;
              break;
            }
          }
          if (foundChar) break;
        }
      }

      if (!foundChar) {
        throw new Error('Gagal menemukan jalur data printer. Pastikan printer dalam keadaan menyala.');
      }

      this.characteristic = foundChar;
      this.isConnected = true;
      this.updateStatus('connected', `Terhubung: ${this.device.name || 'Thermal Printer'}`);
      return this.device.name || 'Thermal Printer';
    } catch (err) {
      this.isConnected = false;
      this.updateStatus('error', err.message);
      throw err;
    }
  }

  async disconnect() {
    if (this.device && this.device.gatt.connected) {
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
   * 80mm (48 chars): Valas(8), Jml(8), Kurs(14), Subtotal(18) = 48
   * 58mm (32 chars): Valas(6), Jml(5), Kurs(8), Subtotal(13) = 32
   */
  static formatTableRow(valas, jml, kurs, subtotal, width = 48) {
    if (width === 32) {
      const c1 = String(valas || '').padEnd(6).slice(0, 6);
      const c2 = String(jml || '').padStart(5).slice(0, 5);
      const c3 = String(kurs || '').padStart(8).slice(0, 8);
      const c4 = String(subtotal || '').padStart(13).slice(0, 13);
      return `${c1}${c2}${c3}${c4}`;
    }
    const c1 = String(valas || '').padEnd(8).slice(0, 8);
    const c2 = String(jml || '').padStart(8).slice(0, 8);
    const c3 = String(kurs || '').padStart(14).slice(0, 14);
    const c4 = String(subtotal || '').padStart(18).slice(0, 18);
    return `${c1}${c2}${c3}${c4}`;
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
   * Send ESC/POS bytes to Bluetooth printer in chunked packets
   */
  async print(escPosBytes) {
    if (!this.isConnected || !this.characteristic) {
      throw new Error('Printer belum terhubung via Bluetooth.');
    }

    this.updateStatus('printing', 'Mengirim data ke printer...');

    // Chunk size: 64 bytes is ideal for low-energy thermal printers
    const CHUNK_SIZE = 64;
    for (let offset = 0; offset < escPosBytes.length; offset += CHUNK_SIZE) {
      const chunk = escPosBytes.slice(offset, offset + CHUNK_SIZE);
      if (this.characteristic.writeValueWithoutResponse) {
        await this.characteristic.writeValueWithoutResponse(chunk);
      } else {
        await this.characteristic.writeValue(chunk);
      }
      // Small pause to prevent buffer overflow on low-cost thermal chips
      await new Promise(r => setTimeout(r, 20));
    }

    this.updateStatus('connected', 'Selesai mencetak!');
    return true;
  }
}

if (typeof window !== 'undefined') {
  window.BluetoothPrinter = BluetoothPrinter;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BluetoothPrinter;
}
