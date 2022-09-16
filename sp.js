const axios = require('axios')
const cheerio = require('cheerio');

const fs = require('fs')
const xlsx = require('node-xlsx')

// 控制台进度条
// const progressBar = require('@jyeontu/progress-bar')
// const config = {
//   duration: 100,
//   current: 0,
//   block:'█',
//   showNumber:true,
//   tip:{
//       0: '努力加载中……',
//       50:'加载一半啦，不要着急……',
//       75:'马上就加载完了……',
//       100:'加载完成'
//   },
//   color:'blue'
// }
// var timerr, i = 0;
// let progressBarC = new progressBar(config);
// timerr = setInterval(()=>{
//     progressBarC.run(i++);
//     if (i > 100 ) { 
//         clearInterval(timerr);
//     }
// },100);

// let url = 'http://www.baidu.com'
// let url = 'http://192.168.50.12:5500/1.html'
let url = 'http://www.pangucaishui.com/channel.php/Company/index?page='

let total = 0
let columnKeys = ['城市', '公司', '联系人', '电话', '通话次数', '通话时长', '余额']
let columnValues = []
let page = 3
let pageCur = 1
let duration = 5000

axios.defaults.headers['Cookie'] = 'PHPSESSID=p6gh7osm0d4fqrtcjvaf6stsj7'


const init = async () =>{
  function getData(index){
    return new Promise(async resolve =>{
      const res = await axios.get(url + (index + 1))
      // console.log(res)
      let $ = cheerio.load(res.data)
      // 列名
      // const headerDomArr = $('.table thead tr th').toArray()
      // columnKeys = headerDomArr.map(v =>{
      //   return $(v).text()
      // })
      // 列值
      const trDom = $('.table tbody tr').toArray()
      trDom.map((tr, trIndex) =>{
        const trArr = []
        const tdDom = $(tr).children().toArray()
        console.log('-------------------' + (trIndex + 1))
        tdDom.map((td, tdIndex) =>{
          if(tdIndex > 0){
            const t = $(td).html().replace(/\s/g, '')
            if(tdIndex === 1){
              const tt = t.split('<br>')
              const city = tt[0]
              const company = tt[1]
              const contacks = tt[2].substring(0, tt[2].indexOf('&nbsp;'))
              const tel = tt[2].substring(tt[2].lastIndexOf(')">') + 3, tt[2].lastIndexOf('</a>'))
              const timer = tt[3].substring(tt[3].indexOf('">') + 2, tt[3].indexOf('</a>'))
              const time = tt[3].substring(tt[3].lastIndexOf('">') + 2, tt[3].lastIndexOf('</a>'))
              const minTime = Number(time)?Number(time) >= 60?Number(Number(time) / 60).toFixed(1) + '分钟':Number(time) + '秒':0
              trArr.push(city, company, contacks, tel, timer, minTime)
            }else if(tdIndex === 2){
              const money = t.substring(t.indexOf('余额：') + 3, t.indexOf('<br>'))
              trArr.push(money)
            }
          }
        })
        columnValues.push(trArr)
      })
      setTimeout(resolve, duration)
    })
  }
  const startTime = +new Date()
  for (let index = 0; index < page; index++) {
    await getData(index)
  }

  columnValues.unshift(columnKeys)

  
  const list = [
    {
      name: 'sheet1',
      data: columnValues
    }
  ]
  
  fs.writeFileSync('aa.xlsx', xlsx.build(list), (err) =>{
    if(err){
      console.log(err, '保存excel出错')
    }else{
      console.log('写入excel成功')
    }
  })
  const endTime = +new Date()
  // console.log(columnValues)
  console.log('共加载了' + (columnValues.length - 1) + '条数据, 累计耗时' + (endTime - startTime) / 1000 + '秒')
}
init()

