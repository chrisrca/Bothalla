import { useState, useRef } from 'react';
import defaultState from '../../../../resources/Run_Default.png';
import hoverState from '../../../../resources/Run_Hover.png';
import clickState from '../../../../resources/Run_Press.png';
import hoverSound from '../../../../resources/hover.mp3';

function RunButton(): JSX.Element {
    const [buttonStyle, setButtonStyle] = useState({
        backgroundImage: `url(${defaultState})`
    });

    const audioRefs = useRef<HTMLAudioElement[]>([]);

    const handleRun = () => {
        window.electron.ipcRenderer.send('toggle-bot');
    };

    const handleMouseEnter = () => {
        setButtonStyle({ backgroundImage: `url(${hoverState})` });
        const audio = new Audio(hoverSound);
        audioRefs.current.push(audio);
        audio.play();
    };

    const handleMouseLeave = () => {
        setButtonStyle({ backgroundImage: `url(${defaultState})` });
    };

    const handleMouseDown = () => setButtonStyle({ backgroundImage: `url(${clickState})` });
    const handleMouseUp = () => setButtonStyle({ backgroundImage: `url(${defaultState})` });

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
                cursor: 'pointer',
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
        ></button>
    );
}

export default RunButton;
