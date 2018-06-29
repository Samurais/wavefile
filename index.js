/*
 * wavefile: Read and write wave files.
 * https://github.com/rochars/wavefile
 *
 * Copyright (c) 2017-2018 Rafael da Silva Rocha.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @fileoverview The WaveFile class.
 */

/** @module wavefile */

import bitdepth from 'bitdepth';
import riffChunks from 'riff-chunks';
import {decode as decodeADPCM, encode as encodeADPCM} from 'imaadpcm';
import alawmulaw from 'alawmulaw';
import {encode, decode} from 'base64-arraybuffer-es6';
import {pack, packArray, unpackFrom, unpackString, packStringTo,
  packTo, packString, unpackArray, packArrayTo} from 'byte-data';

/**
 * @type {!Object}
 * @private
 */
let uInt16_ = {bits: 16};
/**
 * @type {!Object}
 * @private
 */
let uInt32_ = {bits: 32};

/**
 * Class representing a wav file.
 */
export default class WaveFile {

  /**
   * @param {?Uint8Array} bytes A wave file buffer.
   * @throws {Error} If no 'RIFF' chunk is found.
   * @throws {Error} If no 'fmt ' chunk is found.
   * @throws {Error} If no 'data' chunk is found.
   */
  constructor(bytes=null) {
    /**
     * The container identifier.
     * 'RIFF', 'RIFX' and 'RF64' are supported.
     * @type {string}
     * @export
     */
    this.container = '';
    /**
     * @type {number}
     * @export
     */
    this.chunkSize = 0;
    /**
     * The format.
     * Always 'WAVE'.
     * @type {string}
     * @export
     */
    this.format = '';
    /**
     * The data of the 'fmt' chunk.
     * @type {!Object<string, *>}
     * @export
     */
    this.fmt = {
      /** @export @type {string} */
      chunkId: '',
      /** @export @type {number} */
      chunkSize: 0,
      /** @export @type {number} */
      audioFormat: 0,
      /** @export @type {number} */
      numChannels: 0,
      /** @export @type {number} */
      sampleRate: 0,
      /** @export @type {number} */
      byteRate: 0,
      /** @export @type {number} */
      blockAlign: 0,
      /** @export @type {number} */
      bitsPerSample: 0,
      /** @export @type {number} */
      cbSize: 0,
      /** @export @type {number} */
      validBitsPerSample: 0,
      /** @export @type {number} */
      dwChannelMask: 0,
      /**
       * 4 32-bit values representing a 128-bit ID
       * @export @type {!Array<number>}
       */
      subformat: []
    };
    /**
     * The data of the 'fact' chunk.
     * @type {!Object<string, *>}
     * @export
     */
    this.fact = {
      /** @export @type {string} */
      chunkId: '',
      /** @export @type {number} */
      chunkSize: 0,
      /** @export @type {number} */
      dwSampleLength: 0
    };
    /**
     * The data of the 'cue ' chunk.
     * @type {!Object<string, *>}
     * @export
     */
    this.cue = {
      /** @export @type {string} */
      chunkId: '',
      /** @export @type {number} */
      chunkSize: 0,
      /** @export @type {number} */
      dwCuePoints: 0,
      /** @export @type {!Array<!Object>} */
      points: [],
    };
    /**
     * The data of the 'smpl' chunk.
     * @type {!Object<string, *>}
     * @export
     */
    this.smpl = {
      /** @export @type {string} */
      chunkId: '',
      /** @export @type {number} */
      chunkSize: 0,
      /** @export @type {number} */
      dwManufacturer: 0,
      /** @export @type {number} */
      dwProduct: 0,
      /** @export @type {number} */
      dwSamplePeriod: 0,
      /** @export @type {number} */
      dwMIDIUnityNote: 0,
      /** @export @type {number} */
      dwMIDIPitchFraction: 0,
      /** @export @type {number} */
      dwSMPTEFormat: 0,
      /** @export @type {number} */
      dwSMPTEOffset: 0,
      /** @export @type {number} */
      dwNumSampleLoops: 0,
      /** @export @type {number} */
      dwSamplerData: 0,
      /** @export @type {!Array<!Object>} */
      loops: [],
    };
    /**
     * The data of the 'bext' chunk.
     * @type {!Object<string, *>}
     * @export
     */
    this.bext = {
      /** @export @type {string} */
      chunkId: '',
      /** @export @type {number} */
      chunkSize: 0,
      /** @export @type {string} */
      description: '', //256
      /** @export @type {string} */
      originator: '', //32
      /** @export @type {string} */
      originatorReference: '', //32
      /** @export @type {string} */
      originationDate: '', //10
      /** @export @type {string} */
      originationTime: '', //8
      /**
       * 2 32-bit values, timeReference high and low
       * @export @type {!Array<number>}
       */
      timeReference: [0, 0],
      /** @export @type {number} */
      version: 0, //WORD
      /** @export @type {string} */
      UMID: '', // 64 chars
      /** @export @type {number} */
      loudnessValue: 0, //WORD
      /** @export @type {number} */
      loudnessRange: 0, //WORD
      /** @export @type {number} */
      maxTruePeakLevel: 0, //WORD
      /** @export @type {number} */
      maxMomentaryLoudness: 0, //WORD
      /** @export @type {number} */
      maxShortTermLoudness: 0, //WORD
      /** @export @type {string} */
      reserved: '', //180
      /** @export @type {string} */
      codingHistory: '' // string, unlimited
    };
    /**
     * The data of the 'ds64' chunk.
     * Used only with RF64 files.
     * @type {!Object<string, *>}
     * @export
     */
    this.ds64 = {
      /** @type {string} */
      chunkId: '',
      /** @export @type {number} */
      chunkSize: 0,
      /** @export @type {number} */
      riffSizeHigh: 0, // DWORD
      /** @export @type {number} */
      riffSizeLow: 0, // DWORD
      /** @export @type {number} */
      dataSizeHigh: 0, // DWORD
      /** @export @type {number} */
      dataSizeLow: 0, // DWORD
      /** @export @type {number} */
      originationTime: 0, // DWORD
      /** @export @type {number} */
      sampleCountHigh: 0, // DWORD
      /** @export @type {number} */
      sampleCountLow: 0, // DWORD
      /** @export @type {number} */
      //'tableLength': 0, // DWORD
      /** @export @type {!Array<number>} */
      //'table': []
    };
    /**
     * The data of the 'data' chunk.
     * @type {!Object<string, *>}
     * @export
     */
    this.data = {
      /** @export @type {string} */
      chunkId: '',
      /** @export @type {number} */
      chunkSize: 0,
      /** @export @type {!Uint8Array} */
      samples: new Uint8Array(0)
    };
    /**
     * The data of the 'LIST' chunks.
     * Each item in this list must have this signature:
     *  {
     *    'chunkId': '',
     *    'chunkSize': 0,
     *    'format': '',
     *    'subChunks': []
     *   }
     * @type {!Array<!Object>}
     * @export
     */
    this.LIST = [];
    /**
     * The data of the 'junk' chunk.
     * @type {!Object<string, *>}
     * @export
     */
    this.junk = {
      /** @export @type {string} */
      chunkId: '',
      /** @export @type {number} */
      chunkSize: 0,
      /** @export @type {!Array<number>} */
      chunkData: []
    };
    /**
     * The bit depth code according to the samples.
     * @type {string}
     * @export
     */
    this.bitDepth = '0';
    /**
     * Audio formats.
     * Formats not listed here will be set to 65534
     * and treated as WAVE_FORMAT_EXTENSIBLE
     * @enum {number}
     * @private
     */
    this.audioFormats_ = {
      '4': 17,
      '8': 1,
      '8a': 6,
      '8m': 7,
      '16': 1,
      '24': 1,
      '32': 1,
      '32f': 3,
      '64': 3
    };
    /**
     * @type {number}
     * @private
     */
    this.head_ = 0;
    // Load a file from the buffer if one was passed
    // when creating the object
    this.dataType = {};
    if(bytes) {
      this.fromBuffer(bytes);
    }
  }

