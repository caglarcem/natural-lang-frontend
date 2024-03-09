import { FormEvent, useState, useEffect } from 'react';
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

function App() {
    const [incomingSentence, setIncomingSentence] = useState<string>();
    const [fromLanguageCode, setFromLanguageCode] = useState<string>();
    const [toLanguageCode, setToLanguageCode] = useState<string>();
    const [translation, setTranslation] = useState<string>();
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(false);

    const defaultPropsFromLanguage = {
        options: languages || [],
        getOptionLabel: (option: Language) => option.name,
    };

    const defaultPropsToLanguage = {
        options: languages || [],
        getOptionLabel: (option: Language) => option.name,
    };

    useEffect(() => {
        const languages = localStorage.getItem('cachedLanguages');

        if (languages) {
            console.log('Fetch data from cache');
            setSupportedLanguagesFromCache(languages);
        } else {
            console.log('Fetch data from API');
            // Fetch data from API
            setSupportedLanguagesFromAPI();
        }
    }, []);

    useEffect(() => {}, [languages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        console.log(incomingSentence);

        if (incomingSentence) {
            setLoading(true);

            callTranslateAPI(
                incomingSentence,
                fromLanguageCode,
                toLanguageCode
            );
        } else {
            setTranslation('Sentence must be entered.');
        }

        console.log(translation);
    };

    const setSupportedLanguagesFromCache = (cachedLanguages: string) => {
        setLanguages(JSON.parse(cachedLanguages));

        setLoading(false);
    };

    const setSupportedLanguagesFromAPI = () => {
        fetch(`http://localhost:9000/translation/languages`)
            .then((res) => res.json())
            .then((languages: Language[]) => {
                console.log('Languages: ', languages);

                // Cache the result in localStorage
                localStorage.setItem(
                    'cachedLanguages',
                    JSON.stringify(languages)
                );

                setLanguages(languages);

                setLoading(false);
            });
    };

    const callTranslateAPI = (
        incomingSentence: string,
        fromLanguageCode?: string,
        toLanguageCode?: string
    ) => {
        fetch(
            `http://localhost:9000/translation/translateText?incomingSentence=${incomingSentence}&fromLanguageCode=${fromLanguageCode}&toLanguageCode=${toLanguageCode}`
        )
            .then((res) => res.text())
            .then((translation) => {
                setLoading(false);

                return setTranslation(translation);
            });
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <div className="App">
                <header className="App-header">
                    <form
                        onSubmit={(e) => {
                            handleSubmit(e);
                        }}
                    >
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
