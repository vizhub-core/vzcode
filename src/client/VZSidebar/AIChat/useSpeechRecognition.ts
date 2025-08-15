import {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from 'react';

export interface UseSpeechRecognitionResult {
  isSpeaking: boolean;
  toggleSpeechRecognition: () => void;
  stopSpeaking: () => void;
}

export const useSpeechRecognition = (
  onTranscriptChange: Dispatch<SetStateAction<string>>,
): UseSpeechRecognitionResult => {
  const [isSpeaking, setIsSpeaking] =
    useState<boolean>(false);
  const [recognition, setRecognition] =
    // @ts-ignore
    useState<SpeechRecognition | null>(null);
  const [, setFinalTranscript] = useState<string>('');

  // Speech recognition setup
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition =
      // @ts-ignore
      window.SpeechRecognition ||
      // @ts-ignore
      window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;

      recognitionInstance.onresult = (event) => {
        let finalText = '';
        let interimText = '';

        // Process all results to separate final and interim text
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript;
          } else {
            interimText += result[0].transcript;
          }
        }

        // Update our final transcript state
        setFinalTranscript(finalText);

        // Combine final and interim text and update the prompt
        const fullTranscript = finalText + interimText;
        onTranscriptChange(fullTranscript);
      };

      recognitionInstance.onerror = (event) => {
        console.error(
          'Speech recognition error',
          event.error,
        );
        setIsSpeaking(false);
      };

      recognitionInstance.onend = () => {
        setIsSpeaking(false);
        // Reset final transcript when recognition ends
        setFinalTranscript('');
      };

      setRecognition(recognitionInstance);

      return () => {
        recognitionInstance.abort();
      };
    }
  }, [onTranscriptChange]);

  const toggleSpeechRecognition = useCallback(() => {
    if (!recognition) {
      console.error(
        'Speech recognition not supported in this browser',
      );
      return;
    }

    if (isSpeaking) {
      recognition.stop();
      setIsSpeaking(false);
    } else {
      // Reset final transcript when starting new recognition
      setFinalTranscript('');
      recognition.start();
      setIsSpeaking(true);
    }
  }, [isSpeaking, recognition]);

  const stopSpeaking = useCallback(() => {
    if (recognition && isSpeaking) {
      recognition.stop();
      setIsSpeaking(false);
      // Reset final transcript when manually stopping
      setFinalTranscript('');
    }
  }, [isSpeaking, recognition]);

  return {
    isSpeaking,
    toggleSpeechRecognition,
    stopSpeaking,
  };
};
