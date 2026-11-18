/**
 * Zero-dependency QR Code SVG Generator for Chicken Town SL Table QR Code Generator
 */

class QR8bitByte {
  mode = 4
  data: string

  constructor(data: string) {
    this.data = data
  }

  getLength(): number {
    return this.data.length
  }

  write(buffer: QRBitBuffer): void {
    for (let i = 0; i < this.data.length; i++) {
      buffer.put(this.data.charCodeAt(i), 8)
    }
  }
}

class QRPolynomial {
  num: number[]

  constructor(num: number[], shift: number) {
    let offset = 0
    while (offset < num.length && num[offset] === 0) offset++
    this.num = new Array(num.length - offset + shift)
    for (let i = 0; i < num.length - offset; i++) this.num[i] = num[offset + i]
  }

  get(index: number): number {
    return this.num[index]
  }

  getLength(): number {
    return this.num.length
  }

  multiply(e: QRPolynomial): QRPolynomial {
    const num = new Array(this.getLength() + e.getLength() - 1).fill(0)
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)))
      }
    }
    return new QRPolynomial(num, 0)
  }

  mod(e: QRPolynomial): QRPolynomial {
    if (this.getLength() - e.getLength() < 0) return this
    const ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0))
    const num = new Array(this.getLength())
    for (let i = 0; i < this.getLength(); i++) num[i] = this.get(i)
    for (let i = 0; i < e.getLength(); i++) num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio)
    return new QRPolynomial(num, 0).mod(e)
  }
}

const QRRSBlock = {
  RS_BLOCK_TABLE: [
    [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],
    [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],
    [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],
    [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],
    [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],
    [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],
  ],
  getRSBlocks(typeNumber: number, errorCorrectLevel: number) {
    const rsBlock = this.getRsBlockTable(typeNumber, errorCorrectLevel)
    if (!rsBlock) throw new Error('Bad RS block')
    const length = rsBlock.length / 3
    const list: { totalCount: number; dataCount: number }[] = []
    for (let i = 0; i < length; i++) {
      const count = rsBlock[i * 3 + 0]
      const totalCount = rsBlock[i * 3 + 1]
      const dataCount = rsBlock[i * 3 + 2]
      for (let j = 0; j < count; j++) list.push({ totalCount, dataCount })
    }
    return list
  },
  getRsBlockTable(typeNumber: number, errorCorrectLevel: number) {
    switch (errorCorrectLevel) {
      case 1: return this.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0]
      case 0: return this.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1]
      case 3: return this.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2]
      case 2: return this.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3]
      default: return undefined
    }
  },
}

class QRBitBuffer {
  buffer: number[] = []
  length = 0

  get(index: number): boolean {
    const bufIndex = Math.floor(index / 8)
    return ((this.buffer[bufIndex] >>> (7 - (index % 8))) & 1) === 1
  }

  put(num: number, length: number): void {
    for (let i = 0; i < length; i++) this.putBit(((num >>> (length - i - 1)) & 1) === 1)
  }

  putBit(bit: boolean): void {
    const bufIndex = Math.floor(this.length / 8)
    if (this.buffer.length <= bufIndex) this.buffer.push(0)
    if (bit) this.buffer[bufIndex] |= 0x80 >>> (this.length % 8)
    this.length++
  }
}

const QRMath = {
  glog(n: number): number {
    if (n < 1) throw new Error(`glog(${n})`)
    return QRMath.LOG_TABLE[n]
  },
  gexp(n: number): number {
    while (n < 0) n += 255
    while (n >= 255) n -= 255
    return QRMath.EXP_TABLE[n]
  },
  EXP_TABLE: new Array(256),
  LOG_TABLE: new Array(256),
}
for (let i = 0; i < 8; i++) QRMath.EXP_TABLE[i] = 1 << i
for (let i = 8; i < 256; i++) {
  QRMath.EXP_TABLE[i] =
    QRMath.EXP_TABLE[i - 4] ^
    QRMath.EXP_TABLE[i - 5] ^
    QRMath.EXP_TABLE[i - 6] ^
    QRMath.EXP_TABLE[i - 8]
}
for (let i = 0; i < 255; i++) QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i