  /**
   * Set up the WaveFile object based on the arguments passed.
   * @param {number} numChannels The number of channels
   *    (Integer numbers: 1 for mono, 2 stereo and so on).
   * @param {number} sampleRate The sample rate.
   *    Integer numbers like 8000, 44100, 48000, 96000, 192000.
   * @param {string} bitDepth The audio bit depth code.
   *    One of '4', '8', '8a', '8m', '16', '24', '32', '32f', '64'
   *    or any value between '8' and '32' (like '12').
   * @param {!Array<number>|!Array<!Array<number>>} samples Array of samples to be written.
   *    The samples must be in the correct range according to the
   *    bit depth.
   * @param {?Object} options Optional. Used to force the container
   *    as RIFX with {'container': 'RIFX'}
   * @throws {Error} If any argument does not meet the criteria.
   * @export
   */
  fromScratch(numChannels, sampleRate, bitDepth, samples, options={}) {
    if (!options['container']) {
      options['container'] = 'RIFF';
    }
    this.container = options['container'];
    this.bitDepth = bitDepth;
    samples = this.interleave_(samples);
    /** @type {number} */
    let numBytes = (((parseInt(bitDepth, 10) - 1) | 7) + 1) / 8;
    // Turn the samples to bytes
    this.updateDataType_();
    this.data.samples = new Uint8Array(samples.length * numBytes);
    packArrayTo(samples, this.dataType, this.data.samples);
    // create headers
    this.createPCMHeader_(
      bitDepth, numChannels, sampleRate, numBytes, options);
    if (bitDepth == '4') {
      this.createADPCMHeader_(
        bitDepth, numChannels, sampleRate, numBytes, options);
    } else if (bitDepth == '8a' || bitDepth == '8m') {
      this.createALawMulawHeader_(
        bitDepth, numChannels, sampleRate, numBytes, options);
    } else if(Object.keys(this.audioFormats_).indexOf(bitDepth) == -1 ||
        this.fmt.numChannels > 2) {
      this.createExtensibleHeader_(
        bitDepth, numChannels, sampleRate, numBytes, options);
    }
    // the data chunk
    this.data.chunkId = 'data';
    this.data.chunkSize = this.data.samples.length;
    this.validateHeader_();
    this.LEorBE_();
  }

  /**
   * Update the type definition used to read and write the samples.
   */
  updateDataType_() {
    /** @type {!Object} */
    this.dataType = {
      bits: ((parseInt(this.bitDepth, 10) - 1) | 7) + 1,
      float: this.bitDepth == '32f' || this.bitDepth == '64',
      signed: this.bitDepth != '8',
      be: this.container == 'RIFX'
    };
    if (['4', '8a', '8m'].indexOf(this.bitDepth) > -1 ) {
      this.dataType.bits = 8;
      this.dataType.signed = false;
    }
  }

  /**
   * Set up the WaveFile object from a byte buffer.
   * @param {!Array<number>|!Array<!Array<number>>} samples The samples.
   */
  interleave_(samples) {
    if (samples.length > 0) {
      if (samples[0].constructor === Array) {
        /** @type {!Array<number>} */
        let finalSamples = [];
        for (let i=0; i < samples[0].length; i++) {
          for (let j=0; j < samples.length; j++) {
            finalSamples.push(samples[j][i]);
          }
        }
        samples = finalSamples;
      }
    }
    return samples;
  }

  /**
   * Set up the WaveFile object from a byte buffer.
   * @param {!Uint8Array} bytes The buffer.
   * @param {boolean=} samples True if the samples should be loaded.
   * @throws {Error} If container is not RIFF, RIFX or RF64.
   * @throws {Error} If no 'fmt ' chunk is found.
   * @throws {Error} If no 'data' chunk is found.
   * @export
   */
  fromBuffer(bytes, samples=true) {
    this.head_ = 0;
    this.clearHeader_();
    this.readRIFFChunk_(bytes);
    /** @type {!Object} */
    let chunk = riffChunks(bytes);
    this.readDs64Chunk_(bytes, chunk.subChunks);
    this.readFmtChunk_(bytes, chunk.subChunks);
    this.readFactChunk_(bytes, chunk.subChunks);
    this.readBextChunk_(bytes, chunk.subChunks);
    this.readCueChunk_(bytes, chunk.subChunks);
    this.readSmplChunk_(bytes, chunk.subChunks);
    this.readDataChunk_(bytes, chunk.subChunks, samples);
    this.readJunkChunk_(bytes, chunk.subChunks);
    this.readLISTChunk_(bytes, chunk.subChunks);
    this.bitDepthFromFmt_();
    this.updateDataType_();
  }

  /**
   * Return a byte buffer representig the WaveFile object as a .wav file.
   * The return value of this method can be written straight to disk.
   * @return {!Uint8Array} A .wav file.
   * @throws {Error} If any property of the object appears invalid.
   * @export
   */
  toBuffer() {
    this.validateHeader_();
    return this.createWaveFile_();
  }

  /**
   * Use a .wav file encoded as a base64 string to load the WaveFile object.
   * @param {string} base64String A .wav file as a base64 string.
   * @throws {Error} If any property of the object appears invalid.
   * @export
   */
  fromBase64(base64String) {
    this.fromBuffer(new Uint8Array(decode(base64String)));
  }

  /**
   * Return a base64 string representig the WaveFile object as a .wav file.
   * @return {string} A .wav file as a base64 string.
   * @throws {Error} If any property of the object appears invalid.
   * @export
   */
  toBase64() {
    /** @type {Uint8Array} */
    let buffer = this.toBuffer();
    return encode(buffer, 0, buffer.length);
  }

  /**
   * Return a DataURI string representig the WaveFile object as a .wav file.
   * The return of this method can be used to load the audio in browsers.
   * @return {string} A .wav file as a DataURI.
   * @throws {Error} If any property of the object appears invalid.
   * @export
   */
  toDataURI() {
    return 'data:audio/wav;base64,' + this.toBase64();
  }

  /**
   * Use a .wav file encoded as a DataURI to load the WaveFile object.
   * @param {string} dataURI A .wav file as DataURI.
   * @throws {Error} If any property of the object appears invalid.
   * @export
   */
  fromDataURI(dataURI) {
    this.fromBase64(dataURI.replace('data:audio/wav;base64,', ''));
  }

  /**
   * Force a file as RIFF.
   * @export
   */
  toRIFF() {
    if (this.container == 'RF64') {
      this.fromScratch(
        this.fmt.numChannels,
        this.fmt.sampleRate,
        this.bitDepth,
        unpackArray(this.data.samples, this.dataType));
    } else {
      this.dataType.be = true;
      this.fromScratch(
        this.fmt.numChannels,
        this.fmt.sampleRate,
        this.bitDepth,
        unpackArray(this.data.samples, this.dataType));
    }
  }

  /**
   * Force a file as RIFX.
   * @export
   */
  toRIFX() {
    if (this.container == 'RF64') {
      this.fromScratch(
        this.fmt.numChannels,
        this.fmt.sampleRate,
        this.bitDepth,
        unpackArray(this.data.samples, this.dataType),
        {'container': 'RIFX'});
    } else {
      this.fromScratch(
        this.fmt.numChannels,
        this.fmt.sampleRate,
        this.bitDepth,
        unpackArray(this.data.samples, this.dataType),
        {'container': 'RIFX'});
    }
  }

  /**
   * Change the bit depth of the samples.
   * @param {string} bitDepth The new bit depth of the samples.
   *    One of '8' ... '32' (integers), '32f' or '64' (floats)
   * @param {boolean} changeResolution A boolean indicating if the
   *    resolution of samples should be actually changed or not.
   * @throws {Error} If the bit depth is not valid.
   * @export
   */
  toBitDepth(bitDepth, changeResolution=true) {
    /** @type {string} */
    let toBitDepth = bitDepth;
    /** @type {string} */
    let thisBitDepth = this.bitDepth;
    if (!changeResolution) {
      toBitDepth = this.realBitDepth_(bitDepth);
      thisBitDepth = this.realBitDepth_(this.bitDepth);
    }
    this.assureUncompressed_();
    /** @type {!Array<number>} */
    let samples = unpackArray(this.data.samples, this.dataType);
    this.truncateSamples(samples);
    bitdepth(samples, thisBitDepth, toBitDepth);
    this.fromScratch(
      this.fmt.numChannels,
      this.fmt.sampleRate,
      bitDepth,
      samples,
      {'container': this.correctContainer_()});
  }

  /**
   * Encode a 16-bit wave file as 4-bit IMA ADPCM.
   * @throws {Error} If sample rate is not 8000.
   * @throws {Error} If number of channels is not 1.
   * @export
   */
  toIMAADPCM() {
    if (this.fmt.sampleRate != 8000) {
      throw new Error(
        'Only 8000 Hz files can be compressed as IMA-ADPCM.');
    } else if(this.fmt.numChannels != 1) {
      throw new Error(
        'Only mono files can be compressed as IMA-ADPCM.');
    } else {
      this.assure16Bit_();
      this.fromScratch(
        this.fmt.numChannels,
        this.fmt.sampleRate,
        '4',
        encodeADPCM(unpackArray(this.data.samples, this.dataType)),
        {'container': this.correctContainer_()});
    }
  }

