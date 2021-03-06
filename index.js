var Analyser = require('web-audio-analyser')
var Texture  = require('gl-texture2d')
var ndarray  = require('ndarray')

module.exports = GLAudioAnalyser

function GLAudioAnalyser(gl, audio, ctx) {
  if (!(this instanceof GLAudioAnalyser))
    return new GLAudioAnalyser(gl, audio, ctx)

  this.gl    = gl
  this.audio = audio
  this.ctx   = ctx || new AudioContext

  this.waa     = Analyser(this.audio, this.ctx)

  var size = (this.waa.analyser[0] || this.waa.analyser).frequencyBinCount

  this.waveNda = ndarray(new Float32Array(size), [size, 1])
  this.waveTex = Texture(gl, this.waveNda, { float: true })
  this.waveFlt = this.waveNda.data

  this.freqNda = ndarray(new Float32Array(size), [size, 1])
  this.freqTex = Texture(gl, this.freqNda, { float: true })
  this.freqFlt = this.freqNda.data
}

GLAudioAnalyser.prototype.waveform = function(channel) {
  return this.waa.waveform(null, channel)
}
GLAudioAnalyser.prototype.frequencies = function(channel) {
  return this.waa.frequencies(null, channel)
}
GLAudioAnalyser.prototype.bindWaveform = function(index, channel) {
  var wave = this.waveform()
  var waveFlt = this.waveFlt

  for (var i = 0; i < wave.length; i++) {
    waveFlt[i] = (wave[i] - 128) / 128
  }

  this.waveTex.setPixels(this.waveNda)
  return this.waveTex.bind(index)
}

GLAudioAnalyser.prototype.bindFrequencies = function(index, channel) {
  var freq = this.frequencies()
  var freqFlt = this.freqFlt

  for (var i = 0; i < freq.length; i++) {
    freqFlt[i] = freq[i] / 256
  }

  this.freqTex.setPixels(this.freqNda)
  return this.freqTex.bind(index)
}
