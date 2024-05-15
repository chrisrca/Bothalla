import './App.css';
import CloseButton from './components/CloseButton';
import Legends from './components/Legends';
import RunButton from './components/RunButton';
import Debug from './components/Debug';
import Background from './components/Background';
import UserIcon from './components/UserIcon';
import ModeButton from './components/ModeButton';
import Load from './Load';
import { useEffect, useState } from 'react';
import Welcome from './components/Welcome';

function App(): JSX.Element {
  const [loading, setLoading] = useState(true) 
  const [firstTime, setFirstTime] = useState(false) 

  useEffect(() => {
    window.electron.ipcRenderer.on('done-loading', (_event, _loaded) => {
        setLoading(false)
    });

    return () => {
        window.electron.ipcRenderer.removeAllListeners('done-loading');
    };
  }, []);

  useEffect(() => {
    const handleReceiveTime = (_event, time: number) => {
        console.log(time)
        if (!loading && time == 0) {
          setFirstTime(true)
          window.electron.ipcRenderer.send('set-not-first-time');
        }
    };

    window.electron.ipcRenderer.send('request-time');
    window.electron.ipcRenderer.on('response-time', handleReceiveTime);

    return () => {
        window.electron.ipcRenderer.removeAllListeners('response-time');
    };
}, [loading]);

  return (
    <>
    {loading && <><div id="splashScreen" className="drag-region-splash"></div><Load></Load></>}
    {!loading && <div style={{ width: '100vw', height: '100vh' }}>
        <Background></Background>
        <div id="titleBar" className="drag-region"></div>
        <CloseButton></CloseButton>
        <Legends></Legends>
        <RunButton></RunButton>
        <ModeButton></ModeButton>
        <Debug></Debug>
        <UserIcon></UserIcon>
      </div>}
    {!loading && firstTime && <Welcome></Welcome>}
    </>
  );
}

export default App;