  /**
   * Decode a 4-bit IMA ADPCM wave file as a 16-bit wave file.
   * @param {string} bitDepth The new bit depth of the samples.
   *    One of '8' ... '32' (integers), '32f' or '64' (floats).
   *    Optional. Default is 16.
   * @export
   */
  fromIMAADPCM(bitDepth='16') {
    this.fromScratch(
      this.fmt.numChannels,
      this.fmt.sampleRate,
      '16',
      decodeADPCM(this.data.samples, this.fmt.blockAlign),
      {'container': this.correctContainer_()});
    if (bitDepth != '16') {
      this.toBitDepth(bitDepth);
    }
  }

  /**
   * Encode 16-bit wave file as 8-bit A-Law.
   * @export
   */
  toALaw() {
    this.assure16Bit_();
    this.fromScratch(
      this.fmt.numChannels,
      this.fmt.sampleRate,
      '8a',
      alawmulaw.alaw.encode(unpackArray(this.data.samples, this.dataType)),
      {'container': this.correctContainer_()});
  }

  /**
   * Decode a 8-bit A-Law wave file into a 16-bit wave file.
   * @param {string} bitDepth The new bit depth of the samples.
   *    One of '8' ... '32' (integers), '32f' or '64' (floats).
   *    Optional. Default is 16.
   * @export
   */
  fromALaw(bitDepth='16') {
    this.fromScratch(
      this.fmt.numChannels,
      this.fmt.sampleRate,
      '16',
      alawmulaw.alaw.decode(this.data.samples),
      {'container': this.correctContainer_()});
    if (bitDepth != '16') {
      this.toBitDepth(bitDepth);
    }
  }

  /**
   * Encode 16-bit wave file as 8-bit mu-Law.
   * @export
   */
  toMuLaw() {
    this.assure16Bit_();
    /** @type {Array<number>} */
    let samples = unpackArray(this.data.samples, this.dataType);
    this.fromScratch(
      this.fmt.numChannels,
      this.fmt.sampleRate,
      '8m',
      alawmulaw.mulaw.encode(samples),
      {'container': this.correctContainer_()});
  }

  /**
   * Decode a 8-bit mu-Law wave file into a 16-bit wave file.
   * @param {string} bitDepth The new bit depth of the samples.
   *    One of '8' ... '32' (integers), '32f' or '64' (floats).
   *    Optional. Default is 16.
   * @export
   */
  fromMuLaw(bitDepth='16') {
    this.fromScratch(
      this.fmt.numChannels,
      this.fmt.sampleRate,
      '16',
      alawmulaw.mulaw.decode(this.data.samples),
      {'container': this.correctContainer_()});
    if (bitDepth != '16') {
      this.toBitDepth(bitDepth);
    }
  }

  /**
   * Write a RIFF tag in the INFO chunk. If the tag do not exist,
   * then it is created. It if exists, it is overwritten.
   * @param {string} tag The tag name.
   * @param {string} value The tag value.
   * @throws {Error} If the tag name is not valid.
   * @export
   */
  setTag(tag, value) {
    tag = this.fixTagName_(tag);
    /** @type {!Object} */
    let index = this.getTagIndex_(tag);
    if (index.TAG !== null) {
      this.LIST[index.LIST]['subChunks'][index.TAG]['chunkSize'] =
        value.length + 1;
      this.LIST[index.LIST]['subChunks'][index.TAG]['value'] = value;
    } else if (index.LIST !== null) {
      this.LIST[index.LIST]['subChunks'].push({
        'chunkId': tag,
        'chunkSize': value.length + 1,
        'value': value});
    } else {
      this.LIST.push({
        'chunkId': 'LIST',
        'chunkSize': 8 + value.length + 1,
        'format': 'INFO',
        'subChunks': []});
      this.LIST[this.LIST.length - 1]['subChunks'].push({
        'chunkId': tag,
        'chunkSize': value.length + 1,
        'value': value});
    }
  }

  /**
   * Return the value of a RIFF tag in the INFO chunk.
   * @param {string} tag The tag name.
   * @return {?string} The value if the tag is found, null otherwise.
   * @export
   */
  getTag(tag) {
    /** @type {!Object} */
    let index = this.getTagIndex_(tag);
    if (index.TAG !== null) {
      return this.LIST[index.LIST]['subChunks'][index.TAG]['value'];
    }
    return null;
  }

  /**
   * Remove a RIFF tag in the INFO chunk.
   * @param {string} tag The tag name.
   * @return {boolean} True if a tag was deleted.
   * @export
   */
  deleteTag(tag) {
    /** @type {!Object} */
    let index = this.getTagIndex_(tag);
    if (index.TAG !== null) {
      this.LIST[index.LIST]['subChunks'].splice(index.TAG, 1);
      return true;
    }
    return false;
  }

  /**
   * Create a cue point in the wave file.
   * @param {number} position The cue point position in milliseconds.
   * @param {string} labl The LIST adtl labl text of the marker. Optional.
   * @export
   */
  setCuePoint(position, labl='') {
    this.cue.chunkId = 'cue ';
    position = (position * this.fmt.sampleRate) / 1000;
    /** @type {!Array<!Object>} */
    let existingPoints = this.getCuePoints_();
    this.clearLISTadtl_();
    /** @type {number} */
    let len = this.cue.points.length;
    this.cue.points = [];
    /** @type {boolean} */
    let hasSet = false;
    if (len == 0) {
      this.setCuePoint_(position, 1, labl);
    } else {
      for (let i=0; i<len; i++) {
        if (existingPoints[i]['dwPosition'] > position && !hasSet) {
          this.setCuePoint_(position, i + 1, labl);
          this.setCuePoint_(
            existingPoints[i]['dwPosition'],
            i + 2,
            existingPoints[i]['label']);
          hasSet = true;
        } else {
          this.setCuePoint_(
            existingPoints[i]['dwPosition'],
            i + 1,
            existingPoints[i]['label']);
        }
      }
      if (!hasSet) {
        this.setCuePoint_(position, this.cue.points.length + 1, labl);
      }
    }
    this.cue.dwCuePoints = this.cue.points.length;
  }

  /**
   * Remove a cue point from a wave file.
   * @param {number} index the index of the point. First is 1,
   *    second is 2, and so on.
   * @export
   */
  deleteCuePoint(index) {
    this.cue.chunkId = 'cue ';
    /** @type {!Array<!Object>} */
    let existingPoints = this.getCuePoints_();
    this.clearLISTadtl_();
    /** @type {number} */
    let len = this.cue.points.length;
    this.cue.points = [];
    for (let i=0; i<len; i++) {
      if (i + 1 != index) {
        this.setCuePoint_(
          existingPoints[i]['dwPosition'],
          i + 1,
          existingPoints[i]['label']);
      }
    }
    this.cue.dwCuePoints = this.cue.points.length;
    if (this.cue.dwCuePoints) {
      this.cue.chunkId = 'cue ';
    } else {
      this.cue.chunkId = '';
      this.clearLISTadtl_();
    }
  }

  /**
   * Update the label of a cue point.
   * @param {number} pointIndex The ID of the cue point.
   * @param {string} label The new text for the label.
   * @export
   */
  updateLabel(pointIndex, label) {
    /** @type {?number} */
    let adtlIndex = this.getAdtlChunk_();
    if (adtlIndex !== null) {
      for (let i=0; i<this.LIST[adtlIndex]['subChunks'].length; i++) {
        if (this.LIST[adtlIndex]['subChunks'][i]['dwName'] ==
            pointIndex) {
          this.LIST[adtlIndex]['subChunks'][i]['value'] = label;
        }
      }
    }
  }

  /**
   * Push a new cue point in this.cue.points.
   * @param {number} position The position in milliseconds.
   * @param {number} dwName the dwName of the cue point
   * @private
   */
  setCuePoint_(position, dwName, label) {
    this.cue.points.push({
      'dwName': dwName,
      'dwPosition': position,
      'fccChunk': 'data',
      'dwChunkStart': 0,
      'dwBlockStart': 0,
      'dwSampleOffset': position,
    });
    this.setLabl_(dwName, label);
  }

  /**
   * Return an array with the position of all cue points in the file.
   * @return {!Array<!Object>}
   * @private
   */
  getCuePoints_() {
    /** @type {!Array<!Object>} */
    let points = [];
    for (let i=0; i<this.cue.points.length; i++) {
      points.push({
        'dwPosition': this.cue.points[i]['dwPosition'],
        'label': this.getLabelForCuePoint_(
          this.cue.points[i]['dwName'])});
    }
    return points;
  }

