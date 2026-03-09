// Web Audio API Synthesizer for Game Sounds

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const playSound = (type) => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Helper to create a basic synth voice with a simple envelope
    const playTone = (freq, type, duration, vol) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);

        // Quick attack, smooth decay
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + duration);
        return osc;
    };

    if (type === 'submit') {
        // Quick, high-tech 'blip'
        const osc = playTone(800, 'sine', 0.2, 0.1);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    } else if (type === 'success') {
        // Soft, pleasant double chime (UI confirmation)
        playTone(523.25, 'triangle', 0.15, 0.1); // C5
        setTimeout(() => playTone(659.25, 'triangle', 0.4, 0.1), 100); // E5
    } else if (type === 'error') {
        // Soft, dull thud (modern UI error)
        const osc = playTone(150, 'sine', 0.3, 0.2);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
    } else if (type === 'victory') {
        // Ambient, swelling major chord
        playTone(523.25, 'triangle', 1.5, 0.1); // C5
        playTone(659.25, 'triangle', 1.5, 0.1); // E5
        playTone(783.99, 'triangle', 1.5, 0.1); // G5
    } else if (type === 'defeat') {
        // Deep, echoing submarine hum
        const osc = playTone(100, 'triangle', 1.5, 0.2);
        osc.frequency.exponentialRampToValueAtTime(60, now + 1.0);
    } else if (type === 'info') {
        // Very subtle, single UI blip for opponent actions
        playTone(600, 'sine', 0.1, 0.05);
    }
};
