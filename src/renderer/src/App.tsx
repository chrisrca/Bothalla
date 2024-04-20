import { useEffect, useState } from 'react';
import './App.css';
import backgroundImage from '../../../resources/Background.png';
import CloseButton from './components/CloseButton';

function App(): JSX.Element {
  // State to hold the list of image URLs
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    // Function to handle the reception of URLs
    const handleReceiveUrls = (_event, urls: string[]) => {
      console.log('Received URLs:', urls);
      setImageUrls(urls);
    };

    // Send the request for URLs to the main process
    window.electron.ipcRenderer.send('request-urls');
    window.electron.ipcRenderer.on('response-urls', handleReceiveUrls);

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      window.electron.ipcRenderer.removeAllListeners('response-urls');
    };
  }, []);

  return (
    <div style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      width: '100vw',
      height: '100vh'
    }}>
      <CloseButton></CloseButton>
      <div id="titleBar" className="drag-region"></div>
      <div className="image-gallery"> {
        imageUrls.map((url, index) => (
          <img key={index} src={url} alt={`Fetched image ${index + 1}`} style={{width: '70px'}}/>
        ))
      }
      </div>
    </div>
  );
}

export default App;
