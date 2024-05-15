import { useEffect, useRef, useState } from 'react';
import hoverSound from '../../../../resources/hover.mp3';
import pressSound from '../../../../resources/press.mp3';
import legendBackground from '../../../../resources/Portrait_Background.png';
import statsBackground from '../../../../resources/Stats.png';

interface ButtonProps {
    imageUrls: string[];
    imageAlts: string[];
    poseUrls: string[];
    currentIndex: number;
}

interface LegendStats {
    name: string;
    level: number;
    xp: number;
    playtime: number;
}

function LegendGallery({ imageUrls, imageAlts, poseUrls, currentIndex }: ButtonProps): JSX.Element {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const [stats, setStats] = useState<LegendStats[]>();
    const audioRefs = useRef<HTMLAudioElement[]>([]);

    useEffect(() => {
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
        poseUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }, [imageUrls, poseUrls]);

    useEffect(() => {
        window.electron.ipcRenderer.on('legend-stats', (_event, stats) => {
            if (stats != null) {
                setStats(stats); 
            }
        });

        return () => {
            window.electron.ipcRenderer.removeAllListeners('legend-stats');
        };
    }, []);

    useEffect(() => {
        const handleReceiveSelected = (_event, selected: string) => {
            const foundIndex = imageAlts.findIndex(alt => alt.includes(selected));
            if (foundIndex !== -1) {
                setSelectedImage(foundIndex);
            }
        };
    
        if (selectedImage === null) {
            window.electron.ipcRenderer.send('request-selected');
            window.electron.ipcRenderer.on('response-selected', handleReceiveSelected);
        }
    
        return () => {
            window.electron.ipcRenderer.removeAllListeners('response-selected');
        };
    }, [imageUrls, selectedImage, imageAlts]);

    const handleMouseEnter = () => {
        const audio = new Audio(hoverSound);
        audioRefs.current.push(audio);
        audio.play();
    };

    const handleMouseDown = (index: number) => {
        if (selectedImage === index) {
            setSelectedImage(null);
            window.electron.ipcRenderer.send('legend', 'Random');
        } else {
            setSelectedImage(index);
            const audio = new Audio(pressSound);
            audioRefs.current.push(audio);
            audio.play();
            window.electron.ipcRenderer.send('legend', imageAlts[index]);
        }
    };

    const handleGlobalMouseUp = () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
    };

    return (
        <>
            <div className="image-gallery">
                {imageUrls.slice(currentIndex * 12 * 3, currentIndex * 12 * 3 + 12 * 3).map((url, index) => {
                    const absoluteIndex = currentIndex * 12 * 3 + index;
                    return (
                        <div key={index}
                             className={`image-container ${selectedImage === absoluteIndex ? "selected" : ""}`}
                             onMouseEnter={handleMouseEnter}
                             onMouseDown={() => handleMouseDown(absoluteIndex)}
                             >
                            <img
                                src={legendBackground}
                                className="static-image"
                            />
                            <img
                                className="dynamic-image"
                                src={url}
                            />
                        </div>
                    );
                })}
            </div>
            <div style={{
                backgroundImage: `url(${statsBackground})`,
                position: 'absolute',
                top: '300px',
                left: '64px',
                width: '775px',
                height: '401px',
                transform: 'scale(0.71)'
            }}></div>
            {selectedImage !== null && <div style={{
                position: 'absolute',
                fontSize: '22px',
                textAlign: 'left',
                color: '#6ec8d3',
                left: '193px',
                top: '370px',
                fontFamily: "'Brawlhalla', sans-serif",
            }}>{imageAlts[selectedImage]}</div>}
            {stats && selectedImage !== null && stats[selectedImage] && <div style={{
                position: 'absolute',
                fontSize: '19px',
                textAlign: 'left',
                color: '#6ec8d3',
                left: '204px',
                top: '430px',
                fontFamily: "'Brawlhalla', sans-serif",
            }}>{`Level: ${(stats[selectedImage].level)}`}</div>}
            {stats && selectedImage !== null && stats[selectedImage] && <div style={{
                position: 'absolute',
                fontSize: '19px',
                textAlign: 'left',
                color: '#6ec8d3',
                left: '204px',
                top: '470px',
                fontFamily: "'Brawlhalla', sans-serif",
            }}>{`XP: ${(stats[selectedImage].xp)}`}</div>}
            {stats && selectedImage !== null && stats[selectedImage] && <div style={{
                position: 'absolute',
                fontSize: '19px',
                textAlign: 'left',
                color: '#6ec8d3',
                left: '204px',
                top: '510px',
                fontFamily: "'Brawlhalla', sans-serif",
            }}>{`Time: ${(stats[selectedImage].playtime / 3600000).toFixed(0)}h`}</div>}
            {selectedImage !== null && <img src={`${poseUrls[selectedImage]}`} style={{
                position: 'absolute',
                bottom: '24px',
                left: '560px',
                height: `300px`,
                transform: 'translateX(-50%) scale(0.71)'
            }}></img>}
            {selectedImage === null && <div style={{
                position: 'absolute',
                fontSize: '22px',
                textAlign: 'left',
                color: '#6ec8d3',
                left: '193px',
                top: '370px',
                fontFamily: "'Brawlhalla', sans-serif",
            }}>{"Random"}</div>}
            {stats && selectedImage === null && <div style={{
                position: 'absolute',
                fontSize: '19px',
                textAlign: 'left',
                color: '#6ec8d3',
                left: '204px',
                top: '430px',
                fontFamily: "'Brawlhalla', sans-serif",
            }}>{`Level: ${stats.reduce((sum, item) => sum + item.level, 0)}`}</div>}
            {stats && selectedImage === null && <div style={{
                position: 'absolute',
                fontSize: '19px',
                textAlign: 'left',
                color: '#6ec8d3',
                left: '204px',
                top: '470px',
                fontFamily: "'Brawlhalla', sans-serif",
            }}>{`Time: ${((stats.reduce((sum, item) => sum + item.playtime, 0)) / 3600000).toFixed(0)}h`}</div>}
        </>
    );
}

export default LegendGallery;