  /**
   * Return the label of a cue point.
   * @param {number} pointDwName The ID of the cue point.
   * @return {string}
   * @private
   */
  getLabelForCuePoint_(pointDwName) {
    /** @type {?number} */
    let adtlIndex = this.getAdtlChunk_();
    if (adtlIndex !== null) {
      for (let i=0; i<this.LIST[adtlIndex]['subChunks'].length; i++) {
        if (this.LIST[adtlIndex]['subChunks'][i]['dwName'] ==
            pointDwName) {
          return this.LIST[adtlIndex]['subChunks'][i]['value'];
        }
      }
    }
    return '';
  }

  /**
   * Clear any LIST chunk labeled as 'adtl'.
   * @private
   */
  clearLISTadtl_() {
    for (let i=0; i<this.LIST.length; i++) {
      if (this.LIST[i]['format'] == 'adtl') {
        this.LIST.splice(i);
      }
    }
  }

  /**
   * Create a new 'labl' subchunk in a 'LIST' chunk of type 'adtl'.
   * @param {number} dwName The ID of the cue point.
   * @param {string} label The label for the cue point.
   * @private
   */
  setLabl_(dwName, label) {
    /** @type {?number} */
    let adtlIndex = this.getAdtlChunk_();
    if (adtlIndex === null) {
      this.LIST.push({
        'chunkId': 'LIST',
        'chunkSize': 4,
        'format': 'adtl',
        'subChunks': []});
      adtlIndex = this.LIST.length - 1;
    }
    this.setLabelText_(adtlIndex === null ? 0 : adtlIndex, dwName, label);
  }

  /**
   * Create a new 'labl' subchunk in a 'LIST' chunk of type 'adtl'.
   * @param {number} adtlIndex The index of the 'adtl' LIST in this.LIST.
   * @param {number} dwName The ID of the cue point.
   * @param {string} label The label for the cue point.
   * @private
   */
  setLabelText_(adtlIndex, dwName, label) {
    this.LIST[adtlIndex]['subChunks'].push({
      'chunkId': 'labl',
      'chunkSize': label.length,
      'dwName': dwName,
      'value': label
    });
    this.LIST[adtlIndex]['chunkSize'] += label.length + 4 + 4 + 4 + 1;
  }

  /**
   * Return the index of the 'adtl' LIST in this.LIST.
   * @return {?number}
   * @private
   */
  getAdtlChunk_() {
    for (let i=0; i<this.LIST.length; i++) {
      if(this.LIST[i]['format'] == 'adtl') {
        return i;
      }
    }
    return null;
  }

  /**
   * Return the index of a tag in a FILE chunk.
   * @param {string} tag The tag name.
   * @return {!Object<string, ?number>}
   *    Object.LIST is the INFO index in LIST
   *    Object.TAG is the tag index in the INFO
   * @private
   */
  getTagIndex_(tag) {
    /** @type {!Object<string, ?number>} */
    let index = {LIST: null, TAG: null};
    for (let i=0; i<this.LIST.length; i++) {
      if (this.LIST[i]['format'] == 'INFO') {
        index.LIST = i;
        for (let j=0; j<this.LIST[i]['subChunks'].length; j++) {
          if (this.LIST[i]['subChunks'][j]['chunkId'] == tag) {
            index.TAG = j;
            break;
          }
        }
        break;
      }
    }
    return index;
  }

  /**
   * Fix a RIFF tag format if possible, throw an error otherwise.
   * @param {string} tag The tag name.
   * @return {string} The tag name in proper fourCC format.
   * @private
   */
  fixTagName_(tag) {
    if (tag.constructor !== String) {
      throw new Error('Invalid tag name.');
    } else if(tag.length < 4) {
      for (let i=0; i<4-tag.length; i++) {
        tag += ' ';
      }
    }
    return tag;
  }

  /**
   * Create the header of a ADPCM wave file.
   * @param {string} bitDepth The audio bit depth
   * @param {number} numChannels The number of channels
   * @param {number} sampleRate The sample rate.
   * @param {number} numBytes The number of bytes each sample use.
   * @param {!Object} options The extra options, like container defintion.
   * @private
   */
  createADPCMHeader_(bitDepth, numChannels, sampleRate, numBytes, options) {
    this.createPCMHeader_(
      bitDepth, numChannels, sampleRate, numBytes, options);
    this.chunkSize = 40 + this.data.samples.length;
    this.fmt.chunkSize = 20;
    this.fmt.byteRate = 4055;
    this.fmt.blockAlign = 256;
    this.fmt.bitsPerSample = 4;
    this.fmt.cbSize = 2;
    this.fmt.validBitsPerSample = 505;
    this.fact.chunkId = 'fact';
    this.fact.chunkSize = 4;
    this.fact.dwSampleLength = this.data.samples.length * 2;
    this.data.chunkSize = this.data.samples.length;
  }

  /**
   * Create the header of WAVE_FORMAT_EXTENSIBLE file.
   * @param {string} bitDepth The audio bit depth
   * @param {number} numChannels The number of channels
   * @param {number} sampleRate The sample rate.
   * @param {number} numBytes The number of bytes each sample use.
   * @param {!Object} options The extra options, like container defintion.
   * @private
   */
  createExtensibleHeader_(
      bitDepth, numChannels, sampleRate, numBytes, options) {
    this.createPCMHeader_(
      bitDepth, numChannels, sampleRate, numBytes, options);
    //this.chunkSize = 36 + 24 + this.data.samples.length * numBytes;
    this.chunkSize = 36 + 24 + this.data.samples.length;
    this.fmt.chunkSize = 40;
    this.fmt.bitsPerSample = ((parseInt(bitDepth, 10) - 1) | 7) + 1;
    this.fmt.cbSize = 22;
    this.fmt.validBitsPerSample = parseInt(bitDepth, 10);
    this.fmt.dwChannelMask = this.getDwChannelMask_();
    // subformat 128-bit GUID as 4 32-bit values
    // only supports uncompressed integer PCM samples
    this.fmt.subformat = [1, 1048576, 2852126848, 1905997824];
  }

  /**
   * Get the value for dwChannelMask according to the number of channels.
   * @return {number} the dwChannelMask value.
   * @private
   */
  getDwChannelMask_() {
    /** @type {number} */
    let dwChannelMask = 0;
    // mono = FC
    if (this.fmt.numChannels == 1) {
      dwChannelMask = 0x4;
    // stereo = FL, FR
    } else if (this.fmt.numChannels == 2) {
      dwChannelMask = 0x3;
    // quad = FL, FR, BL, BR
    } else if (this.fmt.numChannels == 4) {
      dwChannelMask = 0x33;
    // 5.1 = FL, FR, FC, LF, BL, BR
    } else if (this.fmt.numChannels == 6) {
      dwChannelMask = 0x3F;
    // 7.1 = FL, FR, FC, LF, BL, BR, SL, SR
    } else if (this.fmt.numChannels == 8) {
      dwChannelMask = 0x63F;
    }
    return dwChannelMask;
  }

  /**
   * Create the header of mu-Law and A-Law wave files.
   * @param {string} bitDepth The audio bit depth
   * @param {number} numChannels The number of channels
   * @param {number} sampleRate The sample rate.
   * @param {number} numBytes The number of bytes each sample use.
   * @param {!Object} options The extra options, like container defintion.
   * @private
   */
  createALawMulawHeader_(
      bitDepth, numChannels, sampleRate, numBytes, options) {
    this.createPCMHeader_(
      bitDepth, numChannels, sampleRate, numBytes, options);
    this.chunkSize = 40 + this.data.samples.length;
    this.fmt.chunkSize = 20;
    this.fmt.cbSize = 2;
    this.fmt.validBitsPerSample = 8;
    this.fact.chunkId = 'fact';
    this.fact.chunkSize = 4;
    this.fact.dwSampleLength = this.data.samples.length;
  }

  /**
   * Create the header of a linear PCM wave file.
   * @param {string} bitDepth The audio bit depth
   * @param {number} numChannels The number of channels
   * @param {number} sampleRate The sample rate.
   * @param {number} numBytes The number of bytes each sample use.
   * @param {!Object} options The extra options, like container defintion.
   * @private
   */
  createPCMHeader_(bitDepth, numChannels, sampleRate, numBytes, options) {
    this.clearHeader_();
    this.container = options['container'];
    //this.chunkSize = 36 + this.data.samples.length * numBytes;
    this.chunkSize = 36 + this.data.samples.length;
    this.format = 'WAVE';
    this.fmt.chunkId = 'fmt ';
    this.fmt.chunkSize = 16;
    this.fmt.byteRate = (numChannels * numBytes) * sampleRate;
    this.fmt.blockAlign = numChannels * numBytes;
    this.fmt.audioFormat = this.audioFormats_[bitDepth] ?
      this.audioFormats_[bitDepth] : 65534;
    this.fmt.numChannels = numChannels;
    this.fmt.sampleRate = sampleRate;
    this.fmt.bitsPerSample = parseInt(bitDepth, 10);
    this.fmt.cbSize = 0;
    this.fmt.validBitsPerSample = 0;
  }

