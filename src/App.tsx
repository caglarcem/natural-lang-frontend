import { FormEvent, useState, useEffect } from 'react';
import './App.css';
import { TextField, Button } from '@mui/material';
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
    const [languageCode, setLanguageCode] = useState<string>();
    const [translation, setTranslation] = useState<string>();
    const [languages, setLanguages] = useState<Language[]>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        callSupportedLanguagesAPI();
    }, []);

    useEffect(() => {}, [languages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        console.log(incomingSentence);

        console.log(languageCode);

        if (incomingSentence) {
            setLoading(true);

            callTranslateAnswerAPI(incomingSentence, languageCode ?? 'TR');
        } else {
            setTranslation('Question must be entered.');
        }

        console.log(translation);
    };

    const callSupportedLanguagesAPI = () => {
        fetch(`http://localhost:9000/translation/languages`)
            .then((res) => res.json())
            .then((languages: Language[]) => {
                setLoading(false);

                console.log('Languages: ', languages);

                setLanguages(languages);
            });
    };

    const callTranslateAnswerAPI = (
        incomingSentence: string,
        languageCode?: string
    ) => {
        fetch(
            `http://localhost:9000/translation/answer?question=${incomingSentence}&languageCode=${languageCode}`
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
                    <p>Select languages and enter text to translate.</p>
                    <form
                        onSubmit={(e) => {
                            handleSubmit(e);
                        }}
                    >
                        <TextField
                            variant="standard"
                            label="English sentence..."
                            style={{ height: 30, width: 400 }}
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
                    </form>
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
                            <p
                                style={{
                                    fontSize: 17,
                                    marginTop: 100,
                                    maxWidth: 800,
                                }}
                            >
                                {languageCode}
                            </p>
                        </>
                    )}
                </header>
            </div>
        </ThemeProvider>
    );
}

export default App;
