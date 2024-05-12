import { useState, useRef, useEffect } from 'react';
import defaultState from '../../../../resources/Right_Default.png';
import hoverState from '../../../../resources/Right_Hover.png';
import disabledState from '../../../../resources/Right_Disabled.png';
import hoverSound from '../../../../resources/hover.mp3';
import pressSound from '../../../../resources/press.mp3';

interface ButtonProps {
    moveRight: React.Dispatch<React.SetStateAction<boolean>>;
    currentIndex: number;
    totalGrids: number;
}

function RightButton({ moveRight, currentIndex, totalGrids }: ButtonProps): JSX.Element {
    const [buttonStyle, setButtonStyle] = useState({
        backgroundImage: `url(${currentIndex < totalGrids - 1 ? defaultState : disabledState})`,
        transform: 'scale(0.61)'
    });

    const audioRefs = useRef<HTMLAudioElement[]>([]);

    useEffect(() => {
        setButtonStyle({
            backgroundImage: `url(${currentIndex < totalGrids - 1 ? defaultState : disabledState})`,
            transform: 'scale(0.61)'
        });
    }, [currentIndex, totalGrids]);

    const handlePress = () => {
        if (currentIndex < totalGrids - 1) {
            moveRight(true);
        }
    };

    const handleMouseEnter = () => {
        if (currentIndex < totalGrids - 1) {
            setButtonStyle(prevStyle => ({
                ...prevStyle,
                backgroundImage: `url(${hoverState})`
            }));
            const audio = new Audio(hoverSound);
            audioRefs.current.push(audio);
            audio.play();
        }
    };

    const handleMouseLeave = () => {
        setButtonStyle(prevStyle => ({
            ...prevStyle,
            backgroundImage: `url(${currentIndex < totalGrids - 1 ? defaultState : disabledState})`
        }));
    };

    const handleGlobalMouseUp = () => {
        setButtonStyle(prevStyle => ({
            ...prevStyle,
            transform: 'scale(0.61)',
            backgroundImage: `url(${currentIndex < totalGrids - 1 ? defaultState : disabledState})`
        }));
        window.removeEventListener('mouseup', handleGlobalMouseUp);
    };

    const handleMouseDown = () => {
        if (currentIndex < totalGrids - 1) {
            setButtonStyle(prevStyle => ({
                ...prevStyle,
                transform: 'scale(0.54)',
                backgroundImage: `url(${hoverState})`
            }));
            const audio = new Audio(pressSound);
            audioRefs.current.push(audio);
            audio.play();
            window.addEventListener('mouseup', handleGlobalMouseUp);
        }
    };

    const handleMouseUp = () => {
        setButtonStyle(prevStyle => ({
            ...prevStyle,
            transform: 'scale(0.61)',
            backgroundImage: `url(${currentIndex < totalGrids - 1 ? defaultState : disabledState})`
        }));
    };

    useEffect(() => {
        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, []);

    return (
        <button
            className="triangle-button"
            onClick={handlePress}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            style={{ ...buttonStyle, 
                position: 'absolute', 
                left: '202px', 
                top: '310px', 
                width: '46px', 
                height: '44px', 
                border: 'none', 
                cursor: 'pointer', 
                clipPath: 'polygon(8% 0%, 100% 50%, 8% 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                textAlign: 'center', 
                padding: 0, 
                backgroundColor: 'black', 
                backgroundSize: 'contain', 
                backgroundRepeat: 'no-repeat' 
            }}
            disabled={currentIndex >= totalGrids - 1}
        ></button>
    );
}

export default RightButton;
