/**
 * Canvas Signature Pad (signature-pad.js)
 * Ringan, Responsif, Mendukung Layar Sentuh HP & Mouse Komputer
 * Untuk Fitur Tanda Tangan Presensi Individu PMR SMKN 7 Samarinda
 */

class DigitalSignaturePad {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.isDrawing = false;
    this.hasDrawn = false;
    this.lastX = 0;
    this.lastY = 0;

    this.initCanvas();
    this.attachEvents();
  }

  initCanvas() {
    // Sesuaikan resolusi internal canvas dengan ukuran display (Anti-Blur / Retina Display)
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const displayWidth = rect.width > 0 ? rect.width : (this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 380);
    const displayHeight = rect.height > 0 ? rect.height : 180;

    // Simpan data jika ada gambar sebelumnya
    const prevData = this.hasDrawn ? this.canvas.toDataURL() : null;

    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;

    this.ctx.scale(dpr, dpr);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#0f172a'; // Tinta hitam / biru tua resmi
    this.ctx.lineWidth = 2.5;

    // Jika ada data sebelumnya, gambar ulang
    if (prevData) {
      const img = new Image();
      img.onload = () => {
        this.ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
      };
      img.src = prevData;
    }
  }

  attachEvents() {
    // Event Mouse (Desktop/Laptop)
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    window.addEventListener('mouseup', () => this.stopDrawing());

    // Event Touch (HP / Layar Sentuh)
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.startDrawing(touch);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.draw(touch);
    }, { passive: false });

    window.addEventListener('touchend', () => this.stopDrawing());

    // Resize listener
    window.addEventListener('resize', () => {
      // Debounce resize
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => this.initCanvas(), 200);
    });
  }

  getCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  startDrawing(e) {
    this.isDrawing = true;
    const coords = this.getCoordinates(e);
    this.lastX = coords.x;
    this.lastY = coords.y;

    // Buat titik awal
    this.ctx.beginPath();
    this.ctx.arc(this.lastX, this.lastY, this.ctx.lineWidth / 2, 0, Math.PI * 2);
    this.ctx.fillStyle = this.ctx.strokeStyle;
    this.ctx.fill();
  }

  draw(e) {
    if (!this.isDrawing) return;

    const coords = this.getCoordinates(e);
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();

    this.lastX = coords.x;
    this.lastY = coords.y;
    this.hasDrawn = true;
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clear() {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);
    this.hasDrawn = false;
  }

  isEmpty() {
    return !this.hasDrawn;
  }

  toDataURL() {
    if (this.isEmpty()) return null;
    return this.canvas.toDataURL('image/png');
  }
}

window.DigitalSignaturePad = DigitalSignaturePad;