class QRCodeModel {
  typeNumber: number
  errorCorrectLevel: number
  modules: (boolean | null)[][] | null = null
  moduleCount = 0
  dataCache: number[] | null = null
  dataList: QR8bitByte[] = []

  constructor(typeNumber: number, errorCorrectLevel: number) {
    this.typeNumber = typeNumber
    this.errorCorrectLevel = errorCorrectLevel
  }

  addData(data: string): void {
    this.dataList.push(new QR8bitByte(data))
    this.dataCache = null
  }

  isDark(row: number, col: number): boolean {
    return !!this.modules?.[row]?.[col]
  }

  getModuleCount(): number {
    return this.moduleCount
  }

  make(): void {
    if (this.typeNumber < 1) {
      let typeNum = 1
      for (typeNum = 1; typeNum < 40; typeNum++) {
        const rsBlocks = QRRSBlock.getRSBlocks(typeNum, this.errorCorrectLevel)
        const buffer = new QRBitBuffer()
        let totalDataCount = 0
        for (let i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount
        for (let i = 0; i < this.dataList.length; i++) {
          const data = this.dataList[i]
          buffer.put(data.mode, 4)
          buffer.put(data.getLength(), 8)
          data.write(buffer)
        }
        if (buffer.length <= totalDataCount * 8) break
      }
      this.typeNumber = typeNum
    }
    this.makeImpl(false, 0)
  }

  private makeImpl(test: boolean, maskPattern: number): void {
    this.moduleCount = this.typeNumber * 4 + 17
    this.modules = new Array(this.moduleCount)
    for (let row = 0; row < this.moduleCount; row++) {
      this.modules[row] = new Array(this.moduleCount).fill(null)
    }
    this.setupPositionProbePattern(0, 0)
    this.setupPositionProbePattern(this.moduleCount - 7, 0)
    this.setupPositionProbePattern(0, this.moduleCount - 7)
    this.setupTimingPattern()
    this.setupTypeInfo(test, maskPattern)
    if (!this.dataCache) {
      this.dataCache = this.createData(this.typeNumber, this.errorCorrectLevel, this.dataList)
    }
    this.mapData(this.dataCache, maskPattern)
  }

  private setupPositionProbePattern(row: number, col: number): void {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          this.modules![row + r][col + c] = true
        } else {
          this.modules![row + r][col + c] = false
        }
      }
    }
  }

  private setupTimingPattern(): void {
    for (let r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules![r][6] !== null) continue
      this.modules![r][6] = r % 2 === 0
    }
    for (let c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules![6][c] !== null) continue
      this.modules![6][c] = c % 2 === 0
    }
  }

  private setupTypeInfo(test: boolean, maskPattern: number): void {
    const data = (this.errorCorrectLevel << 3) | maskPattern
    const bits = data
    for (let i = 0; i < 15; i++) {
      const mod = !test && ((bits >> i) & 1) === 1
      if (i < 6) this.modules![i][8] = mod
      else if (i < 8) this.modules![i + 1][8] = mod
      else this.modules![this.moduleCount - 15 + i][8] = mod

      if (i < 8) this.modules![8][this.moduleCount - i - 1] = mod
      else if (i < 9) this.modules![8][15 - i - 1 + 1] = mod
      else this.modules![8][15 - i - 1] = mod
    }
    this.modules![this.moduleCount - 8][8] = !test
  }

  private mapData(data: number[], maskPattern: number): void {
    let inc = -1
    let row = this.moduleCount - 1
    let bitIndex = 7
    let byteIndex = 0
    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--
      while (true) {
        for (let c = 0; c < 2; c++) {
          if (this.modules![row][col - c] === null) {
            let dark = false
            if (byteIndex < data.length) dark = ((data[byteIndex] >>> bitIndex) & 1) === 1
            if (maskPattern === 0 && (row + (col - c)) % 2 === 0) dark = !dark
            this.modules![row][col - c] = dark
            bitIndex--
            if (bitIndex === -1) {
              byteIndex++
              bitIndex = 7
            }
          }
        }
        row += inc
        if (row < 0 || this.moduleCount <= row) {
          row -= inc
          inc = -inc
          break
        }
      }
    }
  }

  private createData(typeNumber: number, errorCorrectLevel: number, dataList: QR8bitByte[]): number[] {
    const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel)
    const buffer = new QRBitBuffer()
    for (let i = 0; i < dataList.length; i++) {
      const data = dataList[i]
      buffer.put(data.mode, 4)
      buffer.put(data.getLength(), 8)
      data.write(buffer)
    }
    let totalDataCount = 0
    for (let i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount
    if (buffer.length > totalDataCount * 8) throw new Error('Code length overflow')
    if (buffer.length + 4 <= totalDataCount * 8) buffer.put(0, 4)
    while (buffer.length % 8 !== 0) buffer.putBit(false)
    while (true) {
      if (buffer.length >= totalDataCount * 8) break
      buffer.put(0xec, 8)
      if (buffer.length >= totalDataCount * 8) break
      buffer.put(0x11, 8)
    }
    return this.createBytes(buffer, rsBlocks)
  }

  private createBytes(buffer: QRBitBuffer, rsBlocks: { totalCount: number; dataCount: number }[]): number[] {
    let offset = 0
    let maxDcCount = 0
    let maxEcCount = 0
    const dcdata: number[][] = new Array(rsBlocks.length)
    const ecdata: number[][] = new Array(rsBlocks.length)
    for (let r = 0; r < rsBlocks.length; r++) {
      const dcCount = rsBlocks[r].dataCount
      const ecCount = rsBlocks[r].totalCount - dcCount
      maxDcCount = Math.max(maxDcCount, dcCount)
      maxEcCount = Math.max(maxEcCount, ecCount)
      dcdata[r] = new Array(dcCount)
      for (let i = 0; i < dcdata[r].length; i++) dcdata[r][i] = 0xff & buffer.buffer[i + offset]
      offset += dcCount
      const rsPoly = this.getErrorCorrectPolynomial(ecCount)
      const rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1)
      const modPoly = rawPoly.mod(rsPoly)
      ecdata[r] = new Array(rsPoly.getLength() - 1)
      for (let i = 0; i < ecdata[r].length; i++) {
        const modIndex = i + modPoly.getLength() - ecdata[r].length
        ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0
      }
    }
    let totalCodeCount = 0
    for (let i = 0; i < rsBlocks.length; i++) totalCodeCount += rsBlocks[i].totalCount
    const data = new Array(totalCodeCount)
    let index = 0
    for (let i = 0; i < maxDcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) data[index++] = dcdata[r][i]
      }
    }
    for (let i = 0; i < maxEcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) data[index++] = ecdata[r][i]
      }
    }
    return data
  }

  private getErrorCorrectPolynomial(errorCorrectLength: number): QRPolynomial {
    let a = new QRPolynomial([1], 0)
    for (let i = 0; i < errorCorrectLength; i++) {
      a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0))
    }
    return a
  }
}

/**
 * Generate a clean standalone SVG string for any text
 */
export function generateQRCodeSVG(text: string, size = 180): string {
  try {
    const qr = new QRCodeModel(0, 1) // Level L
    qr.addData(text)
    qr.make()
    const count = qr.getModuleCount()
    const cellSize = size / count
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">`
    svg += `<rect width="100%" height="100%" fill="#ffffff"/>`
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) {
          const x = col * cellSize
          const y = row * cellSize
          svg += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(cellSize + 0.1).toFixed(2)}" height="${(cellSize + 0.1).toFixed(2)}" fill="#121212"/>`
        }
      }
    }
    svg += `</svg>`
    return svg
  } catch (e) {
    console.error('QR code generation error:', e)
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="100%" height="100%" fill="#fee2e2"/><text x="50%" y="50%" text-anchor="middle" fill="#991b1b" font-size="12">QR Error</text></svg>`
  }
}
