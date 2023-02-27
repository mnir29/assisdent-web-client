import './App.css';
import {Sidebar} from './components/Sidebar';
import {ShowView} from "./components/View/ShowView";
import {MainView} from "./components/MainView";
import {ApplicationBar} from "./components/ApplicationBar";
import { Routes, Route } from 'react-router-dom';
import LoginForm from './components/Auth/LoginForm';

function App() {
  return (
      <div className="App w-full flex">
          <Routes>
              <Route path="/" element={<LoginForm/>} />
              <Route
                  path="*"
                  element={
                      <>
                          <Sidebar />
                          <MainView>
                              <ApplicationBar />
                              <ShowView />
                          </MainView>
                      </>
                  }
              />
          </Routes>
      </div>
  );
}

export default App;
