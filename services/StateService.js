const collectibles = [
    {
        x: 0,
        y: 0,
        value: 1,
        id: 'grey',
        size: 10,
        color: 'grey'    
    },
    {
        x: 0,
        y: 0,
        value: 2,
        id: 'green',
        size: 8,
        color: 'green'    
    },
    {
        x: 0,
        y: 0,
        value: 3,
        id: 'yellow',
        size: 6,
        color: 'yellow'    
    },
]


module.exports = {
    players: [

    ],
    collectibles,
    activeCollectible: {...collectibles[0]},
};