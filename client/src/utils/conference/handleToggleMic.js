export default function handleToggleMic(managerRef, setMicEnabled) {
    const manager = managerRef.current;
    if (manager?.audioProducer?.track) {
      const audioTrack = manager.audioProducer.track;
      const willBeEnabled = !audioTrack.enabled;
      audioTrack.enabled = willBeEnabled;
      setMicEnabled(willBeEnabled);
  
      if (willBeEnabled) {
        manager.startSpeechRecognition?.();
      } else {
        manager.stopSpeechRecognition?.();
      }
    } else {
      console.error('🎤 Audio track not found');
    }
  }
  