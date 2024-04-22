import './App.css';
import backgroundImage from '../../../resources/Background.png';
import backgroundButtonImage from '../../../resources/Button_Background.png';
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
      <div style={{
        backgroundImage: `url(${backgroundButtonImage})`,
        position: 'absolute',
        top: '16px',
        left: '350px',
        width: '253px',
        height: '52px',
        transform: 'scale(0.71)'
      }}>
      </div>
      <Legends></Legends>

    </div>
  );
}

export default App;
