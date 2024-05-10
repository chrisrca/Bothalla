import { useState, useEffect, useRef } from 'react';
import defaultState from '../../../../resources/Run_Default.png';
import hoverState from '../../../../resources/Run_Hover.png';
import clickState from '../../../../resources/Run_Press.png';
import defaultStateStop from '../../../../resources/Stop_Default.png';
import hoverStateStop from '../../../../resources/Stop_Hover.png';
import clickStateStop from '../../../../resources/Stop_Press.png';
import hoverSoundRun from '../../../../resources/hover.mp3';
import hoverSoundStop from '../../../../resources/hover.mp3';  // Assuming hover sound for stop

function RunButton(): JSX.Element {
    const [isRunning, setIsRunning] = useState(false);
    const [buttonStyle, setButtonStyle] = useState({
        backgroundImage: `url(${defaultState})`
    });
    const [disabled, setDisabled] = useState(false);

    const audioRefs = useRef<HTMLAudioElement[]>([]);

    const handleRun = () => {
        window.electron.ipcRenderer.send('toggle-bot');
        setIsRunning(!isRunning);
        setDisabled(true);
        setTimeout(() => setDisabled(false), 3000);
    };

    useEffect(() => {
        if (isRunning) {
            setButtonStyle({ backgroundImage: `url(${clickStateStop})` });
        } else {
            setButtonStyle({ backgroundImage: `url(${clickState})` });
        }
        // Ensure button is re-enabled after the timeout
        const timeout = setTimeout(() => {
            const currentState = isRunning ? defaultStateStop : defaultState;
            setButtonStyle({ backgroundImage: `url(${currentState})` });
        }, 10000);
        return () => clearTimeout(timeout);
    }, [isRunning]);

    const handleMouseEnter = () => {
        if (!disabled) {
            const currentState = isRunning ? hoverStateStop : hoverState;
            const hoverSound = isRunning ? hoverSoundStop : hoverSoundRun;
            setButtonStyle({ backgroundImage: `url(${currentState})` });
            const audio = new Audio(hoverSound);
            audioRefs.current.push(audio);
            audio.play();
        }
    };

    const handleMouseLeave = () => {
        if (!disabled) {
            const currentState = isRunning ? defaultStateStop : defaultState;
            setButtonStyle({ backgroundImage: `url(${currentState})` });
        }
    };

    const handleMouseDown = () => {
        if (!disabled) {
            const currentState = isRunning ? clickStateStop : clickState;
            setButtonStyle({ backgroundImage: `url(${currentState})` });
        }
    };

    const handleMouseUp = () => {
        if (!disabled) {
            const currentState = isRunning ? defaultStateStop : defaultState;
            setButtonStyle({ backgroundImage: `url(${currentState})` });
        }
    };

    return (
        <button
            className="run-button"
            onClick={handleRun}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            style={{
                ...buttonStyle,
                position: 'absolute',
                left: '10px',
                top: '54px',
                width: '148px',
                height: '42px',
                border: 'none',
                cursor: disabled ? '' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: 0,
                overflow: 'hidden',
                backgroundColor: 'transparent',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
            }}
            disabled={disabled}
        ></button>
    );
}

export default RunButton;
