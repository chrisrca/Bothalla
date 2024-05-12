import './App.css';
import CloseButton from './components/CloseButton';
import Legends from './components/Legends';
import RunButton from './components/RunButton';
import Debug from './components/Debug';
import Background from './components/Background';
import UserIcon from './components/UserIcon';
import ModeButton from './components/ModeButton';

function App(): JSX.Element {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Background></Background>
      <div id="titleBar" className="drag-region"></div>
      <CloseButton></CloseButton>
      <Legends></Legends>
      <RunButton></RunButton>
      <ModeButton></ModeButton>
      <Debug></Debug>
      <UserIcon></UserIcon>
    </div>
  );
}

export default App;
