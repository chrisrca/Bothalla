import './App.css';
import CloseButton from './components/CloseButton';
import Legends from './components/Legends';
import RunButton from './components/RunButton';
import Debug from './components/Debug';
import Background from './components/Background';
import userIcon from '../../../resources/User_Icon.png';
import { useEffect, useState } from 'react';

function App(): JSX.Element {
  const [img, setImg] = useState("")

  useEffect(() => {
    window.electron.ipcRenderer.on('icon', (_event, image) => {setImg(image); console.log(image)});

    return () => {
        window.electron.ipcRenderer.removeAllListeners('icon');
    };
}, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh'
    }}>
      <Background></Background>
      <div id="titleBar" className="drag-region"></div>
      <CloseButton></CloseButton>
      <Legends></Legends>
      <RunButton></RunButton>
      <Debug></Debug>
      
        <img 
          className='usericon'
          src={userIcon} 
          style={{
            position: 'absolute',
            left: '20px',
            bottom: '20px',
            width: '84px',
            height: '84px',
            borderRadius: '18px',
            userSelect: 'none'
          }} 
        />
        {img && <img 
          className='usericon'
          src={img} 
          style={{
            position: 'absolute',
            left: '20px',
            bottom: '20px',
            width: '84px',
            height: '84px',
            borderRadius: '18px',
            userSelect: 'none'
          }} 
        />}

    </div>
  );
}

export default App;
