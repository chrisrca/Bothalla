import { useEffect, useState } from 'react';
import '../assets/legends.css';

function Legends(): JSX.Element {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const handleReceiveUrls = (_event, urls: string[]) => {
            console.log('Received URLs:', urls);
            setImageUrls(urls);
        };

        window.electron.ipcRenderer.send('request-urls');
        window.electron.ipcRenderer.on('response-urls', handleReceiveUrls);

        return () => {
            window.electron.ipcRenderer.removeAllListeners('response-urls');
        };
    }, []);

    const handleMoveLeft = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleMoveRight = () => {
        const totalGrids = Math.ceil(imageUrls.length / (12 * 3));
        if (currentIndex < totalGrids - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    return (
        <>
            <div className="image-gallery">
                {imageUrls.slice(currentIndex * 12 * 3, currentIndex * 12 * 3 + 12 * 3).map((url, index) => (
                    <img key={index} src={url} alt={`Fetched image ${currentIndex * 12 * 3 + index + 1}`}/>
                ))}
            </div>
            <div className="navigation-buttons">
                <button onClick={handleMoveLeft} disabled={currentIndex === 0}>Left</button>
                <button onClick={handleMoveRight} disabled={currentIndex === Math.ceil(imageUrls.length / (12 * 3)) - 1}>Right</button>
            </div>
        </>
    );
}

export default Legends;
