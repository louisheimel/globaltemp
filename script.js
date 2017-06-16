const uniq = arr => arr.reduce((a, e) => { return a.includes(e) ? a : a.concat(e); },[])

fetch('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json')
.then(response => response.json())
.then((data) => {
  const config = {
    width: 1000,
    height: 400,
    border: '1px solid black',
    margin: '40px auto 0 auto',
    padding: '0 80px 60px 50px',
    display: 'block',
    heightFraction: .9,
    titleHeight: 55,
    titleText: '',
    barColor: '#6892d6',
    hoverColor: '#aabfe0'
  }
  const variance = data.monthlyVariance,
        baseTemperature = data.baseTemperature,
        // get a unique list of years the data was collected, map this to a collection of objects with the year as a unique key and an empty array of months that year
        years = uniq(variance.map(data => data.year)).map(year => { return { 'year': year, 'months': [] } })
  
        // fill the 'months' arrays with data
        variance.forEach(data => {
           years.filter(datum => datum.year === data.year)[0].months.push(data)
        })
  
			var root = d3.select('body')
						.append('svg')
						.attr('width', config.width)
						.attr('height', config.height)
						.style('border', config.border)
						.style('padding', config.padding)
						.style('display', config.display)
						.style('margin', config.margin)
        
       // create a function which maps each object to a color
       const colors = d3.scaleLinear()
                        .domain([0, 1])
                        .range(['blue', 'red'])
       const hottestTemp = variance.reduce((a, e) => e.variance > a.variance ? e : a).variance + baseTemperature,
             coldestTemp = variance.reduce((a, e) => e.variance < a.variance ? e : a).variance + baseTemperature,
             soonestYear = variance.reduce((a, e) => e.year > a.year ? e : a).year,
             oldestYear = variance.reduce((a, e) => e.year < a.year ? e : a).year
       const calculateColor = function(monthVariance) {
         // calculate temperature
         const normalize = function(val) { 
            const m = 1 / (hottestTemp - coldestTemp),
                b = - m;
              return m * val + b
          }
         
         const temp = monthVariance + baseTemperature
         const normalizedTemp = normalize(temp)
         return colors(normalizedTemp)
       }
       const months = root.selectAll('.months')
         .data(variance).enter().append('rect')
         .attr('width', config.width / (soonestYear + 1 - oldestYear))
         .attr('height', (d, i) => (config.height * config.heightFraction) / 12)
         .attr('x', (d) => (d.year - oldestYear) * (config.width / (soonestYear + 1 - oldestYear)))
         .attr('y', (d, i) => config.height - (13 - d.month) * (config.height * config.heightFraction) / 12)
         .attr('fill', d => calculateColor(d.variance))
       
       const div = d3.select("body").append("div")
							.attr("class", "tooltip")
							.style("display", "none");

       const numToMonth = (e) => {
         return {
           1: 'January',
           2: 'February',
           3: 'March',
           4: 'April',
           5: 'May',
           6: 'June',
           7: 'July',
           8: 'August',
           9: 'September',
           10: 'October',
           11: 'November',
           12: 'December',
         }[e]
       }
       months.on('mouseover', function(e) {
         div.style('display', 'block')
            .text(numToMonth(e.month) + ' - ' + e.year + '\n' + (baseTemperature + e.variance).toFixed(3) + ' ' + String.fromCharCode(176) + 'C' + '\n' + e.variance + ' ' + String.fromCharCode(176) + 'C')
            .style("left", (d3.event.pageX + 20) + "px")
            .style("top", (d3.event.pageY - 40) + "px")
            .style('position', 'absolute')
            .style('width', 'auto')
            .style('height', 'auto')
            .style('background-color', '#c7c7c7')
            .style('padding', '10px')
            .style('border-radius', '20px')
            .style('white-space', 'pre-wrap')
       })
       months.on('mouseleave', function() {
         div.style('display', 'none')
       })
        
})
.catch((err) => { console.log(err) })
