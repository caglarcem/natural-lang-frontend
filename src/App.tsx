import { FormEvent, useState, useEffect, useRef } from 'react';
import './App.css';
import { TextField, Button, Autocomplete, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

interface Language {
    code: string;
    name: string;
}

interface TranslateRequest {
    incomingSentence: string | undefined;
    fromLanguageCode: string | undefined;
    toLanguageCode: string | undefined;
}

function App() {
    const [loading, setLoading] = useState(false);

    // Translation
    const [incomingSentence, setIncomingSentence] = useState<string>();
    const [fromLanguageCode, setFromLanguageCode] = useState<string>();
    const [toLanguageCode, setToLanguageCode] = useState<string>();
    const [translation, setTranslation] = useState<string>();
    const [languages, setLanguages] = useState<Language[]>([]);

    // Audio
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);

    const defaultPropsFromLanguage = {
        options: languages || [],
        getOptionLabel: (option: Language) => option.name,
    };

    const defaultPropsToLanguage = {
        options: languages || [],
        getOptionLabel: (option: Language) => option.name,
    };

    useEffect(() => {
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

    useEffect(() => {
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

            const translateRequest: TranslateRequest = {
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
                            <div>
                                Select languages and enter text to translate.
                            </div>
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
                            <TextField
                                variant="standard"
                                label="Sentence to translate..."
                                style={{
                                    height: 30,
                                    width: 500,
                                    marginTop: 40,
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
