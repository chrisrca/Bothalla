import { useRef, useEffect } from 'react';
import hoverSound from '../../../../resources/hover.mp3';
import pressSound from '../../../../resources/press.mp3';

interface ButtonProps {
    imageUrls: string[];
    currentIndex: number;
}

function LegendGallery({ imageUrls, currentIndex }: ButtonProps): JSX.Element {
    const audioRefs = useRef<HTMLAudioElement[]>([]);

    const handleMouseEnter = () => {
        const audio = new Audio(hoverSound);
        audioRefs.current.push(audio);
        audio.play();
        console.log('hi');
    };

    const handleGlobalMouseUp = () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
    };

    const handleMouseDown = () => {
        const audio = new Audio(pressSound);
        audioRefs.current.push(audio);
        audio.play();
        window.addEventListener('mouseup', handleGlobalMouseUp);
    };

    useEffect(() => {
        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, []);

    return (
<>
            <div className="image-gallery">
                {imageUrls.slice(currentIndex * 12 * 3, currentIndex * 12 * 3 + 12 * 3).map((url, index) => (
                    <img
                        key={index}
                        src={url}
                        alt={`Fetched image ${currentIndex * 12 * 3 + index + 1}`}
                        onMouseEnter={handleMouseEnter}
                        onMouseDown={handleMouseDown}
                    />
                ))}
            </div>
        </>
    );
}

export default LegendGallery;
