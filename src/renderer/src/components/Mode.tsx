import modeBackground from '../../../../resources/Mode_Background.png';

function Mode({ index }): JSX.Element {
    const modeNames = ["All Legends to 25",
                       "Closest Legend to Level Up",
                       "Gold Farming",
                       "One Legend",
                       "Lowest Level Legend"
                      ];

    return (
        <>
            <div style={{
                backgroundImage: `url(${modeBackground})`,
                position: 'absolute',
                top: '20px',
                right: '-30px',
                width: '500px',
                height: '52px',
                transform: 'scale(0.7342)'
            }}></div>
            <div style={{
                position: 'absolute',
                fontSize: '16px',
                textAlign: 'left',
                color: 'white',
                left: '760px',
                top: '36px',
                fontFamily: "'Brawlhalla', sans-serif",
            }}>Mode: {modeNames[index]}</div>
        </>
    );
}

export default Mode;
