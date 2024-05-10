import { useEffect, useRef, useState } from 'react';
import backgroundImage from '../../../../resources/Background.png';
import backgroundOverlay from '../../../../resources/Background_Overlay.png';
import nameBar from '../../../../resources/Namebar.png';

function Background(): JSX.Element {
    const [name, setName] = useState("");
    const [hour, setHour] = useState(0);

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
        window.electron.ipcRenderer.on('time-message', (_event, time) => {
            setHour(time); 
        });

        return () => {
            window.electron.ipcRenderer.removeAllListeners('time-message');
        };
    }, []);

    useEffect(() => {
        if (textRef && textRef.current) {
            if (textRef.current.offsetWidth < 34) {
                setNameWidth(34)
            } else {
                setNameWidth(textRef.current.offsetWidth);
            }
        }
    }, [name]);

    // Really not sure why the div's text is right justified and styling
    // doesnt seem to help so im just gonna do this :)
    function generateNBSPFromNumber(num: number): string {
        const numStr = Math.abs(num).toString().replace('.', ''); // Should never have decimals but just in case
        return '&nbsp;&nbsp;'.repeat(4 - numStr.length);
    }

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
            <div style={{
                fontFamily: "'Brawlhalla', sans-serif",
                position: 'absolute',
                right: `calc(50% - ${nameWidth - 390}px)`,
                top: '17px',
                fontSize: '20px',
                color: 'white',
            }} dangerouslySetInnerHTML={{ __html: `${hour}h${generateNBSPFromNumber(hour)}` }}>
            </div>
        </>
    );
}

export default Background;
