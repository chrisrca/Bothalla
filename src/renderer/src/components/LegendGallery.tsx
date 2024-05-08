import { useEffect, useRef, useState } from 'react';
import hoverSound from '../../../../resources/hover.mp3';
import pressSound from '../../../../resources/press.mp3';
import legendBackground from '../../../../resources/Portrait_Background.png';

interface ButtonProps {
    imageUrls: string[];
    imageNames: string[];
    imageAlts: string[];
    currentIndex: number;
}

function LegendGallery({ imageUrls, imageNames, imageAlts, currentIndex }: ButtonProps): JSX.Element {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const audioRefs = useRef<HTMLAudioElement[]>([]);

    useEffect(() => {
        if (!selectedImage) {
            const handleReceiveSelected = (_event, selected: string) => {
                console.log(selected)
                const foundIndex = imageAlts.findIndex(alt => alt.includes(selected));
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

    const handleMouseDown = (index: number) => {
        console.log(imageAlts[index], imageNames[index]);
        setSelectedImage(index); 
        const audio = new Audio(pressSound);
        audioRefs.current.push(audio);
        audio.play();
        window.addEventListener('mouseup', handleGlobalMouseUp);
        window.electron.ipcRenderer.send('legend', imageAlts[index]);
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
                        <div key={index} 
                            className={`image-container ${selectedImage === absoluteIndex ? "selected" : ""}`}
                            onMouseEnter={handleMouseEnter}
                            onMouseDown={() => handleMouseDown(absoluteIndex)}
                            >
                            <img
                                src={legendBackground}
                                className="static-image"
                            />
                            <img
                                className="dynamic-image"
                                src={url}
                            />
                        </div>
                    );
                })}
            </div>
        </>
    );
}
export default LegendGallery;
