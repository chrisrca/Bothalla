import { useEffect, useState } from 'react';
import '../assets/legends.css';
import RightButton from './RightButton';
import LeftButton from './LeftButton';
import LegendGallery from './LegendGallery';
import backgroundButtonImage from '../../../../resources/Button_Background.png';

function Legends(): JSX.Element {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [imageAlts, setImageAlts] = useState<string[]>([]);
    const [poseUrls, setPoseUrls] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [moveRight, setMoveRight] = useState<boolean>(true);
    const [moveLeft, setMoveLeft] = useState<boolean>(true);

    useEffect(() => {
        const handleReceiveUrls = (_event, urls: string[], alts: string[], imgs: string[]) => {
            setImageUrls(urls);
            setImageAlts(alts);
            setPoseUrls(imgs);
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

    useEffect(() => {
        if (moveRight) {
            handleMoveRight();
            setMoveRight(false);
        }
    }, [moveRight]);

    useEffect(() => {
        if (moveLeft) {
            handleMoveLeft();
            setMoveLeft(false);
        }
    }, [moveLeft]);

    const totalGrids = Math.ceil(imageUrls.length / (12 * 3));

    return (
        <>
            <div style={{
                backgroundImage: `url(${backgroundButtonImage})`,
                position: 'absolute',
                top: '306px',
                left: '142px',
                width: '253px',
                height: '52px',
                transform: 'scale(0.71)'
            }}>
            </div>
            <LegendGallery imageUrls={imageUrls} imageAlts={imageAlts} poseUrls={poseUrls} currentIndex={currentIndex}/>
            <RightButton moveRight={setMoveRight} currentIndex={currentIndex} totalGrids={totalGrids}/>
            <LeftButton moveLeft={setMoveLeft} currentIndex={currentIndex}/>
            <div style={{
                position: 'absolute',
                fontSize: '16px',
                textAlign: 'left',
                color: 'white',
                left: '244px',
                top: '322px',
                fontFamily: "'Brawlhalla', sans-serif",
            }}>{`${currentIndex + 1}/${totalGrids}`}</div>
        </>
    );
}

export default Legends;