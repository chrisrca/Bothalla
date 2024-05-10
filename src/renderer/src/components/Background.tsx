import { useEffect, useRef, useState } from 'react';
import backgroundImage from '../../../../resources/Background.png';
import backgroundOverlay from '../../../../resources/Background_Overlay.png';
import nameBar from '../../../../resources/Namebar.png';

function Background(): JSX.Element {
    const [name, setName] = useState("");

    const textRef = useRef<HTMLDivElement>(null);
    const [nameWidth, setNameWidth] = useState(0);

    useEffect(() => {
        window.electron.ipcRenderer.send('request-name');
        window.electron.ipcRenderer.on('response-request-name', (_event, name) => {setName(name)});

        return () => {
            window.electron.ipcRenderer.removeAllListeners('response-request-name');
        };
    }, []);

    useEffect(() => {
        if (textRef && textRef.current) {
            setNameWidth(textRef.current.offsetWidth);
        }
    }, [name]);

    return (
        <>
            <div style={{
                position: 'absolute',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                width: '100vw',
                height: '100vh'
            }}
            ></div>
            <div style={{
                position: 'absolute',
                backgroundImage: `url(${nameBar})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                right: `calc(50% - ${nameWidth - 330}px)`, // Centering the name bar
                width: '100vw',
                height: '100vh'
            }}
            ></div>
            <div style={{
                position: 'absolute',
                backgroundImage: `url(${backgroundOverlay})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                width: '100vw',
                height: '100vh'
            }}
            ></div>
            <div ref={textRef} style={{
                fontFamily: "'Brawlhalla', sans-serif",
                position: 'absolute',
                left: '56px',
                top: '17px',
                fontSize: '20px',
                color: 'white',
            }}>{name}</div>
        </>
    );
}

export default Background;
