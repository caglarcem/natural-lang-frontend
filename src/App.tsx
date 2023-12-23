import { FormEvent, useState } from 'react';
import './App.css';
import { TextField, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

function App() {
    const [question, setQuestion] = useState<string>();
    const [answer, setAnswer] = useState<string>();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        console.log(question);

        callAPI();

        console.log(answer);

        // TODO send to openai: ask(question)
    };

    const callAPI = () => {
        fetch('http://localhost:9000/openApi')
            .then((res) => res.text())
            .then((answer) => setAnswer(answer));
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
                    <p style={{ fontSize: 17, marginTop: 50 }}>{answer}</p>
                </header>
            </div>
        </ThemeProvider>
    );
}

export default App;
