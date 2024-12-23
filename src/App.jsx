import { ThemeProvider } from './context/ThemeContext';
import NodeDashboard from './components/NodeDashboard';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <NodeDashboard />
      </div>
    </ThemeProvider>
  );
}

export default App;