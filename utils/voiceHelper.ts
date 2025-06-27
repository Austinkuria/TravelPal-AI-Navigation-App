import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export interface VoiceResult {
    text: string;
    confidence?: number;
}

export class VoiceHelper {
    private static instance: VoiceHelper;
    private isInitialized = false;
    private isListening = false;
    private onResults?: (results: VoiceResult[]) => void;
    private onError?: (error: string) => void;
    private onStart?: () => void;
    private onEnd?: () => void;

    static getInstance(): VoiceHelper {
        if (!VoiceHelper.instance) {
            VoiceHelper.instance = new VoiceHelper();
        }
        return VoiceHelper.instance;
    }

    async initialize(): Promise<boolean> {
        if (this.isInitialized) return true;

        try {
            // Check if voice recognition is available
            const available = await Voice.isAvailable();
            if (!available) {
                console.log('Voice recognition not available on this platform');
                return false;
            }

            // Set up event listeners
            Voice.onSpeechStart = () => {
                console.log('Voice: Speech started');
                this.onStart?.();
            };

            Voice.onSpeechEnd = () => {
                console.log('Voice: Speech ended');
                this.isListening = false;
                this.onEnd?.();
            };

            Voice.onSpeechError = (error) => {
                console.log('Voice: Error:', error);
                this.isListening = false;
                this.onError?.(error.error?.message || 'Speech recognition error');
            };

            Voice.onSpeechResults = (event) => {
                console.log('Voice: Results received:', event.value);
                console.log('Voice: Event object:', JSON.stringify(event, null, 2));

                if (event.value && event.value.length > 0) {
                    const results: VoiceResult[] = event.value.map((text: string) => ({ text }));
                    console.log('Voice: Processed results:', results);
                    this.onResults?.(results);
                } else {
                    console.log('Voice: No results in event.value');
                }
            };

            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize voice recognition:', error);
            return false;
        }
    }

    async startListening(
        onResults: (results: VoiceResult[]) => void,
        onError: (error: string) => void,
        onStart?: () => void,
        onEnd?: () => void
    ): Promise<boolean> {
        if (this.isListening) {
            await this.stopListening();
        }

        this.onResults = onResults;
        this.onError = onError;
        this.onStart = onStart;
        this.onEnd = onEnd;

        try {
            const initialized = await this.initialize();
            if (!initialized) {
                onError('Voice recognition not available');
                return false;
            }

            this.isListening = true;
            await Voice.start('en-US');
            return true;
        } catch (error) {
            console.error('Failed to start voice recognition:', error);
            this.isListening = false;
            onError('Failed to start voice recognition');
            return false;
        }
    }

    async stopListening(): Promise<void> {
        if (!this.isListening) return;

        try {
            await Voice.stop();
            this.isListening = false;
        } catch (error) {
            console.error('Failed to stop voice recognition:', error);
        }
    }

    async destroy(): Promise<void> {
        try {
            await Voice.destroy();
            this.isInitialized = false;
            this.isListening = false;
        } catch (error) {
            console.error('Failed to destroy voice recognition:', error);
        }
    }

    isCurrentlyListening(): boolean {
        return this.isListening;
    }

    // Fallback method that simulates voice input for testing
    simulateVoiceInput(text: string): void {
        if (this.onResults) {
            setTimeout(() => {
                this.onResults?.([{ text, confidence: 0.95 }]);
            }, 1000);
        }
    }
}

export default VoiceHelper;