  /**
   * Return the closest greater number of bits for a number of bits that
   * do not fill a full sequence of bytes.
   * @param {string} bitDepth The bit depth.
   * @return {string}
   * @private
   */
  realBitDepth_(bitDepth) {
    if (bitDepth != '32f') {
      bitDepth = (((parseInt(bitDepth, 10) - 1) | 7) + 1).toString();
    }
    return bitDepth;
  }

  /**
   * Validate the header of the file.
   * @throws {Error} If any property of the object appears invalid.
   * @private
   */
  validateHeader_() {
    this.validateBitDepth_();
    this.validateNumChannels_();
    this.validateSampleRate_();
  }

  /**
   * Validate the bit depth.
   * @return {boolean} True is the bit depth is valid.
   * @throws {Error} If bit depth is invalid.
   * @private
   */
  validateBitDepth_() {
    if (!this.audioFormats_[this.bitDepth]) {
      if (parseInt(this.bitDepth, 10) > 8 &&
          parseInt(this.bitDepth, 10) < 54) {
        return true;
      }
      throw new Error('Invalid bit depth.');
    }
    return true;
  }

  /**
   * Validate the number of channels.
   * @return {boolean} True is the number of channels is valid.
   * @throws {Error} If the number of channels is invalid.
   * @private
   */
  validateNumChannels_() {
    /** @type {number} */
    let blockAlign = this.fmt.numChannels * this.fmt.bitsPerSample / 8;
    if (this.fmt.numChannels < 1 || blockAlign > 65535) {
      throw new Error('Invalid number of channels.');
    }
    return true;
  }

  /**
   * Validate the sample rate value.
   * @return {boolean} True is the sample rate is valid.
   * @throws {Error} If the sample rate is invalid.
   * @private
   */
  validateSampleRate_() {
    /** @type {number} */
    let byteRate = this.fmt.numChannels *
      (this.fmt.bitsPerSample / 8) * this.fmt.sampleRate;
    if (this.fmt.sampleRate < 1 || byteRate > 4294967295) {
      throw new Error('Invalid sample rate.');
    }
    return true;
  }

  /**
   * Reset attributes that should emptied when a file is
   * created with the fromScratch() or fromBuffer() methods.
   * @private
   */
  clearHeader_() {
    this.fmt.cbSize = 0;
    this.fmt.validBitsPerSample = 0;
    this.fact.chunkId = '';
    this.ds64.chunkId = '';
  }

  /**
   * Make the file 16-bit if it is not.
   * @private
   */
  assure16Bit_() {
    this.assureUncompressed_();
    if (this.bitDepth != '16') {
      this.toBitDepth('16');
    }
  }

  /**
   * Uncompress the samples in case of a compressed file.
   * @private
   */
  assureUncompressed_() {
    if (this.bitDepth == '8a') {
      this.fromALaw();
    } else if(this.bitDepth == '8m') {
      this.fromMuLaw();
    } else if (this.bitDepth == '4') {
      this.fromIMAADPCM();
    }
  }

  /**
   * Set up to work wih big-endian or little-endian files.
   * The types used are changed to LE or BE. If the
   * the file is big-endian (RIFX), true is returned.
   * @return {boolean} True if the file is RIFX.
   * @private
   */
  LEorBE_() {
    /** @type {boolean} */
    let bigEndian = this.container === 'RIFX';
    uInt16_.be = bigEndian;
    uInt32_.be = bigEndian;
    return bigEndian;
  }

  /**
   * Find a chunk by its fourCC_ in a array of RIFF chunks.
   * @param {!Object} chunks The wav file chunks.
   * @param {string} chunkId The chunk fourCC_.
   * @param {boolean} multiple True if there may be multiple chunks
   *    with the same chunkId.
   * @return {?Array<!Object>}
   * @private
   */
  findChunk_(chunks, chunkId, multiple=false) {
    /** @type {!Array<!Object>} */
    let chunk = [];
    for (let i=0; i<chunks.length; i++) {
      if (chunks[i].chunkId == chunkId) {
        if (multiple) {
          chunk.push(chunks[i]);
        } else {
          return chunks[i];
        }
      }
    }
    if (chunkId == 'LIST') {
      return chunk.length ? chunk : null;
    }
    return null;
  }

  /**
   * Read the RIFF chunk a wave file.
   * @param {!Uint8Array} bytes A wav buffer.
   * @throws {Error} If no 'RIFF' chunk is found.
   * @private
   */
  readRIFFChunk_(bytes) {
    this.head_ = 0;
    this.container = this.readString_(bytes, 4);
    if (['RIFF', 'RIFX', 'RF64'].indexOf(this.container) === -1) {
      throw Error('Not a supported format.');
    }
    this.LEorBE_();
    this.chunkSize = this.read_(bytes, uInt32_);
    this.format = this.readString_(bytes, 4);
    if (this.format != 'WAVE') {
      throw Error('Could not find the "WAVE" format identifier');
    }
  }

  /**
   * Read the 'fmt ' chunk of a wave file.
   * @param {!Uint8Array} buffer The wav file buffer.
   * @param {!Object} signature The file signature.
   * @throws {Error} If no 'fmt ' chunk is found.
   * @private
   */
  readFmtChunk_(buffer, signature) {
    /** @type {?Object} */
    let chunk = this.findChunk_(signature, 'fmt ');
    if (chunk) {
      this.head_ = chunk.chunkData.start;
      this.fmt.chunkId = chunk.chunkId;
      this.fmt.chunkSize = chunk.chunkSize;
      this.fmt.audioFormat = this.read_(buffer, uInt16_);
      this.fmt.numChannels = this.read_(buffer, uInt16_);
      this.fmt.sampleRate = this.read_(buffer, uInt32_);
      this.fmt.byteRate = this.read_(buffer, uInt32_);
      this.fmt.blockAlign = this.read_(buffer, uInt16_);
      this.fmt.bitsPerSample = this.read_(buffer, uInt16_);
      this.readFmtExtension_(buffer);
    } else {
      throw Error('Could not find the "fmt " chunk');
    }
  }

  /**
   * Read the 'fmt ' chunk extension.
   * @param {!Uint8Array} buffer The wav file buffer.
   * @private
   */
  readFmtExtension_(buffer) {
    if (this.fmt.chunkSize > 16) {
      this.fmt.cbSize = this.read_(buffer, uInt16_);
      if (this.fmt.chunkSize > 18) {
        this.fmt.validBitsPerSample = this.read_(buffer, uInt16_);
        if (this.fmt.chunkSize > 20) {
          this.fmt.dwChannelMask = this.read_(buffer, uInt32_);
          this.fmt.subformat = [
            this.read_(buffer, uInt32_),
            this.read_(buffer, uInt32_),
            this.read_(buffer, uInt32_),
            this.read_(buffer, uInt32_)];
        }
      }
    }
  }

  /**
   * Read the 'fact' chunk of a wav file.
   * @param {!Uint8Array} buffer The wav file buffer.
   * @param {!Object} signature The file signature.
   * @private
   */
  readFactChunk_(buffer, signature) {
    /** @type {?Object} */
    let chunk = this.findChunk_(signature, 'fact');
    if (chunk) {
      this.head_ = chunk.chunkData.start;
      this.fact.chunkId = chunk.chunkId;
      this.fact.chunkSize = chunk.chunkSize;
      this.fact.dwSampleLength = this.read_(buffer, uInt32_);
    }
  }

  /**
   * Read the 'cue ' chunk of a wave file.
   * @param {!Uint8Array} buffer The wav file buffer.
   * @param {!Object} signature The file signature.
   * @private
   */
  readCueChunk_(buffer, signature) {
    /** @type {?Object} */
    let chunk = this.findChunk_(signature, 'cue ');
    if (chunk) {
      this.head_ = chunk.chunkData.start;
      this.cue.chunkId = chunk.chunkId;
      this.cue.chunkSize = chunk.chunkSize;
      this.cue.dwCuePoints = this.read_(buffer, uInt32_);
      for (let i=0; i<this.cue.dwCuePoints; i++) {
        this.cue.points.push({
          'dwName': this.read_(buffer, uInt32_),
          'dwPosition': this.read_(buffer, uInt32_),
          'fccChunk': this.readString_(buffer, 4),
          'dwChunkStart': this.read_(buffer, uInt32_),
          'dwBlockStart': this.read_(buffer, uInt32_),
          'dwSampleOffset': this.read_(buffer, uInt32_),
        });
      }
    }
  }

