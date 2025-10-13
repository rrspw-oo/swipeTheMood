import SwipeInterface from '../pages/SwipeInterface';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import '../styles/globals.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <SwipeInterface />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;