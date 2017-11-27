const mychart = echarts.init(document.getElementById('europe'))

var myData = [
    {name:'海门',value:[121.15,90]},
    {name:'舟山',value:[109.783, 39.6]}
]

$.getJSON('../Europe/Europe4.json',function (europeData) {
    mychart.setOption({
        series:[{
            type:'map',
            map:'europe',
            data:myData
        }]
    })
})