  /**
   * Read the 'smpl' chunk of a wave file.
   * @param {!Uint8Array} buffer The wav file buffer.
   * @param {!Object} signature The file signature.
   * @private
   */
  readSmplChunk_(buffer, signature) {
    /** @type {?Object} */
    let chunk = this.findChunk_(signature, 'smpl');
    if (chunk) {
      this.head_ = chunk.chunkData.start;
      this.smpl.chunkId = chunk.chunkId;
      this.smpl.chunkSize = chunk.chunkSize;
      this.smpl.dwManufacturer = this.read_(buffer, uInt32_);
      this.smpl.dwProduct = this.read_(buffer, uInt32_);
      this.smpl.dwSamplePeriod = this.read_(buffer, uInt32_);
      this.smpl.dwMIDIUnityNote = this.read_(buffer, uInt32_);
      this.smpl.dwMIDIPitchFraction = this.read_(buffer, uInt32_);
      this.smpl.dwSMPTEFormat = this.read_(buffer, uInt32_);
      this.smpl.dwSMPTEOffset = this.read_(buffer, uInt32_);
      this.smpl.dwNumSampleLoops = this.read_(buffer, uInt32_);
      this.smpl.dwSamplerData = this.read_(buffer, uInt32_);
      for (let i=0; i<this.smpl.dwNumSampleLoops; i++) {
        this.smpl.loops.push({
          'dwName': this.read_(buffer, uInt32_),
          'dwType': this.read_(buffer, uInt32_),
          'dwStart': this.read_(buffer, uInt32_),
          'dwEnd': this.read_(buffer, uInt32_),
          'dwFraction': this.read_(buffer, uInt32_),
          'dwPlayCount': this.read_(buffer, uInt32_),
        });
      }
    }
  }

  /**
   * Read the 'data' chunk of a wave file.
   * @param {!Uint8Array} buffer The wav file buffer.
   * @param {!Object} signature The file signature.
   * @param {boolean} samples True if the samples should be loaded.
   * @throws {Error} If no 'data' chunk is found.
   * @private
   */
  readDataChunk_(buffer, signature, samples) {
    /** @type {?Object} */
    let chunk = this.findChunk_(signature, 'data');
    if (chunk) {
      this.data.chunkId = 'data';
      this.data.chunkSize = chunk.chunkSize;
      if (samples) {
        this.data.samples = buffer.slice(
          chunk.chunkData.start,
          chunk.chunkData.end);
      }
    } else {
      throw Error('Could not find the "data" chunk');
    }
  }

  /**
   * Read the 'bext' chunk of a wav file.
   * @param {!Uint8Array} buffer The wav file buffer.
   * @param {!Object} signature The file signature.
   * @private
   */
  readBextChunk_(buffer, signature) {
    /** @type {?Object} */
    let chunk = this.findChunk_(signature, 'bext');
    if (chunk) {
      this.head_ = chunk.chunkData.start;
      this.bext.chunkId = chunk.chunkId;
      this.bext.chunkSize = chunk.chunkSize;
      this.bext.description = this.readString_(buffer, 256);
      this.bext.originator = this.readString_(buffer, 32);
      this.bext.originatorReference = this.readString_(buffer, 32);
      this.bext.originationDate = this.readString_(buffer, 10);
      this.bext.originationTime = this.readString_(buffer, 8);
      this.bext.timeReference = [
        this.read_(buffer, uInt32_),
        this.read_(buffer, uInt32_)];
      this.bext.version = this.read_(buffer, uInt16_);
      this.bext.UMID = this.readString_(buffer, 64);
      this.bext.loudnessValue = this.read_(buffer, uInt16_);
      this.bext.loudnessRange = this.read_(buffer, uInt16_);
      this.bext.maxTruePeakLevel = this.read_(buffer, uInt16_);
      this.bext.maxMomentaryLoudness = this.read_(buffer, uInt16_);
      this.bext.maxShortTermLoudness = this.read_(buffer, uInt16_);
      this.bext.reserved = this.readString_(buffer, 180);
      this.bext.codingHistory = this.readString_(
        buffer, this.bext.chunkSize - 602);
    }
  }

  /**
   * Read the 'ds64' chunk of a wave file.
   * @param {!Uint8Array} buffer The wav file buffer.
   * @param {!Object} signature The file signature.
   * @throws {Error} If no 'ds64' chunk is found and the file is RF64.
   * @private
   */
  readDs64Chunk_(buffer, signature) {
    /** @type {?Object} */
    let chunk = this.findChunk_(signature, 'ds64');
    if (chunk) {
      this.head_ = chunk.chunkData.start;
      this.ds64.chunkId = chunk.chunkId;
      this.ds64.chunkSize = chunk.chunkSize;
      this.ds64.riffSizeHigh = this.read_(buffer, uInt32_);
      this.ds64.riffSizeLow = this.read_(buffer, uInt32_);
      this.ds64.dataSizeHigh = this.read_(buffer, uInt32_);
      this.ds64.dataSizeLow = this.read_(buffer, uInt32_);
      this.ds64.originationTime = this.read_(buffer, uInt32_);
      this.ds64.sampleCountHigh = this.read_(buffer, uInt32_);
      this.ds64.sampleCountLow = this.read_(buffer, uInt32_);
      //if (this.ds64.chunkSize > 28) {
      //  this.ds64.tableLength = unpack(
      //    chunkData.slice(28, 32), uInt32_);
      //  this.ds64.table = chunkData.slice(
      //     32, 32 + this.ds64.tableLength); 
      //}
    } else {
      if (this.container == 'RF64') {
        throw Error('Could not find the "ds64" chunk');  
      }
    }
  }

  /**
   * Read the 'LIST' chunks of a wave file.
   * @param {!Uint8Array} buffer The wav file buffer.
   * @param {!Object} signature The file signature.
   * @private
   */
  readLISTChunk_(buffer, signature) {
    /** @type {?Object} */
    let listChunks = this.findChunk_(signature, 'LIST', true);
    if (listChunks === null) {
      return;
    }
    for (let j=0; j < listChunks.length; j++) {
      /** @type {!Object} */
      let subChunk = listChunks[j];
      this.LIST.push({
        'chunkId': subChunk.chunkId,
        'chunkSize': subChunk.chunkSize,
        'format': subChunk.format,
        'subChunks': []});
      for (let x=0; x<subChunk.subChunks.length; x++) {
        this.readLISTSubChunks_(subChunk.subChunks[x],
          subChunk.format, buffer);
      }
    }
  }

  /**
   * Read the sub chunks of a 'LIST' chunk.
   * @param {!Object} subChunk The 'LIST' subchunks.
   * @param {string} format The 'LIST' format, 'adtl' or 'INFO'.
   * @param {!Uint8Array} buffer The wav file buffer.
   * @private
   */
  readLISTSubChunks_(subChunk, format, buffer) {
    if (format == 'adtl') {
      if (['labl', 'note','ltxt'].indexOf(subChunk.chunkId) > -1) {
        this.head_ = subChunk.chunkData.start;
        /** @type {!Object<string, string|number>} */
        let item = {
          'chunkId': subChunk.chunkId,
          'chunkSize': subChunk.chunkSize,
          'dwName': this.read_(buffer, uInt32_)
        };
        if (subChunk.chunkId == 'ltxt') {
          item['dwSampleLength'] = this.read_(buffer, uInt32_);
          item['dwPurposeID'] = this.read_(buffer, uInt32_);
          item['dwCountry'] = this.read_(buffer, uInt16_);
          item['dwLanguage'] = this.read_(buffer, uInt16_);
          item['dwDialect'] = this.read_(buffer, uInt16_);
          item['dwCodePage'] = this.read_(buffer, uInt16_);
        }
        item['value'] = this.readZSTR_(buffer, this.head_);
        this.LIST[this.LIST.length - 1]['subChunks'].push(item);
      }
    // RIFF INFO tags like ICRD, ISFT, ICMT
    } else if(format == 'INFO') {
      this.head_ = subChunk.chunkData.start;
      this.LIST[this.LIST.length - 1]['subChunks'].push({
        'chunkId': subChunk.chunkId,
        'chunkSize': subChunk.chunkSize,
        'value': this.readZSTR_(buffer,  this.head_)
      });
    }
  }

