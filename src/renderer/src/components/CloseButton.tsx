import { useState } from 'react'
import defaultState from '../../../../resources/Close_Default.png';
import hoverState from '../../../../resources/Close_Hover.png';
import clickState from '../../../../resources/Close_Press.png';

function CloseButton(): JSX.Element {
    const [buttonStyle, setButtonStyle] = useState({
        backgroundImage: `url(${defaultState})`
    });

    const handleClose = () => {
        window.electron.ipcRenderer.send('minimize-app');
      };

    const handleMouseEnter = () => setButtonStyle({ backgroundImage: `url(${hoverState})` });
    const handleMouseLeave = () => setButtonStyle({ backgroundImage: `url(${defaultState})` });
    const handleMouseDown = () => setButtonStyle({ backgroundImage: `url(${clickState})` });
    const handleMouseUp = () => setButtonStyle({ backgroundImage: `url(${defaultState})` });

    return (
        <button
            className="triangle-button"
            onClick={handleClose}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            style={{
                ...buttonStyle,
                position: 'absolute',
                right: '5px',
                top: '5px',
                width: '44px',
                height: '40px',
                border: 'none',
                cursor: 'pointer',
                clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: 0,
                overflow: 'hidden',
                backgroundColor: 'transparent',
                backgroundSize: 'cover',
            }}
        ></button>
    );
}

export default CloseButton