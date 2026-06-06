import { useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { io } from "socket.io-client";
import SocketContext from "./context/SocketContext";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Home from "./pages/home.jsx";

//socket io
const socket = io(import.meta.env.VITE_API_ENDPOINT.split("/api")[0]);


function App() {
  //const [connected, setConnected] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { token } = user;

  useEffect(() => {
    if (token) {
      socket.connect();
    } else {
      socket.disconnect();
    }
  }, [token]);

  return (
    <div className="dark">
       <SocketContext.Provider value={socket}>
        <Router>
          <Routes>
          <Route
              exact
              path="/"
              element={
                token ? <Home socket={socket} /> : <Navigate to="/login" />
              }
            />
            <Route
              exact
              path="/login"
              element={!token ? <Login /> : <Navigate to="/" />}
            />
            <Route
              exact
              path="/register"
              element={!token ? <Register /> : <Navigate to="/" />}
            />
          </Routes>
        </Router>
      </SocketContext.Provider>
    </div>
  );
}

export default App;
