import React, {useState, useEffect, useCallback} from 'react';
import {
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Text,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import Styled from 'styled-components/native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
const Container = Styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f5fcff;
`;
const ButtonRecord = Styled.Button``;
const VoiceText = Styled.Text`
  margin: 32px;
  color:#222;
`;

const App = () => {
  const [isRecord, setIsRecord] = useState();
  const [text, setText] = useState('');
  const [read_text, setread_text] = useState('');
  const buttonLabel = isRecord ? 'Stop' : 'Start';
  const voiceLabel = text
    ? text
    : isRecord
    ? 'Say something...'
    : 'press Start button';

  const ee = new NativeEventEmitter(NativeModules.TextToSpeech);
  ee.addListener('tts-start', () => {});
  ee.addListener('tts-finish', () => {});
  ee.addListener('tts-cancel', () => {});

  const _onSpeechStart = async () => {
    if (Platform.OS === 'android') {
      try {
        const {status, expires, permissions} = await Permissions.askAsync(
          Permissions.AUDIO_RECORDING,
        );
        if (status !== 'granted') {
          //Permissions not granted. Don't show the start recording button because it will cause problems if it's pressed.
        } else {
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }
    setText('');
    console.log('onSpeechStart');
  };
  console.log('read_text ::: ', read_text);
  const _onSpeechEnd = () => {
    console.log('onSpeechEnd ::');
    console.log('text ::: ', text);
  };
  const _onSpeechResults = event => {
    console.log('onSpeechResults');
    console.log(event.value[0]);
    setread_text(event.value[0]);
    setText(event.value[0]);
  };
  const _onSpeechError = event => {
    console.log('_onSpeechError');
    console.log('event.error :: ', event.error);
  };

  const _onRecordVoice = async () => {
    Voice.removeAllListeners();
    if (isRecord) {
      Voice.stop();
    } else {
      await _onSpeechStart();
      await Voice.start('en-US');
    }
    setIsRecord(!isRecord);
  };

  useEffect(() => {
    Voice.onSpeechStart = _onSpeechStart;
    Voice.onSpeechEnd = _onSpeechEnd;
    Voice.onSpeechResults = _onSpeechResults;
    Voice.onSpeechError = _onSpeechError;
    Voice.removeAllListeners();
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  return (
    <Container>
      <TouchableOpacity
        onPress={() => {
          if (Platform.OS === 'android') {
            Tts.speak('Where are you from?', {
              androidParams: {
                KEY_PARAM_STREAM: 'STREAM_ACCESSIBILITY',
              },
            });
          } else {
            Tts.speak('Where are you from?', {
              iosVoiceId: 'com.apple.ttsbundle.Moira-compact',
              rate: 0.5,
            });
          }
        }}>
        <Text>Where are you from?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          Tts.speak(read_text ?? '', {
            androidParams: {
              KEY_PARAM_STREAM: 'STREAM_ACCESSIBILITY',
            },
            iosVoiceId: 'com.apple.ttsbundle.Moira-compact',
            rate: 0.5,
          });
        }}>
        <VoiceText>{voiceLabel}</VoiceText>
      </TouchableOpacity>
      <ButtonRecord onPress={_onRecordVoice} title={buttonLabel} />
    </Container>
  );
};

export default App;
