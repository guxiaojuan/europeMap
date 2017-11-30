const mychart = echarts.init(document.getElementById('europe'))

var myData = [
    [
        {name:'海门',value:[1201.15,90.56,12]},
        {name:'舟山',value:[1090.783, 39.6,33]}
    ],
    [
        {name:'厦门',value:[4511.5,70,56]},
        {name: '招远', value: [1120.38, 37.35, 142]}
    ],
    [
        {name:'张掖',value:[32.1,44.2,77]},
        {name: '鄂尔多斯', value: [109.781327, 39.608266, 120]}
    ]

]

Data = function (index) {

    data = myData[index];

    var px = data[0] /1000;

    var py = data[1] /1000;

    var res = [[px, py]];



    for (var i = 2; i < data.length; i += 2) {

        var dx = data[i] /1000;

        var dy = data[i + 1] /1000;

        var x = px + dx;

        var y = py + dy;

        res.push([x, y, 1]);



        px = x;

        py = y;

    }

    return res;

};



$.getJSON('../Europe/Europe4.json',function (europeData) {
    echarts.registerMap('europe',europeData)
    mychart.setOption({
        legend: {
            left: 'left',
            data: ['强', '中', '弱'],
            textStyle: {
                color: '#ccc'
            }
        },
        geo:{
            map:'europe'
        },
        series:[
            {
                name:'强',
                type:'scatter',
                coordinateSystem:'geo',
                // data:Data(0)
                data:myData[0]
            },
            {
                name:'中',
                type:'scatter',
                coordinateSystem:'geo',
                // data:Data(1)
                data:myData[1]
            },
            {
                name:'弱',
                type:'scatter',
                coordinateSystem:'geo',
                // data:Data(2)
                data:myData[2]
            },
        ]
    })
})