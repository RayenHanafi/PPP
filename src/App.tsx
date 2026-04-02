import { Landing } from './pages/Landing';
import { BecomeContributor } from './pages/BecomeContributor';
import { Navigate, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/become-contributor" element={<BecomeContributor />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
