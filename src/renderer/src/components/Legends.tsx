import { useEffect, useState } from 'react';
import '../assets/legends.css';
import RightButton from './RightButton';
import LeftButton from './LeftButton';
import LegendGallery from './LegendGallery';

function Legends(): JSX.Element {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [imageNames, setImageNames] = useState<string[]>([]);
    const [imageAlts, setImageAlts] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [moveRight, setMoveRight] = useState<boolean>(true);
    const [moveLeft, setMoveLeft] = useState<boolean>(true);

    useEffect(() => {
        const handleReceiveUrls = (_event, urls: string[], names: string[], alts: string[]) => {
            setImageUrls(urls);
            setImageNames(names);
            setImageAlts(alts);
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
            <LegendGallery imageUrls={imageUrls} imageNames={imageNames} imageAlts={imageAlts} currentIndex={currentIndex}/>
            <RightButton moveRight={setMoveRight} currentIndex={currentIndex} totalGrids={totalGrids}/>
            <LeftButton moveLeft={setMoveLeft} currentIndex={currentIndex}/>
        </>
    );
}

export default Legends;