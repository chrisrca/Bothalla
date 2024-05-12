import { useRef, useState } from 'react';
import defaultState from '../../../../resources/Mode_Default.png';
import hoverState from '../../../../resources/Mode_Hover.png';
import clickState from '../../../../resources/Mode_Press.png';
import hoverSound from '../../../../resources/hover.mp3';
import Mode from './Mode';

function RunButton(): JSX.Element {
    const modes = ["Leveling up characters to level 25",
                   "Leveling up characters closest to next level",
                   "Gold farming",
                   "Leveling up one character",
                   "Leveling up characters with lowest level"
                  ];
    const [buttonStyle, setButtonStyle] = useState({
        backgroundImage: `url(${defaultState})`
    });
    const [modeIndex, setModeIndex] = useState(3);

    const audioRefs = useRef<HTMLAudioElement[]>([]);

    const handleMouseEnter = () => {
        setButtonStyle({ backgroundImage: `url(${hoverState})` });
        const audio = new Audio(hoverSound);
        audioRefs.current.push(audio);
        audio.play();
    };

    const handleMouseLeave = () => {
        setButtonStyle({ backgroundImage: `url(${defaultState})` });
    };

    const handleMouseDown = () => {
        setButtonStyle({ backgroundImage: `url(${clickState})` });
    };

    const handleMouseUp = () => {
        setButtonStyle({ backgroundImage: `url(${defaultState})` });
        setModeIndex((prevIndex) => (prevIndex + 1) % 5);
        window.electron.ipcRenderer.send('mode', modes[(modeIndex + 1) % 5]);
    };

    return (
        <>
            <Mode index={modeIndex}></Mode>
            <button
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                style={{
                    ...buttonStyle,
                    position: 'absolute',
                    left: '10px',
                    top: '98px',
                    width: '148px',
                    height: '42px',
                    border: 'none',
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
        </>
    );
}

export default RunButton;