  /**
   * Read the 'junk' chunk of a wave file.
   * @param {!Uint8Array} buffer The wav file buffer.
   * @param {!Object} signature The file signature.
   * @private
   */
  readJunkChunk_(buffer, signature) {
    /** @type {?Object} */
    let chunk = this.findChunk_(signature, 'junk');
    if (chunk) {
      this.junk = {
        'chunkId': chunk.chunkId,
        'chunkSize': chunk.chunkSize,
        'chunkData': [].slice.call(buffer.slice(
          chunk.chunkData.start,
          chunk.chunkData.end))
      };
    }
  }

  /**
   * Read bytes as a ZSTR string.
   * @param {!Uint8Array} bytes The bytes.
   * @return {string} The string.
   * @private
   */
  readZSTR_(bytes, index=0) {
    /** @type {string} */
    let str = '';
    for (let i=index; i<bytes.length; i++) {
      this.head_++;
      if (bytes[i] === 0) {
        break;
      }
      str += unpackString(bytes, i, 1);
    }
    return str;
  }

  /**
   * Read bytes as a string from a RIFF chunk.
   * @param {!Uint8Array} bytes The bytes.
   * @param {number} maxSize the max size of the string.
   * @return {string} The string.
   * @private
   */
  readString_(bytes, maxSize) {
    /** @type {string} */
    let str = '';
    for (let i=0; i<maxSize; i++) {
      str += unpackString(bytes, this.head_, 1);
      this.head_++;
    }
    return str;
  }

  /**
   * Read a number from a chunk.
   * @param {!Uint8Array} bytes The chunk bytes.
   * @param {!Object} bdType The type definition.
   * @return {number} The number.
   * @private
   */
  read_(bytes, bdType) {
    /** @type {number} */
    let size = bdType.bits / 8;
    /** @type {number} */
    let value = unpackFrom(bytes, bdType, this.head_);
    this.head_ += size;
    return value;
  }

  /**
   * Write a variable size string as bytes. If the string is smaller
   * than the max size the output array is filled with 0s.
   * @param {string} str The string to be written as bytes.
   * @param {number} maxSize the max size of the string.
   * @return {!Array<number>} The bytes.
   * @private
   */
  writeString_(str, maxSize, push=true) {
    /** @type {!Array<number>} */   
    let bytes = packString(str);
    if (push) {
      for (let i=bytes.length; i<maxSize; i++) {
        bytes.push(0);
      }  
    }
    return bytes;
  }

  /**
   * Truncate float samples on over and underflow.
   * @private
   */
  truncateSamples(samples) {
    if (this.fmt.audioFormat == 3) {
      /** @type {number} */   
      let len = samples.length;
      for (let i=0; i<len; i++) {
        if (samples[i] > 1) {
          samples[i] = 1;
        } else if (samples[i] < -1) {
          samples[i] = -1;
        }
      }
    }
  }

  /**
   * Return the bytes of the 'bext' chunk.
   * @return {!Array<number>} The 'bext' chunk bytes.
   * @private
   */
  getBextBytes_() {
    /** @type {!Array<number>} */
    let bytes = [];
    this.enforceBext_();
    if (this.bext.chunkId) {
      bytes = bytes.concat(
        packString(this.bext.chunkId),
        pack(602 + this.bext.codingHistory.length, uInt32_),
        this.writeString_(this.bext.description, 256),
        this.writeString_(this.bext.originator, 32),
        this.writeString_(this.bext.originatorReference, 32),
        this.writeString_(this.bext.originationDate, 10),
        this.writeString_(this.bext.originationTime, 8),
        pack(this.bext.timeReference[0], uInt32_),
        pack(this.bext.timeReference[1], uInt32_),
        pack(this.bext.version, uInt16_),
        this.writeString_(this.bext.UMID, 64),
        pack(this.bext.loudnessValue, uInt16_),
        pack(this.bext.loudnessRange, uInt16_),
        pack(this.bext.maxTruePeakLevel, uInt16_),
        pack(this.bext.maxMomentaryLoudness, uInt16_),
        pack(this.bext.maxShortTermLoudness, uInt16_),
        this.writeString_(this.bext.reserved, 180),
        this.writeString_(
          this.bext.codingHistory, this.bext.codingHistory.length));
    }
    return bytes;
  }

  /**
   * Make sure a 'bext' chunk is created if BWF data was created in a file.
   * @private
   */
  enforceBext_() {
    for (var prop in this.bext) {
      if (this.bext.hasOwnProperty(prop)) {
        if (this.bext[prop] && prop != 'timeReference') {
          this.bext.chunkId = 'bext';
          break;
        }
      }
    }
    if (this.bext.timeReference[0] || this.bext.timeReference[1]) {
      this.bext.chunkId = 'bext';
    }
  }

  /**
   * Return the bytes of the 'ds64' chunk.
   * @return {!Array<number>} The 'ds64' chunk bytes.
   * @private
   */
  getDs64Bytes_() {
    /** @type {!Array<number>} */
    let bytes = [];
    if (this.ds64.chunkId) {
      bytes = bytes.concat(
        packString(this.ds64.chunkId),
        pack(this.ds64.chunkSize, uInt32_),
        pack(this.ds64.riffSizeHigh, uInt32_),
        pack(this.ds64.riffSizeLow, uInt32_),
        pack(this.ds64.dataSizeHigh, uInt32_),
        pack(this.ds64.dataSizeLow, uInt32_),
        pack(this.ds64.originationTime, uInt32_),
        pack(this.ds64.sampleCountHigh, uInt32_),
        pack(this.ds64.sampleCountLow, uInt32_));
    }
    //if (this.ds64.tableLength) {
    //  ds64Bytes = ds64Bytes.concat(
    //    pack(this.ds64.tableLength, uInt32_),
    //    this.ds64.table);
    //}
    return bytes;
  }

  /**
   * Return the bytes of the 'cue ' chunk.
   * @return {!Array<number>} The 'cue ' chunk bytes.
   * @private
   */
  getCueBytes_() {
    /** @type {!Array<number>} */
    let bytes = [];
    if (this.cue.chunkId) {
      /** @type {!Array<number>} */
      let cuePointsBytes = this.getCuePointsBytes_();
      bytes = bytes.concat(
        packString(this.cue.chunkId),
        pack(cuePointsBytes.length + 4, uInt32_),
        pack(this.cue.dwCuePoints, uInt32_),
        cuePointsBytes);
    }
    return bytes;
  }

  /**
   * Return the bytes of the 'cue ' points.
   * @return {!Array<number>} The 'cue ' points as an array of bytes.
   * @private
   */
  getCuePointsBytes_() {
    /** @type {!Array<number>} */
    let points = [];
    for (let i=0; i<this.cue.dwCuePoints; i++) {
      points = points.concat(
        pack(this.cue.points[i]['dwName'], uInt32_),
        pack(this.cue.points[i]['dwPosition'], uInt32_),
        packString(this.cue.points[i]['fccChunk']),
        pack(this.cue.points[i]['dwChunkStart'], uInt32_),
        pack(this.cue.points[i]['dwBlockStart'], uInt32_),
        pack(this.cue.points[i]['dwSampleOffset'], uInt32_));
    }
    return points;
  }

  /**
   * Return the bytes of the 'smpl' chunk.
   * @return {!Array<number>} The 'smpl' chunk bytes.
   * @private
   */
  getSmplBytes_() {
    /** @type {!Array<number>} */
    let bytes = [];
    if (this.smpl.chunkId) {
      /** @type {!Array<number>} */
      let smplLoopsBytes = this.getSmplLoopsBytes_();
      bytes = bytes.concat(
        packString(this.smpl.chunkId),
        pack(smplLoopsBytes.length + 36, uInt32_),
        pack(this.smpl.dwManufacturer, uInt32_),
        pack(this.smpl.dwProduct, uInt32_),
        pack(this.smpl.dwSamplePeriod, uInt32_),
        pack(this.smpl.dwMIDIUnityNote, uInt32_),
        pack(this.smpl.dwMIDIPitchFraction, uInt32_),
        pack(this.smpl.dwSMPTEFormat, uInt32_),
        pack(this.smpl.dwSMPTEOffset, uInt32_),
        pack(this.smpl.dwNumSampleLoops, uInt32_),
        pack(this.smpl.dwSamplerData, uInt32_),
        smplLoopsBytes);
    }
    return bytes;
  }

