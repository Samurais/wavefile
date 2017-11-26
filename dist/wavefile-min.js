/*
 endianness: Swap byte endianness in a array of bytes.
 Copyright (c) 2017 Rafael da Silva Rocha.
 https://github.com/rochars/endianness
 to-half: int bits of half-precision floating point values
 Based on:
 https://mail.mozilla.org/pipermail/es-discuss/2017-April/047994.html
 https://github.com/rochars/byte-data
 wavefile
 Read & write wave files with 8, 16, 24, 32 PCM, 32 IEEE & 64-bit data.
 Copyright (c) 2017 Rafael da Silva Rocha. MIT License.
 https://github.com/rochars/wavefile

 byte-data
 Readable data to and from bytes.
 Copyright (c) 2017 Rafael da Silva Rocha.
 https://github.com/rochars/byte-data
*/
var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.objectCreate=$jscomp.ASSUME_ES5||"function"==typeof Object.create?Object.create:function(a){var l=function(){};l.prototype=a;return new l};$jscomp.underscoreProtoCanBeSet=function(){var a={a:!0},l={};try{return l.__proto__=a,l.a}catch(k){}return!1};
$jscomp.setPrototypeOf="function"==typeof Object.setPrototypeOf?Object.setPrototypeOf:$jscomp.underscoreProtoCanBeSet()?function(a,l){a.__proto__=l;if(a.__proto__!==l)throw new TypeError(a+" is not extensible");return a}:null;
$jscomp.inherits=function(a,l){a.prototype=$jscomp.objectCreate(l.prototype);a.prototype.constructor=a;if($jscomp.setPrototypeOf){var k=$jscomp.setPrototypeOf;k(a,l)}else for(k in l)if("prototype"!=k)if(Object.defineProperties){var g=Object.getOwnPropertyDescriptor(l,k);g&&Object.defineProperty(a,k,g)}else a[k]=l[k];a.superClass_=l.prototype};
(function(a){function l(g){if(k[g])return k[g].exports;var f=k[g]={i:g,l:!1,exports:{}};a[g].call(f.exports,f,f.exports,l);f.l=!0;return f.exports}var k={};l.m=a;l.c=k;l.d=function(a,f,e){l.o(a,f)||Object.defineProperty(a,f,{configurable:!1,enumerable:!0,get:e})};l.n=function(a){var f=a&&a.__esModule?function(){return a["default"]}:function(){return a};l.d(f,"a",f);return f};l.o=function(a,f){return Object.prototype.hasOwnProperty.call(a,f)};l.p="";return l(l.s=5)})([function(a,l){function k(a,e){var b=
a.length+1;2==e?b=8:16==e&&(b=2);return g(a,b)}function g(a,e){for(;a.length<e;)a="0"+a;return a}a.exports.fixByteArraySize=function(a,e){var b=0,c=a.length%e;if(c)for(c=-1*(c-e);b<c;)a.push(0),b++};a.exports.padding=function(a,e,b){a[b]=k(a[b],e)};a.exports.paddingNibble=function(a,e,b){2==e&&4>a[b].length&&(a[b]=Array(5-a[b].length).join("0")+a[b])};a.exports.paddingCrumb=function(a,e,b){(2==e||16==e)&&2>a[b].length&&(a[b]="0"+a[b])};a.exports.bytePadding=k;a.exports.lPadZeros=g},function(a,l){function k(a){g[0]=
a;return f[0]}l=new Int8Array(4);var g=new Int32Array(l.buffer,0,1),f=new Float32Array(l.buffer,0,1);a.exports=k;a.exports.pack=k;a.exports.unpack=function(a){f[0]=a;return g[0]}},function(a,l){a.exports.BitDepthOffsets={1:1,2:1,4:1,8:1,16:2,24:3,32:4,40:5,48:6,64:8};a.exports.BitDepthMaxValues={2:4,4:16,8:256,16:65536,24:16777216,32:4294967296,40:1099511627776,48:281474976710656}},function(a,l){a.exports.endianness=function(a,g){for(var f=a.length,e=0;e<f;){for(var b,c=a,h=e,d=0,m=g-1,k=parseInt(g/
2,10);d<k;)b=c[h+d],c[h+d]=c[h+m],c[h+m]=b,d++,m--;e+=g}return a}},function(a,l,k){function g(b,a){a=void 0===a?!1:a;for(var d="",c=0,h=b.length;c<h;){var e=f.lPadZeros(b[c].toString(2),8);d=a?d+e:e+d;c++}return d}var f=k(0),e=new Float32Array(1),b=new Int32Array(e.buffer);a.exports.getBinary=g;a.exports.decodeFloat16=function(b){b=parseInt(g(b,!0),2);var c=(b&31744)>>10,d=b&1023;return(c?Math.pow(2,c-15)*(1+d/1024):d/1024*.00006103515625)*(b>>15?-1:1)};a.exports.decodeFloat64=function(b){if("0,0,0,0,0,0,0,0"==
b.toString())return 0;b=g(b);for(var a="1"+b.substr(12,52),d=1,c=0,e=0;e<a.length;)c+=d*parseInt(a.charAt(e),10),d/=2,e++;return("1"==b.charAt(0)?-1:1)*c*Math.pow(2,parseInt(b.substr(1,11),2)-1023)};a.exports.toFloat64=function(b){if(0==b)return[0,0];var a=0;0>=b&&(a=2147483648,b=-b);var d=Math.floor(Math.log(b)/Math.log(2)),c=Math.floor(b/Math.pow(2,d)*Math.pow(2,52));b=c&4294967295;c/=Math.pow(2,32);return[a|d+1023<<20|c&1048575,b]};a.exports.toHalf=function(a){e[0]=a;var c=b[0];a=c>>16&32768;var d=
c>>12&2047;c=c>>23&255;return 103>c?a:(a|c-112<<10|d>>1)+(d&1)}},function(a,l,k){var g=k(6),f=k(12);a=function(a,b,c){b=void 0===b?!1:b;c=void 0===c?!1:c;var e=f.WaveFileHeader.call(this)||this;e.isFromScratch_=!1;e.enforceFact=b;e.enforceBext=c;e.WaveErrors={format:"Not a supported format.",wave:"Could not find the 'WAVE' chunk","fmt ":"Could not find the 'fmt ' chunk",data:"Could not find the 'data' chunk",fact:"Could not find the 'fact' chunk",bext:"Could not find the 'bext' chunk",bitDepth:"Invalid bit depth.",
numChannels:"Invalid number of channels.",sampleRate:"Invalid sample rate."};e.samples_=[];e.bytes_=[];a&&e.fromBuffer(a);return e};$jscomp.inherits(a,f.WaveFileHeader);a.prototype.fromScratch=function(a,b,c,h,d){d=void 0===d?{}:d;d.container||(d.container="RIFF");this.isFromScratch_=!0;var e=parseInt(c,10)/8;this.chunkSize=36+h.length*e;this.subChunk1Size=16;this.byteRate=a*e*b;this.blockAlign=a*e;this.chunkId=d.container;this.format="WAVE";this.subChunk1Id="fmt ";this.audioFormat=this.headerFormats_[c];
this.numChannels=a;this.sampleRate=b;this.bitsPerSample=parseInt(c,10);this.subChunk2Id="data";this.subChunk2Size=h.length*e;this.samples_=h;this.bitDepth_=c};a.prototype.fromBuffer=function(a){this.isFromScratch_=!1;this.readRIFFChunk_(a);this.readWAVEChunk_(a);this.readFmtChunk_(a);this.readFactChunk_(a);this.readBextChunk_(a);this.readDataChunk_(a)};a.prototype.toBuffer=function(){this.checkWriteInput_(this.numChannels,this.sampleRate,this.bitDepth_);this.samplesToBytes_();return new Uint8Array(this.createWaveFile_())};
a.prototype.toRIFF=function(){this.chunkId="RIFF"};a.prototype.toRIFX=function(){this.chunkId="RIFX"};a.prototype.toBitDepth=function(a){if(a!=this.bitDepth_){var b=this.bitDepth_;this.bitDepth_=a;try{this.validateBitDepth_()}catch(n){throw this.bitDepth_=b,n;}a=this.samples_.length;for(var c=[],e=parseInt(g.BitDepthMaxValues[parseInt(b,10)]/2,10),d=parseInt((g.BitDepthMaxValues[parseInt(this.bitDepth_,10)]-1)/2,10),f=0;f<a;f++)"8"==b&&(this.samples_[f]-=128),"32f"==this.bitDepth_||"64"==this.bitDepth_?
"32f"==b||"64"==b?c.push(this.samples_[f]):c.push(this.samples_[f]/e):("32f"==b||"64"==b?c.push(this.samples_[f]*d):c.push(parseInt(this.samples_[f]/e*d,10)),0>c[f]&&c[f]--,"8"==this.bitDepth_&&(c[f]+=128));this.fromScratch(this.numChannels,this.sampleRate,this.bitDepth_,c,{container:this.chunkId})}};a.prototype.interleave=function(){var a=[],b,c,h=this.samples_[0].length;for(b=0;b<h;b++)for(c=0;c<this.samples_.length;c++)a.push(this.samples_[c][b]);this.samples_=a};a.prototype.deInterleave=function(){var a=
[],b;for(b=0;b<this.numChannels;b++)a[b]=[];b=0;for(var c;b<this.samples_.length;){for(c=0;c<this.numChannels;c++)a[c].push(this.samples_[b+c]);b+=c}this.samples_=a};a.prototype.readRIFFChunk_=function(a){this.chunkId=g.fromBytes(a.slice(0,4),8,{"char":!0});if("RIFF"!=this.chunkId&&"RIFX"!=this.chunkId)throw Error(this.WaveErrors.format);this.chunkSize=g.fromBytes(a.slice(4,8),32,{be:"RIFX"==this.chunkId})[0]};a.prototype.readWAVEChunk_=function(a){if(-1===g.findString(a,"WAVE"))throw Error(this.WaveErrors.wave);
this.format="WAVE"};a.prototype.readFmtChunk_=function(a){var b=g.findString(a,"fmt ");if(-1===b)throw Error(this.WaveErrors["fmt "]);var c={be:"RIFX"==this.chunkId};this.subChunk1Id="fmt ";this.subChunk1Size=g.fromBytes(a.slice(b+4,b+8),32,c)[0];this.audioFormat=g.fromBytes(a.slice(b+8,b+10),16,c)[0];this.numChannels=g.fromBytes(a.slice(b+10,b+12),16,c)[0];this.sampleRate=g.fromBytes(a.slice(b+12,b+16),32,c)[0];this.byteRate=g.fromBytes(a.slice(b+16,b+20),32,c)[0];this.blockAlign=g.fromBytes(a.slice(b+
20,b+22),16,c)[0];this.bitsPerSample=g.fromBytes(a.slice(b+22,b+24),16,c)[0];this.bitDepth_=3==this.audioFormat&&32==this.bitsPerSample?"32f":this.bitsPerSample.toString()};a.prototype.readFactChunk_=function(a){a=g.findString(a,"fact");if(-1===a&&this.enforceFact)throw Error(this.WaveErrors.fact);-1<a&&(this.factChunkId="fact")};a.prototype.readBextChunk_=function(a){a=g.findString(a,"bext");if(-1===a&&this.enforceBext)throw Error(this.WaveErrors.bext);-1<a&&(this.bextChunkId="bext")};a.prototype.readDataChunk_=
function(a){var b=g.findString(a,"data");if(-1===b)throw Error(this.WaveErrors.data);this.subChunk2Id="data";this.subChunk2Size=g.fromBytes(a.slice(b+4,b+8),32,{be:"RIFX"==this.chunkId})[0];this.samplesFromBytes_(a,b)};a.prototype.samplesFromBytes_=function(a,b){var c={signed:8==this.bitsPerSample?!1:!0,be:"RIFX"==this.chunkId};32==this.bitsPerSample&&3==this.audioFormat&&(c.float=!0);a=a.slice(b+8,b+8+this.subChunk2Size);this.samples_=4==this.bitsPerSample?g.fromBytes(a,8,c):g.fromBytes(a,this.bitsPerSample,
c)};a.prototype.checkWriteInput_=function(){this.validateBitDepth_();this.validateNumChannels_();this.validateSampleRate_()};a.prototype.validateBitDepth_=function(){if(!this.headerFormats_[this.bitDepth_])throw Error(this.WaveErrors.bitDepth);return!0};a.prototype.validateNumChannels_=function(){var a=this.numChannels*this.bitsPerSample/8;if(1>this.numChannels||65535<a)throw Error(this.WaveErrors.numChannels);return!0};a.prototype.validateSampleRate_=function(){var a=this.bitsPerSample/8*this.numChannels*
this.sampleRate;if(1>this.sampleRate||4294967295<a)throw Error(this.WaveErrors.sampleRate);return!0};a.prototype.samplesToBytes_=function(){var a={be:"RIFX"==this.chunkId};32==this.bitsPerSample&&3==this.audioFormat&&(a.float=!0);this.bytes_=g.toBytes(this.samples_,4==this.bitsPerSample?8:this.bitsPerSample,a);this.bytes_.length%2&&this.bytes_.push(0)};a.prototype.createWaveFile_=function(){var a=[];this.factChunkId&&(a=g.toBytes(this.factChunkId,8,{"char":!0}));var b={be:"RIFX"==this.chunkId};return g.toBytes(this.chunkId,
8,{"char":!0}).concat(g.toBytes([this.chunkSize],32,b),g.toBytes(this.format,8,{"char":!0}),g.toBytes(this.subChunk1Id,8,{"char":!0}),g.toBytes([this.subChunk1Size],32,b),g.toBytes([this.audioFormat],16,b),g.toBytes([this.numChannels],16,b),g.toBytes([this.sampleRate],32,b),g.toBytes([this.byteRate],32,b),g.toBytes([this.blockAlign],16,b),g.toBytes([this.bitsPerSample],16,b),a,g.toBytes(this.subChunk2Id,8,{"char":!0}),g.toBytes([this.subChunk2Size],32,b),this.bytes_)};window.WaveFile=a},function(a,
l,k){l=k(7);var g=k(9),f=k(11);k=k(2);a.exports.findString=function(a,b){for(var c,h=0;h<a.length;h++)if(c=g.fromBytes(a.slice(h,h+b.length),8,{"char":!0}),c==b)return h;return-1};a.exports.toBytes=l.toBytes;a.exports.fromBytes=g.fromBytes;a.exports.packBooleans=f.packBooleans;a.exports.unpackBooleans=f.unpackBooleans;a.exports.packCrumbs=f.packCrumbs;a.exports.unpackCrumbs=f.unpackCrumbs;a.exports.packNibbles=f.packNibbles;a.exports.unpackNibbles=f.unpackNibbles;a.exports.BitDepthOffsets=k.BitDepthOffsets;
a.exports.BitDepthMaxValues=k.BitDepthMaxValues},function(a,l,k){function g(a,b,c){4==b?f(a,c,e.paddingNibble):2==b?f(a,c,e.paddingCrumb):1==b?f(a,c,function(){}):f(a,c)}function f(a,b,c){c=void 0===c?e.padding:c;if(10!=b)for(var d=0,h=a.length;d<h;)a[d]=a[d].toString(b),c(a,b,d),d++}k(1);var e=k(0),b=k(3),c=k(8),h=k(2);a.exports.toBytes=function(a,f,e){e=void 0===e?{}:e;var d=10;"base"in e&&(d=e.base);var k=e.char?c.writeString:c["write"+f+"Bit"+(e.float?"Float":"")];for(var l=0,m=0,n=a.length,p=
[];l<n;)m=k(p,a,l,m),l++;a=p;e.be&&b.endianness(a,h.BitDepthOffsets[f]);g(a,f,d);e.buffer&&(a=new Uint8Array(a));return a}},function(a,l,k){function g(a,c,h,d){a[d++]=c[h]&255;a[d++]=c[h]>>>8&255;a[d++]=c[h]>>>16&255;a[d++]=c[h]>>>24&255;return d}var f=k(4),e=k(1);a.exports.write64Bit=function(a,c,h,d){c=f.toFloat64(c[h]);d=g(a,c,1,d);return g(a,c,0,d)};a.exports.write48Bit=function(a,c,h,d){a[d++]=c[h]&255;a[d++]=c[h]>>8&255;a[d++]=c[h]>>16&255;a[d++]=c[h]>>24&255;a[d++]=c[h]/4294967296&255;a[d++]=
c[h]/1099511627776&255;return d};a.exports.write40Bit=function(a,c,h,d){a[d++]=c[h]&255;a[d++]=c[h]>>8&255;a[d++]=c[h]>>16&255;a[d++]=c[h]>>24&255;a[d++]=c[h]/4294967296&255;return d};a.exports.write32BitFloat=function(a,c,h,d){c=e.unpack(c[h]);a[d++]=c&255;a[d++]=c>>>8&255;a[d++]=c>>>16&255;a[d++]=c>>>24&255;return d};a.exports.write32Bit=g;a.exports.write24Bit=function(a,c,h,d){a[d++]=c[h]&255;a[d++]=c[h]>>>8&255;a[d++]=c[h]>>>16&255;return d};a.exports.write16Bit=function(a,c,h,d){a[d++]=c[h]&
255;a[d++]=c[h]>>>8&255;return d};a.exports.write16BitFloat=function(a,c,h,d){c=f.toHalf(c[h]);a[d++]=c>>>8&255;a[d++]=c&255;return d};a.exports.write8Bit=function(a,c,h,d){a[d++]=c[h]&255;return d};a.exports.write4Bit=function(a,c,h,d){a[d++]=c[h]&15;return d};a.exports.write2Bit=function(a,c,h,d){a[d++]=0>c[h]?c[h]+4:c[h];return d};a.exports.write1Bit=function(a,c,h,d){a[d++]=c[h]?1:0;return d};a.exports.writeString=function(a,c,h,d){a[d++]=c.charCodeAt(h);return d}},function(a,l,k){function g(a,
b,e,g){var d=[],h=0,k=0,l=c.BitDepthOffsets[b],m=a.length-(l-1);b=c.BitDepthMaxValues[b];for(e=e?f:function(a,b){return a};h<m;)d[k]=e(g(a,h),b),h+=l,k++;return d}function f(a,b){a>parseInt(b/2,10)-1&&(a-=b);return a}var e=k(3),b=k(10),c=k(2);a.exports.fromBytes=function(a,c,f){f=void 0===f?{}:f;var d=10;"base"in f&&(d=f.base);f.be&&e.endianness(a,c/8);if(10!=d)for(var h=0,k=a.length;h<k;)a[h]=parseInt(a[h],d),h++;a=g(a,c,f.signed,f.char?b.readChar:b["read"+(2==c||4==c?8:c)+"Bit"+(f.float?"Float":
"")]);f.char&&(a=a.join(""));return a}},function(a,l,k){function g(a,c,b){--b;for(var d="";0<=b;)d+=e.bytePadding(a[b+c].toString(2),2),b--;return parseInt(d,2)}function f(a,b){return(a[3+b]<<24|a[2+b]<<16|a[1+b]<<8|a[b])>>>0}var e=k(0),b=k(4),c=k(1);a.exports.readChar=function(a,b){return String.fromCharCode(a[b])};a.exports.read1Bit=function(a,b){return parseInt(a[b],2)};a.exports.read8Bit=function(a,b){return a[b]};a.exports.read16Bit=function(a,b){return a[1+b]<<8|a[b]};a.exports.read16BitFloat=
function(a,c){return b.decodeFloat16(a.slice(c,c+2))};a.exports.read24Bit=function(a,b){return a[2+b]<<16|a[1+b]<<8|a[b]};a.exports.read32Bit=f;a.exports.read32BitFloat=function(a,b){return c.pack(f(a,b))};a.exports.read40Bit=function(a,b){return g(a,b,5)};a.exports.read48Bit=function(a,b){return g(a,b,6)};a.exports.read64Bit=function(a,c){return b.decodeFloat64(a.slice(c,c+8))}},function(a,l,k){var g=k(0);a.exports.packBooleans=function(a){var e=[],b=0,c=0;g.fixByteArraySize(a,8);for(var f=a.length-
7;b<f;)e[c++]=parseInt(a[b].toString(2)+a[b+1].toString(2)+a[b+2].toString(2)+a[b+3].toString(2)+a[b+4].toString(2)+a[b+5].toString(2)+a[b+6].toString(2)+a[b+7].toString(2),2),b+=8;return e};a.exports.unpackBooleans=function(a){for(var e=[],b=0,c=0,f=a.length,d;b<f;)d=g.lPadZeros(a[b].toString(2),8),e[c++]=parseInt(d[0],2),e[c++]=parseInt(d[1],2),e[c++]=parseInt(d[2],2),e[c++]=parseInt(d[3],2),e[c++]=parseInt(d[4],2),e[c++]=parseInt(d[5],2),e[c++]=parseInt(d[6],2),e[c++]=parseInt(d[7],2),b++;return e};
a.exports.packCrumbs=function(a){var e=[],b=0,c=0;g.fixByteArraySize(a,4);for(var f=a.length-3;b<f;)e[c++]=parseInt(g.lPadZeros(a[b].toString(2),2)+g.lPadZeros(a[b+1].toString(2),2)+g.lPadZeros(a[b+2].toString(2),2)+g.lPadZeros(a[b+3].toString(2),2),2),b+=4;return e};a.exports.unpackCrumbs=function(a){var e=[],b=0,c=0,f=a.length;for(console.log(f);b<f;){var d=g.lPadZeros(a[b].toString(2),8);e[c++]=parseInt(d[0]+d[1],2);e[c++]=parseInt(d[2]+d[3],2);e[c++]=parseInt(d[4]+d[5],2);e[c++]=parseInt(d[6]+
d[7],2);b++}return e};a.exports.packNibbles=function(a){var e=[],b=0,c=0,f=a.length;for(f%2&&a.push(0);b<f;)e[c++]=parseInt(a[b].toString(16)+a[b+1].toString(16),16),b+=2;return e};a.exports.unpackNibbles=function(a){for(var e=[],b=0,c=0,f=a.length;b<f;)e[c++]=parseInt(a[b].toString(16)[0],16),e[c++]=parseInt(a[b].toString(16)[1],16),b++;return e}},function(a,l){a.exports.WaveFileHeader=function(){this.chunkId="";this.chunkSize=0;this.format=this.subChunk1Id="";this.cbSize=this.bitsPerSample=this.blockAlign=
this.byteRate=this.sampleRate=this.numChannels=this.audioFormat=this.subChunk1Size=0;this.factChunkId="";this.factChunkSize=4;this.dwSampleLength=0;this.subChunk2Id="";this.subChunk2Size=0;this.bextChunkId="";this.headerFormats_={4:17,8:1,16:1,24:1,32:1,"32f":3,64:3}}}]);
