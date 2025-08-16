// Аудио система для острова
export class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.oceanSound = null;
    this.breezeSound = null;
    this.isAudioEnabled = false;
    this.init();
  }
  
  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Ocean waves sound
      const oceanOsc = this.audioContext.createOscillator();
      const oceanGain = this.audioContext.createGain();
      const oceanFilter = this.audioContext.createBiquadFilter();
      
      oceanOsc.type = 'sine';
      oceanOsc.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
      oceanFilter.type = 'lowpass';
      oceanFilter.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oceanGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      
      oceanOsc.connect(oceanFilter);
      oceanFilter.connect(oceanGain);
      oceanGain.connect(this.audioContext.destination);
      
      this.oceanSound = { osc: oceanOsc, gain: oceanGain, filter: oceanFilter };
      
      // Breeze sound
      const breezeOsc = this.audioContext.createOscillator();
      const breezeGain = this.audioContext.createGain();
      const breezeFilter = this.audioContext.createBiquadFilter();
      
      breezeOsc.type = 'sine';
      breezeOsc.frequency.setValueAtTime(800, this.audioContext.currentTime);
      breezeFilter.type = 'highpass';
      breezeFilter.frequency.setValueAtTime(600, this.audioContext.currentTime);
      breezeGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      
      breezeOsc.connect(breezeFilter);
      breezeFilter.connect(breezeGain);
      breezeGain.connect(this.audioContext.destination);
      
      this.breezeSound = { osc: breezeOsc, gain: breezeGain, filter: breezeFilter };
      
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }
  
  toggleAudio() {
    if (!this.audioContext) {
      this.init();
      return;
    }
    
    this.isAudioEnabled = !this.isAudioEnabled;
    
    if (this.isAudioEnabled) {
      this.audioContext.resume();
      if (this.oceanSound) this.oceanSound.osc.start();
      if (this.breezeSound) this.breezeSound.osc.start();
      
      const audioBtn = document.getElementById('audioBtn');
      audioBtn.textContent = 'Выключить звуки';
      audioBtn.classList.add('playing');
    } else {
      if (this.oceanSound) this.oceanSound.osc.stop();
      if (this.breezeSound) this.breezeSound.osc.stop();
      
      const audioBtn = document.getElementById('audioBtn');
      audioBtn.textContent = 'Включить звуки';
      audioBtn.classList.remove('playing');
    }
  }
  
  update(time) {
    if (this.isAudioEnabled && this.audioContext) {
      if (this.oceanSound) {
        this.oceanSound.gain.gain.setValueAtTime(0.3 + Math.sin(time * 0.5) * 0.1, this.audioContext.currentTime);
      }
      if (this.breezeSound) {
        this.breezeSound.gain.gain.setValueAtTime(0.1 + Math.sin(time * 0.3) * 0.05, this.audioContext.currentTime);
      }
    }
  }
}
