import OLAProcessor from "js/sampler/ola-processor";
import FFT from "fft.js";
import type {
  WorkletProcessorOptions,
  Input,
  Output,
  WorkletParameters,
  AudioChannel,
} from "js/types";

const BUFFERED_BLOCK_SIZE = 2048;

function genHannWindow(length: number) {
  let win = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    win[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / length));
  }
  return win;
}

class PhaseVocoderProcessor extends OLAProcessor {
  fftSize: number;
  timeCursor: number;
  hannWindow: Float32Array;
  fft: FFT;
  freqComplexBuffer: any[];
  freqComplexBufferShifted: any[];
  timeComplexBuffer: any[];
  magnitudes: Float32Array;
  peakIndexes: Int32Array;
  numPeaks: number;

  static get parameterDescriptors() {
    return [
      {
        name: "pitchFactor",
        defaultValue: 1.0,
      },
    ];
  }

  constructor(options: WorkletProcessorOptions) {
    options.processorOptions = {
      blockSize: BUFFERED_BLOCK_SIZE,
    };
    super(options);

    this.fftSize = this.blockSize;
    this.timeCursor = 0;

    this.hannWindow = genHannWindow(this.blockSize);

    // prepare FFT and pre-allocate buffers
    this.fft = new FFT(this.fftSize);
    this.freqComplexBuffer = this.fft.createComplexArray();
    this.freqComplexBufferShifted = this.fft.createComplexArray();
    this.timeComplexBuffer = this.fft.createComplexArray();
    this.magnitudes = new Float32Array(this.fftSize / 2 + 1);
    this.peakIndexes = new Int32Array(this.magnitudes.length);
    this.numPeaks = 0;
  }

  processOLA(
    inputs: Input[],
    outputs: Output[],
    parameters: WorkletParameters,
  ) {
    // no automation, take last value
    const pitchFactor =
      parameters.pitchFactor[parameters.pitchFactor.length - 1];

    for (let i = 0; i < this.numInputs; i++) {
      for (let j = 0; j < inputs[i].length; j++) {
        // big assumption here: output is symetric to input
        let input = inputs[i][j];
        let output = outputs[i][j];

        this.applyHannWindow(input);

        this.fft.realTransform(this.freqComplexBuffer, input);

        this.computeMagnitudes();
        this.findPeaks();
        this.shiftPeaks(pitchFactor);

        this.fft.completeSpectrum(this.freqComplexBufferShifted);
        this.fft.inverseTransform(
          this.timeComplexBuffer,
          this.freqComplexBufferShifted,
        );
        this.fft.fromComplexArray(this.timeComplexBuffer, output);

        this.applyHannWindow(output);
      }
    }

    this.timeCursor += this.hopSize;
  }

  /** Apply Hann window in-place */
  applyHannWindow(input: AudioChannel) {
    for (let i = 0; i < this.blockSize; i++) {
      input[i] = input[i] * this.hannWindow[i];
    }
  }

  /** Compute squared magnitudes for peak finding **/
  computeMagnitudes() {
    let i = 0,
      j = 0;
    while (i < this.magnitudes.length) {
      let real = this.freqComplexBuffer[j];
      let imag = this.freqComplexBuffer[j + 1];
      // no need to sqrt for peak finding
      this.magnitudes[i] = real ** 2 + imag ** 2;
      i += 1;
      j += 2;
    }
  }

  /** Find peaks in spectrum magnitudes **/
  findPeaks() {
    this.numPeaks = 0;
    let i = 2;
    let end = this.magnitudes.length - 2;

    while (i < end) {
      let mag = this.magnitudes[i];

      if (this.magnitudes[i - 1] >= mag || this.magnitudes[i - 2] >= mag) {
        i++;
        continue;
      }
      if (this.magnitudes[i + 1] >= mag || this.magnitudes[i + 2] >= mag) {
        i++;
        continue;
      }

      this.peakIndexes[this.numPeaks] = i;
      this.numPeaks++;
      i += 2;
    }
  }

  /** Shift peaks and regions of influence by pitchFactor into new specturm */
  shiftPeaks(pitchFactor: number) {
    // zero-fill new spectrum
    this.freqComplexBufferShifted.fill(0);

    for (let i = 0; i < this.numPeaks; i++) {
      let peakIndex = this.peakIndexes[i];
      let peakIndexShifted = Math.round(peakIndex * pitchFactor);

      if (peakIndexShifted > this.magnitudes.length) {
        break;
      }

      // find region of influence
      let startIndex = 0;
      let endIndex = this.fftSize;
      if (i > 0) {
        let peakIndexBefore = this.peakIndexes[i - 1];
        startIndex = peakIndex - Math.floor((peakIndex - peakIndexBefore) / 2);
      }
      if (i < this.numPeaks - 1) {
        let peakIndexAfter = this.peakIndexes[i + 1];
        endIndex = peakIndex + Math.ceil((peakIndexAfter - peakIndex) / 2);
      }

      // shift whole region of influence around peak to shifted peak
      let startOffset = startIndex - peakIndex;
      let endOffset = endIndex - peakIndex;
      for (let j = startOffset; j < endOffset; j++) {
        let binIndex = peakIndex + j;
        let binIndexShifted = peakIndexShifted + j;

        if (binIndexShifted >= this.magnitudes.length) {
          break;
        }

        // apply phase correction
        let omegaDelta =
          (2 * Math.PI * (binIndexShifted - binIndex)) / this.fftSize;
        let phaseShiftReal = Math.cos(omegaDelta * this.timeCursor);
        let phaseShiftImag = Math.sin(omegaDelta * this.timeCursor);

        let indexReal = binIndex * 2;
        let indexImag = indexReal + 1;
        let valueReal = this.freqComplexBuffer[indexReal];
        let valueImag = this.freqComplexBuffer[indexImag];

        let valueShiftedReal =
          valueReal * phaseShiftReal - valueImag * phaseShiftImag;
        let valueShiftedImag =
          valueReal * phaseShiftImag + valueImag * phaseShiftReal;

        let indexShiftedReal = binIndexShifted * 2;
        let indexShiftedImag = indexShiftedReal + 1;
        this.freqComplexBufferShifted[indexShiftedReal] += valueShiftedReal;
        this.freqComplexBufferShifted[indexShiftedImag] += valueShiftedImag;
      }
    }
  }
}

registerProcessor("phase-vocoder-processor", PhaseVocoderProcessor);
