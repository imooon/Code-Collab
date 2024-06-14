import Header from './components/Header';
import { Outlet } from 'react-router-dom';
import Auth from './utils/auth';
import { useState } from 'react';

function App() {
  const [loggedIn, setLoggedIn] = useState(Auth.loggedIn()); // Lifting State here so that App renders Header and also Outlet, but Outlet and Header cannot send up to App

  return (
    <div>
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      {/* The app pages will swap in and out of the Outlet and the header will stay on every page */}
      <main><Outlet context={[loggedIn, setLoggedIn]} /></main>
    </div>
  );
}

export default App;
