import { useState, useEffect } from "react";
import userIcon from '../../../../resources/User_Icon.png';

function UserIcon(): JSX.Element {
    const [img, setImg] = useState("")

    useEffect(() => {
        window.electron.ipcRenderer.on('icon', (_event, image) => {setImg(image); console.log(image)});

        return () => {
            window.electron.ipcRenderer.removeAllListeners('icon');
        };
    }, []);

    return(
        <>
          <img 
            className='usericon'
            src={userIcon} 
            style={{
                position: 'absolute',
                left: '20px',
                bottom: '20px',
                width: '84px',
                height: '84px',
                borderRadius: '18px',
                userSelect: 'none'
            }} 
            />
            {img && <img 
            className='usericon'
            src={img} 
            style={{
                position: 'absolute',
                left: '20px',
                bottom: '20px',
                width: '84px',
                height: '84px',
                borderRadius: '18px',
                userSelect: 'none'
            }} 
            />}
        </>
    )
}

export default UserIcon;