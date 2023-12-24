import { FormEvent, useState } from 'react';
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

function App() {
    const [question, setQuestion] = useState<string>();
    const [answer, setAnswer] = useState<string>();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        console.log(question);

        if (question) {
            setLoading(true);

            console.log(`set loading: `, true);

            callAPI(question);
        } else {
            setAnswer('Question must be entered.');
        }

        console.log(answer);
    };

    const callAPI = (question: string) => {
        fetch(`http://localhost:9000/openApi?question=${question}`)
            .then((res) => res.text())
            .then((answer) => {
                setLoading(false);

                return setAnswer(answer);
            });
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <div className="App">
                <header className="App-header">
                    <p>Ask a question about Great Gatsby.</p>
                    <form
                        onSubmit={(e) => {
                            handleSubmit(e);
                        }}
                    >
                        <TextField
                            variant="standard"
                            label="My question is..."
                            style={{ height: 30, width: 400 }}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                        <br />
                        <Button
                            style={{ marginTop: 50 }}
                            color="primary"
                            type="submit"
                        >
                            Send
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
                        <p
                            style={{
                                fontSize: 17,
                                marginTop: 100,
                                maxWidth: 800,
                            }}
                        >
                            {answer}
                        </p>
                    )}
                </header>
            </div>
        </ThemeProvider>
    );
}

export default App;
