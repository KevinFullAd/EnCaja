import AppRouter from '../routes/AppRouter';
import { ThemeProvider } from './ThemeProvider';

export default function AppProvider() {
    return (
        <ThemeProvider>
            <AppRouter />
        </ThemeProvider>
    );
}