// Voice Recognition Debug Test
// Add this as a debug button in your app to test voice recognition

const testVoiceRecognition = async () => {
    console.log('🔍 Testing Voice Recognition...');

    try {
        // Check if voice is available
        const available = await Voice.isAvailable();
        console.log('Voice available:', available);

        if (!available) {
            console.log('❌ Voice recognition not available on this device');
            return;
        }

        // Check supported locales
        const locales = await Voice.getSupportedLocales();
        console.log('Supported locales:', locales);

        // Set up event listeners with detailed logging
        Voice.onSpeechStart = () => {
            console.log('✅ Speech recognition started');
        };

        Voice.onSpeechRecognized = () => {
            console.log('✅ Speech recognized (but no results yet)');
        };

        Voice.onSpeechEnd = () => {
            console.log('✅ Speech recognition ended');
        };

        Voice.onSpeechError = (error) => {
            console.log('❌ Speech error:', error);
            console.log('Error details:', JSON.stringify(error, null, 2));
        };

        Voice.onSpeechResults = (event) => {
            console.log('✅ Speech results:', event.value);
            console.log('Full event:', JSON.stringify(event, null, 2));
        };

        Voice.onSpeechPartialResults = (event) => {
            console.log('🔄 Partial results:', event.value);
        };

        // Start recognition
        console.log('🎤 Starting voice recognition...');
        await Voice.start('en-US');

        // Auto-stop after 5 seconds for testing
        setTimeout(async () => {
            console.log('⏰ Auto-stopping after 5 seconds...');
            try {
                await Voice.stop();
            } catch (e) {
                console.log('Error stopping voice:', e);
            }
        }, 5000);

    } catch (error) {
        console.log('❌ Test failed:', error);
        console.log('Error details:', JSON.stringify(error, null, 2));
    }
};

// Usage: Call testVoiceRecognition() from a button press or console
// testVoiceRecognition();
