import './App.css';
import { useState, useEffect } from 'react';
import backgroundImage from '../../../resources/Loading_Splash.png';

function App(): JSX.Element {
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowImage(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showImage && (
        <div
          style={{
            position: 'absolute',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '1000px',
            height: '731px',
            transform: 'scale(0.25)',
          }}
        ></div>
      )}
    </>
  );
}

export default App;
