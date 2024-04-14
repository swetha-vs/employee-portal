import './App.css';
import {Route, Routes } from "react-router-dom"
import { getAuth} from 'firebase/auth';
import AuthUser from './pages/login';
import FormUser from './pages/userList';
import DetailsUser from './pages/userDetails';
import ProtectedRoutes from './ProtectedRoutes/ProtectedRoutes';
import AuthProvider from './pages/AuthContext';


function App() {
  const auth = getAuth();

  return (
    <AuthProvider>
      <Routes>
        <Route path='/login' element={<AuthUser />} />
         <Route path='/' element={<ProtectedRoutes auth={auth} />} >
          <Route path='/' element={<FormUser />} />
          <Route path='/DetailsUser/:id' element={<DetailsUser />} />
         </Route>
      </Routes>
    </AuthProvider>

  );
}

export default App;
