import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';
import { FormProvider } from './context/FormContext';
import { ReportProvider } from './context/ReportContext';

function App() {
  return (
    <AuthProvider>
      <FormProvider>
        <ReportProvider>
          <AppRoutes />
        </ReportProvider>
      </FormProvider>
    </AuthProvider>
  );
}

export default App;