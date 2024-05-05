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

    const handleMouseEnter = () => {
        const audio = new Audio(hoverSound);
        audioRefs.current.push(audio);
        audio.play();
    };

    const handleMouseDown = (index: number) => {
        setSelectedImage(index); 
        const audio = new Audio(pressSound);
        audioRefs.current.push(audio);
        audio.play();
        window.addEventListener('mouseup', handleGlobalMouseUp);
    };

    const handleGlobalMouseUp = () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
    };

    useEffect(() => {
        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, []);

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
                            onMouseDown={() => handleMouseDown(absoluteIndex)}
                            className={selectedImage === absoluteIndex ? "selected" : ""}
                        />
                    );
                })}
            </div>
        </>
    );
}

export default LegendGallery;
