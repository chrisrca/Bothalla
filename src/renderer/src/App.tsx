import './App.css';
import backgroundImage from '../../../resources/Background.png';
import CloseButton from './components/CloseButton';
import Legends from './components/Legends';

function App(): JSX.Element {
  return (
    <div style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      width: '100vw',
      height: '100vh'
    }}>
      <div id="titleBar" className="drag-region"></div>
      <CloseButton></CloseButton>
      <Legends></Legends>
    </div>
  );
}

export default App;
