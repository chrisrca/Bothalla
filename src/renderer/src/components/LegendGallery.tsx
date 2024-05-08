import { useEffect, useRef, useState } from 'react';
import hoverSound from '../../../../resources/hover.mp3';
import pressSound from '../../../../resources/press.mp3';

interface ButtonProps {
    imageUrls: string[];
    currentIndex: number;
}

function LegendGallery({ imageUrls, currentIndex }: ButtonProps): JSX.Element {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const audioRefs = useRef<HTMLAudioElement[]>([]);

    useEffect(() => {
        if (!selectedImage) {
            const handleReceiveSelected = (_event, selected: string) => {
                console.log('Received selected:', selected);
                const foundIndex = imageUrls.findIndex(url => url.includes(`Portrait_${selected}.png`));
                if (foundIndex !== -1) {
                    setSelectedImage(foundIndex);
                }
            };
    
            window.electron.ipcRenderer.send('request-selected');
            window.electron.ipcRenderer.on('response-selected', handleReceiveSelected);
        }

        return () => {
            if (!selectedImage) { 
                window.electron.ipcRenderer.removeAllListeners('response-selected');
            }
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [imageUrls]);

    const handleMouseEnter = () => {
        const audio = new Audio(hoverSound);
        audioRefs.current.push(audio);
        audio.play();
    };

    const extractLegendName = (url: string): string => {
        const matches = url.match(/Portrait_(.*?)\.png/);
        return matches ? matches[1] : 'Unknown';
    };

    const handleMouseDown = (index: number, url: string) => {
        setSelectedImage(index); 
        const audio = new Audio(pressSound);
        audioRefs.current.push(audio);
        audio.play();
        window.addEventListener('mouseup', handleGlobalMouseUp);
        const legendName = extractLegendName(url);
        window.electron.ipcRenderer.send('legend', legendName);
    };

    const handleGlobalMouseUp = () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
    };

    return (
        <>
            <div className="image-gallery">
                {imageUrls.slice(currentIndex * 12 * 3, currentIndex * 12 * 3 + 12 * 3).map((url, index) => {
                    const absoluteIndex = currentIndex * 12 * 3 + index;
                    return (
                        <img
                            key={index}
                            src={url}
                            alt={`Fetched image ${absoluteIndex + 1}`}
                            onMouseEnter={handleMouseEnter}
                            onMouseDown={() => handleMouseDown(absoluteIndex, url)}
                            className={selectedImage === absoluteIndex ? "selected" : ""}
                        />
                    );
                })}
            </div>
        </>
    );
}

export default LegendGallery;