  /**
   * Return the bytes of the 'smpl' loops.
   * @return {!Array<number>} The 'smpl' loops as an array of bytes.
   * @private
   */
  getSmplLoopsBytes_() {
    /** @type {!Array<number>} */
    let loops = [];
    for (let i=0; i<this.smpl.dwNumSampleLoops; i++) {
      loops = loops.concat(
        pack(this.smpl.loops[i]['dwName'], uInt32_),
        pack(this.smpl.loops[i]['dwType'], uInt32_),
        pack(this.smpl.loops[i]['dwStart'], uInt32_),
        pack(this.smpl.loops[i]['dwEnd'], uInt32_),
        pack(this.smpl.loops[i]['dwFraction'], uInt32_),
        pack(this.smpl.loops[i]['dwPlayCount'], uInt32_));
    }
    return loops;
  }

  /**
   * Return the bytes of the 'fact' chunk.
   * @return {!Array<number>} The 'fact' chunk bytes.
   * @private
   */
  getFactBytes_() {
    // @type {!Array<number>} 
    let bytes = [];
    if (this.fact.chunkId) {
      bytes = bytes.concat(
        packString(this.fact.chunkId),
        pack(this.fact.chunkSize, uInt32_),
        pack(this.fact.dwSampleLength, uInt32_));
    }
    return bytes;
  }

  /**
   * Return the bytes of the 'fmt ' chunk.
   * @return {!Array<number>} The 'fmt' chunk bytes.
   * @throws {Error} if no 'fmt ' chunk is present.
   * @private
   */
  getFmtBytes_() {
    if (this.fmt.chunkId) {
      return [].concat(
        packString(this.fmt.chunkId),
        pack(this.fmt.chunkSize, uInt32_),
        pack(this.fmt.audioFormat, uInt16_),
        pack(this.fmt.numChannels, uInt16_),
        pack(this.fmt.sampleRate, uInt32_),
        pack(this.fmt.byteRate, uInt32_),
        pack(this.fmt.blockAlign, uInt16_),
        pack(this.fmt.bitsPerSample, uInt16_),
        this.getFmtExtensionBytes_());
    }
    throw Error('Could not find the "fmt " chunk');
  }

  /**
   * Return the bytes of the fmt extension fields.
   * @return {!Array<number>} The fmt extension bytes.
   * @private
   */
  getFmtExtensionBytes_() {
    /** @type {!Array<number>} */
    let extension = [];
    if (this.fmt.chunkSize > 16) {
      extension = extension.concat(
        pack(this.fmt.cbSize, uInt16_));
    }
    if (this.fmt.chunkSize > 18) {
      extension = extension.concat(
        pack(this.fmt.validBitsPerSample, uInt16_));
    }
    if (this.fmt.chunkSize > 20) {
      extension = extension.concat(
        pack(this.fmt.dwChannelMask, uInt32_));
    }
    if (this.fmt.chunkSize > 24) {
      extension = extension.concat(
        pack(this.fmt.subformat[0], uInt32_),
        pack(this.fmt.subformat[1], uInt32_),
        pack(this.fmt.subformat[2], uInt32_),
        pack(this.fmt.subformat[3], uInt32_));
    }
    return extension;
  }

  /**
   * Return the bytes of the 'LIST' chunk.
   * @return {!Array<number>} The 'LIST' chunk bytes.
   * @export for tests
   */
  getLISTBytes_() {
    /** @type {!Array<number>} */
    let bytes = [];
    for (let i=0; i<this.LIST.length; i++) {
      /** @type {!Array<number>} */
      let subChunksBytes = this.getLISTSubChunksBytes_(
          this.LIST[i]['subChunks'], this.LIST[i]['format']);
      bytes = bytes.concat(
        packString(this.LIST[i]['chunkId']),
        pack(subChunksBytes.length + 4, uInt32_),
        packString(this.LIST[i]['format']),
        subChunksBytes);
    }
    return bytes;
  }

  /**
   * Return the bytes of the sub chunks of a 'LIST' chunk.
   * @param {!Array<!Object>} subChunks The 'LIST' sub chunks.
   * @param {string} format The format of the 'LIST' chunk.
   *    Currently supported values are 'adtl' or 'INFO'.
   * @return {!Array<number>} The sub chunk bytes.
   * @private
   */
  getLISTSubChunksBytes_(subChunks, format) {
    /** @type {!Array<number>} */
    let bytes = [];
    for (let i=0; i<subChunks.length; i++) {
      if (format == 'INFO') {
        bytes = bytes.concat(
          packString(subChunks[i]['chunkId']),
          pack(subChunks[i]['value'].length + 1, uInt32_),
          this.writeString_(
            subChunks[i]['value'], subChunks[i]['value'].length));
        bytes.push(0);
      } else if (format == 'adtl') {
        if (['labl', 'note'].indexOf(subChunks[i]['chunkId']) > -1) {
          bytes = bytes.concat(
            packString(subChunks[i]['chunkId']),
            pack(
              subChunks[i]['value'].length + 4 + 1, uInt32_),
            pack(subChunks[i]['dwName'], uInt32_),
            this.writeString_(
              subChunks[i]['value'],
              subChunks[i]['value'].length));
          bytes.push(0);
        } else if (subChunks[i]['chunkId'] == 'ltxt') {
          bytes = bytes.concat(
            this.getLtxtChunkBytes_(subChunks[i]));
        }
      }
      if (bytes.length % 2) {
        bytes.push(0);
      }
    }
    return bytes;
  }

  /**
   * Return the bytes of a 'ltxt' chunk.
   * @param {!Object} ltxt the 'ltxt' chunk.
   * @return {!Array<number>} The 'ltxt' chunk bytes.
   * @private
   */
  getLtxtChunkBytes_(ltxt) {
    return [].concat(
      packString(ltxt['chunkId']),
      pack(ltxt['value'].length + 20, uInt32_),
      pack(ltxt['dwName'], uInt32_),
      pack(ltxt['dwSampleLength'], uInt32_),
      pack(ltxt['dwPurposeID'], uInt32_),
      pack(ltxt['dwCountry'], uInt16_),
      pack(ltxt['dwLanguage'], uInt16_),
      pack(ltxt['dwLanguage'], uInt16_),
      pack(ltxt['dwCodePage'], uInt16_),
      this.writeString_(ltxt['value'], ltxt['value'].length));
  }

  /**
   * Return the bytes of the 'junk' chunk.
   * @return {!Array<number>} The 'junk' chunk bytes.
   * @private
   */
  getJunkBytes_() {
    /** @type {!Array<number>} */
    let bytes = [];
    if (this.junk.chunkId) {
      return bytes.concat(
        packString(this.junk.chunkId),
        pack(this.junk.chunkData.length, uInt32_),
        this.junk.chunkData);
    }
    return bytes;
  }

  /**
   * Return 'RIFF' if the container is 'RF64', the current container name
   * otherwise. Used to enforce 'RIFF' when RF64 is not allowed.
   * @return {string}
   * @private
   */
  correctContainer_() {
    return this.container == 'RF64' ? 'RIFF' : this.container;
  }

  /**
   * Set the string code of the bit depth based on the 'fmt ' chunk.
   * @private
   */
  bitDepthFromFmt_() {
    if (this.fmt.audioFormat == 3 && this.fmt.bitsPerSample == 32) {
      this.bitDepth = '32f';
    } else if (this.fmt.audioFormat == 6) {
      this.bitDepth = '8a';
    } else if (this.fmt.audioFormat == 7) {
      this.bitDepth = '8m';
    } else {
      this.bitDepth = this.fmt.bitsPerSample.toString();
    }
  }

  /**
   * Return a .wav file byte buffer with the data from the WaveFile object.
   * The return value of this method can be written straight to disk.
   * @return {!Uint8Array} The wav file bytes.
   * @private
   */
  createWaveFile_() {
    // @type {!Array<Array<number>|Uint8Array>}
    let fileBody = [
      this.getJunkBytes_(),
      this.getDs64Bytes_(),
      this.getBextBytes_(),
      this.getFmtBytes_(),
      this.getFactBytes_(),
      packString(this.data.chunkId),
      pack(this.data.samples.length, uInt32_),
      this.data.samples,
      this.getCueBytes_(),
      this.getSmplBytes_(),
      this.getLISTBytes_()
    ];
    // @type {number}
    let fileBodyLength = 0;
    for (let i=0; i<fileBody.length; i++) {
      fileBodyLength += fileBody[i].length;
    }
    // @type {!Uint8Array}
    let file = new Uint8Array(fileBodyLength + 12);
    // @type {number}
    let index = 0;
    index = packStringTo(this.container, file, index);
    index = packTo(fileBodyLength + 4, uInt32_, file, index);
    index = packStringTo(this.format, file, index);
    for (let i=0; i<fileBody.length; i++) {
      file.set(fileBody[i], index);
      index += fileBody[i].length;
    }
    return file;
  }
}
