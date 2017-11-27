const mychart = echarts.init(document.getElementById('europe'))

$.getJSON('../Europe/Europe4.json',function (europeData) {
    echarts.registerMap('europe',europeData)

    mychart.setOption({
        series:[{
            type:'map',
            map:'europe',
            data:[{
                name:'itly',
            }]
        }]
    })
})