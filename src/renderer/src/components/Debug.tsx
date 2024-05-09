import { useState, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import debug from '../../../../resources/Debug.png';
import debugTop from '../../../../resources/DebugTop.png';
import '../assets/debug.css';

interface Message {
    id: number;
    text: string;
    color: string;
}

function Debug(): JSX.Element {
    const [messages, setMessages] = useState<Message[]>([]);
    const maxMessages = 12;
    let nextId = 1;

    useEffect(() => {
        const handleNewLog = (_event, logMessage) => {
            console.log(logMessage.text);

            setMessages(prevMessages => {
                const newMessages = [...prevMessages, { id: nextId++, text: logMessage.text, color: logMessage.color }];
                if (newMessages.length > maxMessages) {
                    return newMessages.slice(1);
                }
                return newMessages;
            });
        };

        window.electron.ipcRenderer.on('log-message', handleNewLog);

        return () => {
            window.electron.ipcRenderer.removeAllListeners('log-message');
        };
    }, []);

    return (
        <>
            <div 
                style={{
                    zIndex: '999',
                    backgroundImage: `url(${debugTop})`,
                    position: 'absolute',
                    right: '35px',
                    top: '313px',
                    width: '371px',
                    height: '330px',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    fontSize: '18px',
                    textAlign: 'left',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    overflow: 'hidden',
                }}
            ></div>
            <div
                style={{
                    backgroundImage: `url(${debug})`,
                    position: 'absolute',
                    right: '35px',
                    top: '313px',
                    width: '371px',
                    height: '330px',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    fontSize: '18px',
                    textAlign: 'left',
                    paddingTop: 44,
                    paddingLeft: 15,
                    paddingBottom: 20,
                    backgroundColor: 'black',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    overflow: 'hidden',
                    fontFamily: "'Brawlhalla', sans-serif",
                }}
            >
                <TransitionGroup component={null}>
                    {messages.map((message) => (
                        <CSSTransition key={message.id} timeout={300} classNames="message">
                            <p style={{ margin: 0, color: message.color }}>{message.text}</p>
                        </CSSTransition>
                    ))}
                </TransitionGroup>
            </div>
        </>
    );
}

export default Debug;
