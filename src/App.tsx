import { FormEvent, useState, useEffect, useRef } from 'react';
import './App.css';
import {
    TextField,
    Button,
    Autocomplete,
    Box,
    ToggleButtonGroup,
    ToggleButton,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { styled } from '@mui/system';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const blue = {
    100: '#DAECFF',
    200: '#b6daff',
    400: '#3399FF',
    500: '#007FFF',
    600: '#0072E5',
    900: '#003A75',
};

const grey = {
    50: '#F3F6F9',
    100: '#E5EAF2',
    200: '#DAE2ED',
    300: '#C7D0DD',
    400: '#B0B8C4',
    500: '#9DA8B7',
    600: '#6B7A90',
    700: '#434D5B',
    800: '#303740',
    900: '#1C2025',
};

const Textarea = styled(BaseTextareaAutosize)(
    ({ theme }) => `
    box-sizing: border-box;
    width: 320px;
    font-family: 'Arial';
    font-size: 16px;
    font-weight: 400;
    line-height: 1.5;
    padding: 8px 12px;
    border-radius: 8px;
    color: ${theme.palette.mode === 'dark' ? grey[100] : grey[900]};
    background: ${theme.palette.mode === 'dark' ? grey[800] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0px 2px 2px ${
        theme.palette.mode === 'dark' ? grey[900] : grey[50]
    };

    &:hover {
      border-color: ${blue[400]};
    }

    &:focus {
      border-color: ${blue[400]};
      box-shadow: 0 0 0 3px ${
          theme.palette.mode === 'dark' ? blue[200] : blue[200]
      };
    }

    // firefox
    &:focus-visible {
      outline: 0;
    }
  `
);

interface Language {
    code: string;
    name: string;
}

interface TranslationRequest {
    inputMode: 'speech' | 'text';
    incomingSentence?: string | undefined;
    incomingSpeech?: string | undefined;
    fromLanguageCode: string | undefined;
    toLanguageCode: string | undefined;
}

function App() {
    const [loading, setLoading] = useState(false);
    const [ws, setWs] = useState<WebSocket | null>(null);

    // Translation
    const [incomingSentence, setIncomingSentence] = useState<string>();
    const [fromLanguageCode, setFromLanguageCode] = useState<string>();
    const [toLanguageCode, setToLanguageCode] = useState<string>();
    const [translation, setTranslation] = useState<string>();
    const [languages, setLanguages] = useState<Language[]>([]);
    // Audio
    // incoming speech response
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    // listening to user speech to stream
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

    const [alignment, setAlignment] = React.useState('web');

    const defaultPropsFromLanguage = {
        options: languages || [],
        getOptionLabel: (option: Language) => option.name,
    };

    const defaultPropsToLanguage = {
        options: languages || [],
        getOptionLabel: (option: Language) => option.name,
    };

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newAlignment: string
    ) => {
        setAlignment(newAlignment);
    };

    useEffect(() => {
        // Function to get available languages and initialize websocket
        const fetchData = async () => {
            const cachedLanguages = localStorage.getItem('cachedLanguages');
            if (cachedLanguages) {
                setLanguages(JSON.parse(cachedLanguages));
            } else {
                try {
                    const response = await fetch(
                        'http://localhost:9000/translation/languages'
                    );
                    if (response.ok) {
                        const languagesData: Language[] = await response.json();
                        setLanguages(languagesData);
                        localStorage.setItem(
                            'cachedLanguages',
                            JSON.stringify(languagesData)
                        );
                    }
                } catch (error) {
                    console.error('Error fetching languages:', error);
                }
            }
        };

        fetchData();

        const ws = new WebSocket('ws://localhost:8000');

        ws.onopen = () => {
            console.log('WebSocket connected');
            setWs(ws);
        };

        ws.onmessage = (event) => {
            console.log('incoming websocket event: ', event);

            const audioUrl = URL.createObjectURL(
                new Blob([event.data], { type: 'audio/mp3' })
            );

            console.log('Audio URL: ', audioUrl);

            setAudioUrl(audioUrl);
        };

        ws.onclose = () => {
            console.log('WebSocket closed');
            setWs(null);
        };

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, []);

    // useEffect(() => {
    //     // Function to initialize microphone access and set up audio stream
    //     const initializeMicrophone = async () => {
    //         try {
    //             const stream = await navigator.mediaDevices.getUserMedia({
    //                 audio: true,
    //             });
    //             setAudioStream(stream);
    //         } catch (error) {
    //             console.error('Error accessing microphone:', error);
    //         }
    //     };

    //     initializeMicrophone();

    //     // Clean-up function to stop audio stream when component unmounts
    //     return () => {
    //         if (audioStream) {
    //             audioStream.getTracks().forEach((track) => track.stop());
    //         }
    //     };
    // }, []);

    // useEffect(() => {
    //     // Function to send raw audio data to server via WebSocket
    //     const sendDataToServer = () => {
    //         if (ws && audioStream) {
    //             const audioChunks: Blob[] = [];
    //             const mediaRecorder = new MediaRecorder(audioStream);

    //             mediaRecorder.ondataavailable = (e) => {
    //                 if (e.data.size > 0) {
    //                     audioChunks.push(e.data);
    //                 }
    //             };

    //             mediaRecorder.onstop = () => {
    //                 const audioBlob = new Blob(audioChunks, {
    //                     type: 'audio/wav',
    //                 });
    //                 ws.send(audioBlob);
    //                 setLoading(false);
    //             };

    //             mediaRecorder.start();
    //         }
    //     };

    //     sendDataToServer();

    //     // Clean-up function to stop sending data when component unmounts
    //     return () => {
    //         if (audioStream) {
    //             audioStream.getTracks().forEach((track) => track.stop());
    //         }
    //     };
    // }, [ws, audioStream]);

    useEffect(() => {
        // Function to play the translated speech response
        setAudioUrl(audioUrl);

        if (audioUrl) {
            const audioElement = new Audio(audioUrl);
            audioElement.play();
        }

        setLoading(false);
    }, [audioUrl]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (incomingSentence) {
            setLoading(true);

            const translateRequest: TranslationRequest = {
                inputMode: 'text',
                incomingSentence,
                fromLanguageCode,
                toLanguageCode,
            };

            if (ws) {
                ws.send(JSON.stringify(translateRequest));
            }
        } else {
            setTranslation('Sentence must be entered.');
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <div className="App">
                <header className="App-header">
                    <form onSubmit={handleSubmit}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: 500,
                                marginTop: 10,
                            }}
                        >
                            <div>Select languages</div>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: 5,
                                }}
                            >
                                <Autocomplete
                                    sx={{ width: '40%' }}
                                    {...defaultPropsFromLanguage}
                                    id="from-language"
                                    includeInputInList
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="From language"
                                            variant="standard"
                                        />
                                    )}
                                    onChange={(event, newValue) => {
                                        setFromLanguageCode(newValue?.code);
                                    }}
                                />
                                <Autocomplete
                                    sx={{ width: '40%' }}
                                    {...defaultPropsToLanguage}
                                    id="to-language"
                                    includeInputInList
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="To language"
                                            variant="standard"
                                        />
                                    )}
                                    onChange={(event, newValue) => {
                                        setToLanguageCode(newValue?.code);
                                    }}
                                />
                            </Box>
                            <ToggleButtonGroup
                                color="primary"
                                style={{
                                    marginTop: '60px',
                                    marginLeft: '50px',
                                }}
                                value={alignment}
                                exclusive
                                onChange={handleChange}
                                aria-label="Platform"
                            >
                                <ToggleButton value="web">
                                    Speak to translate
                                </ToggleButton>
                                <ToggleButton value="android">
                                    Type text to translate
                                </ToggleButton>
                            </ToggleButtonGroup>
                            <Textarea
                                aria-label="minimum height"
                                minRows={3}
                                placeholder="Sentence to translate..."
                                style={{
                                    height: 30,
                                    width: 500,
                                    marginTop: 80,
                                }}
                                onChange={(e) =>
                                    setIncomingSentence(e.target.value)
                                }
                            />
                            <br />
                            <Button
                                style={{ marginTop: 50 }}
                                color="primary"
                                type="submit"
                            >
                                Translate
                            </Button>

                            {loading ? (
                                <CircularProgress
                                    color="secondary"
                                    size={40}
                                    thickness={5}
                                    style={{ marginTop: 100 }}
                                />
                            ) : (
                                <>
                                    <p
                                        style={{
                                            fontSize: 17,
                                            marginTop: 100,
                                            maxWidth: 800,
                                        }}
                                    >
                                        {translation}
                                    </p>
                                    <p>
                                        {audioUrl && (
                                            <audio
                                                ref={audioRef}
                                                controls
                                                autoPlay
                                            >
                                                <source
                                                    src={audioUrl}
                                                    type="audio/mp3"
                                                />
                                                Your browser does not support
                                                the audio element.
                                            </audio>
                                        )}
                                    </p>
                                </>
                            )}
                        </Box>
                    </form>
                </header>
            </div>
        </ThemeProvider>
    );
}

export default App;
