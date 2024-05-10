import './App.css';
import CloseButton from './components/CloseButton';
import Legends from './components/Legends';
import RunButton from './components/RunButton';
import Debug from './components/Debug';
import Background from './components/Background';

function App(): JSX.Element {
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
    </div>
  );
}

export default App;
