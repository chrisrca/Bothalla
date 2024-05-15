import { useRef, useState } from 'react';
import welcome from '../../../../resources/Welcome.png';
import defaultState from '../../../../resources/CloseInfo_Default.png';
import hoverState from '../../../../resources/CloseInfo_Hover.png';
import pressState from '../../../../resources/CloseInfo_Press.png';
import hoverSound from '../../../../resources/hover.mp3';

function Welcome(): JSX.Element {
    const [isVisible, setIsVisible] = useState(true);
    const [buttonStyle, setButtonStyle] = useState({
        backgroundImage: `url(${defaultState})`
    });
    const audioRefs = useRef<HTMLAudioElement[]>([]);

    const handleOkClick = () => {
        setIsVisible(false);
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

    const handleMouseDown = () => {
        setButtonStyle({ backgroundImage: `url(${pressState})` });
    };

    const handleMouseUp = () => {
        setButtonStyle({ backgroundImage: `url(${defaultState})` });
    };

    return (
        <>
            {isVisible &&                     
                    <button 
                        onClick={handleOkClick} 
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        style={{
                            ...buttonStyle,
                            position: 'absolute',
                            zIndex: '1003',
                            top: '69%',
                            right: '50%',
                            transform: 'translateX(50%) scale(0.8)',
                            width: '303px',
                            height: '57px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            cursor: 'pointer',
                        }}>
                    </button>}
            {isVisible && (
                <>
                    <div style={{
                        zIndex: '1002',
                        position: 'absolute',
                        backgroundImage: `url(${welcome})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        width: '914px',
                        height: '506px',
                        transform: 'scale(0.95)',
                    }}
                    ></div>
                    <div style={{
                        zIndex: '1001',
                        position: 'absolute',
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        borderRadius: '6.3px',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        width: '100vw',
                        height: '100vh'
                    }}></div>
                </>
            )}
        </>
    );
}

export default Welcome;
