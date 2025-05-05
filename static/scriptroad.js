$.getJSON('/get_road_data', function (data) {
    let dailyMeans = data.daily_means;
    let xDates = dailyMeans.map(d => new Date(d.date));

    function downsampleArray(arr, interval) {
        return arr.filter((_, i) => i % interval === 0);
    }
    let sampleInterval = 5;

    let ds_xDates = downsampleArray(xDates, sampleInterval);

    let ds_G107_NO2 = downsampleArray(dailyMeans.map(d => d["G107 NO2"] || 0), sampleInterval);
    let ds_G125_NO2 = downsampleArray(dailyMeans.map(d => d["G125 NO2"] || 0), sampleInterval);
    let ds_G131_NO2 = downsampleArray(dailyMeans.map(d => d["G131 NO2"] || 0), sampleInterval);
    let ds_A2Hard_NO2 = downsampleArray(dailyMeans.map(d => d["A2Hard NO2"] || 0), sampleInterval);
    let ds_Feld_NO2 = downsampleArray(dailyMeans.map(d => d["Feld NO2"] || 0), sampleInterval);
    let ds_StJohanns_NO2 = downsampleArray(dailyMeans.map(d => d["StJohanns NO2"] || 0), sampleInterval);
    let ds_G107_O3 = downsampleArray(dailyMeans.map(d => d["G107 O3"] || 0), sampleInterval);
    let ds_G125_O3 = downsampleArray(dailyMeans.map(d => d["G125 O3"] || 0), sampleInterval);
    let ds_G131_O3 = downsampleArray(dailyMeans.map(d => d["G131 O3"] || 0), sampleInterval);
    let ds_A2Hard_O3 = downsampleArray(dailyMeans.map(d => d["A2Hard O3"] || 0), sampleInterval);
    let ds_Feld_O3 = downsampleArray(dailyMeans.map(d => d["Feld O3"] || 0), sampleInterval);
    let ds_StJohanns_O3 = downsampleArray(dailyMeans.map(d => d["StJohanns O3"] || 0), sampleInterval);
    let ds_G107_PM25 = downsampleArray(dailyMeans.map(d => d["G107 PM2.5"] || 0), sampleInterval);
    let ds_G125_PM25 = downsampleArray(dailyMeans.map(d => d["G125 PM2.5"] || 0), sampleInterval);
    let ds_G131_PM25 = downsampleArray(dailyMeans.map(d => d["G131 PM2.5"] || 0), sampleInterval);
    let ds_A2Hard_PM25 = downsampleArray(dailyMeans.map(d => d["A2Hard PM2.5"] || 0), sampleInterval);
    let ds_Feld_PM25 = downsampleArray(dailyMeans.map(d => d["Feld PM2.5"] || 0), sampleInterval);
    let ds_StJohanns_PM25 = downsampleArray(dailyMeans.map(d => d["StJohanns PM2.5"] || 0), sampleInterval);

    function computeSensorStats(sensorName) {
        let values = dailyMeans
            .map(d => parseFloat(d[sensorName]))
            .filter(v => !isNaN(v));
        if (values.length === 0) return { min: 0, max: 0, avg: 0, median: 0 };
        let minVal = Math.min(...values);
        let maxVal = Math.max(...values);
        let avgVal = values.reduce((sum, v) => sum + v, 0) / values.length;
        values.sort((a, b) => a - b);
        let mid = Math.floor(values.length / 2);
        let medianVal = (values.length % 2 !== 0) ? values[mid] : (values[mid - 1] + values[mid]) / 2;
        return { min: minVal, max: maxVal, avg: avgVal, median: medianVal };
    }

    let statsG107_NO2 = computeSensorStats("G107 NO2");
    let statsG125_NO2 = computeSensorStats("G125 NO2");
    let statsG131_NO2 = computeSensorStats("G131 NO2");
    let statsA2Hard_NO2 = computeSensorStats("A2Hard NO2");
    let statsFeld_NO2 = computeSensorStats("Feld NO2");
    let statsStJohanns_NO2 = computeSensorStats("StJohanns NO2");

    let $tbodyNO2 = $('#statsNO2 tbody');
    $tbodyNO2.empty();
    $tbodyNO2.append(`
      <tr>
          <td>G107 NO₂</td>
          <td>${statsG107_NO2.min.toFixed(2)}</td>
          <td>${statsG107_NO2.max.toFixed(2)}</td>
          <td>${statsG107_NO2.avg.toFixed(2)}</td>
          <td>${statsG107_NO2.median.toFixed(2)}</td>
      </tr>
      <tr>
          <td>G125 NO₂</td>
          <td>${statsG125_NO2.min.toFixed(2)}</td>
          <td>${statsG125_NO2.max.toFixed(2)}</td>
          <td>${statsG125_NO2.avg.toFixed(2)}</td>
          <td>${statsG125_NO2.median.toFixed(2)}</td>
      </tr>
      <tr>
          <td>G131 NO₂</td>
          <td>${statsG131_NO2.min.toFixed(2)}</td>
          <td>${statsG131_NO2.max.toFixed(2)}</td>
          <td>${statsG131_NO2.avg.toFixed(2)}</td>
          <td>${statsG131_NO2.median.toFixed(2)}</td>
      </tr>
      <tr>
          <td>A2 Hard NO₂</td>
          <td>${statsA2Hard_NO2.min.toFixed(2)}</td>
          <td>${statsA2Hard_NO2.max.toFixed(2)}</td>
          <td>${statsA2Hard_NO2.avg.toFixed(2)}</td>
          <td>${statsA2Hard_NO2.median.toFixed(2)}</td>
      </tr>
      <tr>
          <td>Feldbergstrasse NO₂</td>
          <td>${statsFeld_NO2.min.toFixed(2)}</td>
          <td>${statsFeld_NO2.max.toFixed(2)}</td>
          <td>${statsFeld_NO2.avg.toFixed(2)}</td>
          <td>${statsFeld_NO2.median.toFixed(2)}</td>
      </tr>
      <tr>
          <td>St. Johannsplatz NO₂</td>
          <td>${statsStJohanns_NO2.min.toFixed(2)}</td>
          <td>${statsStJohanns_NO2.max.toFixed(2)}</td>
          <td>${statsStJohanns_NO2.avg.toFixed(2)}</td>
          <td>${statsStJohanns_NO2.median.toFixed(2)}</td>
      </tr>
    `);

    let statsG107_O3 = computeSensorStats("G107 O3");
    let statsG125_O3 = computeSensorStats("G125 O3");
    let statsG131_O3 = computeSensorStats("G131 O3");
    let statsA2Hard_O3 = computeSensorStats("A2Hard O3");
    let statsFeld_O3 = computeSensorStats("Feld O3");
    let statsStJohanns_O3 = computeSensorStats("StJohanns O3");

    let $tbodyO3 = $('#statsO3 tbody');
    $tbodyO3.empty();
    $tbodyO3.append(`
      <tr>
          <td>G107 O₃</td>
          <td>${statsG107_O3.min.toFixed(2)}</td>
          <td>${statsG107_O3.max.toFixed(2)}</td>
          <td>${statsG107_O3.avg.toFixed(2)}</td>
          <td>${statsG107_O3.median.toFixed(2)}</td>
      </tr>
      <tr>
          <td>G125 O₃</td>
          <td>${statsG125_O3.min.toFixed(2)}</td>
          <td>${statsG125_O3.max.toFixed(2)}</td>
          <td>${statsG125_O3.avg.toFixed(2)}</td>
          <td>${statsG125_O3.median.toFixed(2)}</td>
      </tr>
      <tr>
          <td>G131 O₃</td>
          <td>${statsG131_O3.min.toFixed(2)}</td>
          <td>${statsG131_O3.max.toFixed(2)}</td>
          <td>${statsG131_O3.avg.toFixed(2)}</td>
          <td>${statsG131_O3.median.toFixed(2)}</td>
      </tr>
      <tr>
          <td>A2 Hard O₃</td>
          <td>${statsA2Hard_O3.min.toFixed(2)}</td>
          <td>${statsA2Hard_O3.max.toFixed(2)}</td>
          <td>${statsA2Hard_O3.avg.toFixed(2)}</td>
          <td>${statsA2Hard_O3.median.toFixed(2)}</td>
      </tr>
      <tr>
          <td>Feldbergstrasse O₃</td>
          <td>${statsFeld_O3.min.toFixed(2)}</td>
          <td>${statsFeld_O3.max.toFixed(2)}</td>
          <td>${statsFeld_O3.avg.toFixed(2)}</td>
          <td>${statsFeld_O3.median.toFixed(2)}</td>
      </tr>
      <tr>
          <td>St. Johannsplatz O₃</td>
          <td>${statsStJohanns_O3.min.toFixed(2)}</td>
          <td>${statsStJohanns_O3.max.toFixed(2)}</td>
          <td>${statsStJohanns_O3.avg.toFixed(2)}</td>
          <td>${statsStJohanns_O3.median.toFixed(2)}</td>
      </tr>
    `);

    let statsG107_PM25 = computeSensorStats("G107 PM2.5");
    let statsG125_PM25 = computeSensorStats("G125 PM2.5");
    let statsG131_PM25 = computeSensorStats("G131 PM2.5");
    let statsA2Hard_PM25 = computeSensorStats("A2Hard PM2.5");
    let statsFeld_PM25 = computeSensorStats("Feld PM2.5");
    let statsStJohanns_PM25 = computeSensorStats("StJohanns PM2.5");

    let $tbodyPM25 = $('#statsPM25 tbody');
    $tbodyPM25.empty();
    $tbodyPM25.append(`
      <tr>
          <td>G107 PM2.5</td>
          <td>${statsG107_PM25.min.toFixed(2)}</td>
          <td>${statsG107_PM25.max.toFixed(2)}</td>
          <td>${statsG107_PM25.avg.toFixed(2)}</td>
          <td>${statsG107_PM25.median.toFixed(2)}</td>
      </tr>
      <tr>
          <td>G125 PM2.5</td>
          <td>${statsG125_PM25.min.toFixed(2)}</td>
          <td>${statsG125_PM25.max.toFixed(2)}</td>
          <td>${statsG125_PM25.avg.toFixed(2)}</td>
          <td>${statsG125_PM25.median.toFixed(2)}</td>
      </tr>
      <tr>
          <td>G131 PM2.5</td>
          <td>${statsG131_PM25.min.toFixed(2)}</td>
          <td>${statsG131_PM25.max.toFixed(2)}</td>
          <td>${statsG131_PM25.avg.toFixed(2)}</td>
          <td>${statsG131_PM25.median.toFixed(2)}</td>
      </tr>
      <tr>
          <td>A2 Hard PM2.5</td>
          <td>${statsA2Hard_PM25.min.toFixed(2)}</td>
          <td>${statsA2Hard_PM25.max.toFixed(2)}</td>
          <td>${statsA2Hard_PM25.avg.toFixed(2)}</td>
          <td>${statsA2Hard_PM25.median.toFixed(2)}</td>
      </tr>
      <tr>
          <td>Feldbergstrasse PM2.5</td>
          <td>${statsFeld_PM25.min.toFixed(2)}</td>
          <td>${statsFeld_PM25.max.toFixed(2)}</td>
          <td>${statsFeld_PM25.avg.toFixed(2)}</td>
          <td>${statsFeld_PM25.median.toFixed(2)}</td>
      </tr>
      <tr>
          <td>St. Johannsplatz PM2.5</td>
          <td>${statsStJohanns_PM25.min.toFixed(2)}</td>
          <td>${statsStJohanns_PM25.max.toFixed(2)}</td>
          <td>${statsStJohanns_PM25.avg.toFixed(2)}</td>
          <td>${statsStJohanns_PM25.median.toFixed(2)}</td>
      </tr>
    `);

    let traceG107_NO2 = {
        x: ds_xDates,
        y: ds_G107_NO2,
        name: "G107 NO₂",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "023E8A" },
        marker: { size: 4, color: "023E8A" }
    };
    let traceG125_NO2 = {
        x: ds_xDates,
        y: ds_G125_NO2,
        name: "G125 NO₂",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "0077B6" },
        marker: { size: 4, color: "0077B6" }
    };

    let traceG131_NO2 = {
        x: ds_xDates,
        y: ds_G131_NO2,
        name: "G131 NO₂",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "0096C7" },
        marker: { size: 4, color: "0096C7" }
    };

    let traceA2Hard_NO2 = {
        x: ds_xDates,
        y: ds_A2Hard_NO2,
        name: "A2 Hard NO₂",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "DC2F02" },
        marker: { size: 4, color: "DC2F02" }
    };

    let traceFeld_NO2 = {
        x: ds_xDates,
        y: ds_Feld_NO2,
        name: "Feldbergstrasse NO₂",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "F48C06" },
        marker: { size: 4, color: "F48C06" }
    };

    let traceStJohanns_NO2 = {
        x: ds_xDates,
        y: ds_StJohanns_NO2,
        name: "St. Johannsplatz NO₂",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "FFBA08" },
        marker: { size: 4, color: "FFBA08" }
    };

    let medianG107_NO2_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG107_NO2.median, statsG107_NO2.median],
        name: "Median G107 NO₂",
        mode: "lines",
        hoverinfo: "skip", 
        line: { dash: "dash", width: 2, color: "cyan" }
    };

    let medianG107_NO2_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG107_NO2.median, statsG107_NO2.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median G107 NO₂: ${statsG107_NO2.median}`,
            `Median G107 NO₂: ${statsG107_NO2.median}`
        ],
        marker: { color: "cyan", size: 8 },
        showlegend: false
    };

    let medianG125_NO2_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG125_NO2.median, statsG125_NO2.median],
        name: "Median G125 NO₂",
        mode: "lines",
        hoverinfo: "skip",
        line: { dash: "dash", width: 2, color: "red" }
    };

    let medianG125_NO2_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG125_NO2.median, statsG125_NO2.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median G125 NO₂: ${statsG125_NO2.median}`,
            `Median G125 NO₂: ${statsG125_NO2.median}`
        ],
        marker: { color: "red", size: 8 },
        showlegend: false
    };

    let medianG131_NO2_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG131_NO2.median, statsG131_NO2.median],
        name: "Median G131 NO₂",
        mode: "lines",
        hoverinfo: "skip",
        line: { dash: "dash", width: 2, color: "Chartreuse" }
    };

    let medianG131_NO2_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG131_NO2.median, statsG131_NO2.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median G131 NO₂: ${statsG131_NO2.median}`,
            `Median G131 NO₂: ${statsG131_NO2.median}`
        ],
        marker: { color: "Chartreuse", size: 8 },
        showlegend: false
    };

    let medianA2Hard_NO2_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsA2Hard_NO2.median, statsA2Hard_NO2.median],
        name: "Median A2 Hard NO₂",
        mode: "lines",
        hoverinfo: "skip",
        line: { dash: "dash", width: 2, color: "magenta" }
    };

    let medianA2Hard_NO2_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsA2Hard_NO2.median, statsA2Hard_NO2.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median A2 Hard NO₂: ${statsA2Hard_NO2.median}`,
            `Median A2 Hard NO₂: ${statsA2Hard_NO2.median}`
        ],
        marker: { color: "magenta", size: 8 },
        showlegend: false
    };

    let medianFeld_NO2_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsFeld_NO2.median, statsFeld_NO2.median],
        name: "Median Feldbergstrasse NO₂",
        mode: "lines",
        hoverinfo: "skip",
        line: { dash: "dash", width: 2, color: "orange" }
    };

    let medianFeld_NO2_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsFeld_NO2.median, statsFeld_NO2.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median Feldbergstrasse NO₂: ${statsFeld_NO2.median}`,
            `Median Feldbergstrasse NO₂: ${statsFeld_NO2.median}`
        ],
        marker: { color: "orange", size: 8 },
        showlegend: false
    };

    let medianStJohanns_NO2_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsStJohanns_NO2.median, statsStJohanns_NO2.median],
        name: "Median St. Johannsplatz NO₂",
        mode: "lines",
        hoverinfo: "skip",
        line: { dash: "dash", width: 2, color: "brown" }
    };

    let medianStJohanns_NO2_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsStJohanns_NO2.median, statsStJohanns_NO2.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median St. Johannsplatz NO₂: ${statsStJohanns_NO2.median}`,
            `Median St. Johannsplatz NO₂: ${statsStJohanns_NO2.median}`
        ],
        marker: { color: "brown", size: 8 },
        showlegend: false
    };

    let layoutNO2 = {
        title: "Nitrogen Dioxide (NO₂) / Date",
        xaxis: {
            title: "Date",
            type: "date",
            tickangle: -45,
            tickfont: { size: 9 },
            tickformat: "%d/%m",
        },
        yaxis: { title: "NO₂ (μg/m³)" },
        hovermode: "x unified",
        legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.2 },
        margin: { l: 60, r: 30, t: 60, b: 100 }
    };

    Plotly.newPlot('chartNO2', [
        traceG107_NO2, traceG125_NO2, traceG131_NO2, traceA2Hard_NO2, traceFeld_NO2, traceStJohanns_NO2,
        medianG107_NO2_Line, medianG107_NO2_Markers,
        medianG125_NO2_Line, medianG125_NO2_Markers,
        medianG131_NO2_Line, medianG131_NO2_Markers,
        medianA2Hard_NO2_Line, medianA2Hard_NO2_Markers,
        medianFeld_NO2_Line, medianFeld_NO2_Markers,
        medianStJohanns_NO2_Line, medianStJohanns_NO2_Markers
    ], layoutNO2);

    let traceG107_O3 = {
        x: ds_xDates,
        y: ds_G107_O3,
        name: "G107 O₃",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "023E8A" },
        marker: { size: 4, color: "023E8A" }
    };
    let traceG125_O3 = {
        x: ds_xDates,
        y: ds_G125_O3,
        name: "G125 O₃",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "0077B6" },
        marker: { size: 4, color: "0077B6" }
    };
    let traceG131_O3 = {
        x: ds_xDates,
        y: ds_G131_O3,
        name: "G131 O₃",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "0096C7" },
        marker: { size: 4, color: "0096C7" }
    };
    let traceA2Hard_O3 = {
        x: ds_xDates,
        y: ds_A2Hard_O3,
        name: "A2 Hard O₃",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "DC2F02" },
        marker: { size: 4, color: "DC2F02" }
    };
    let traceFeld_O3 = {
        x: ds_xDates,
        y: ds_Feld_O3,
        name: "Feldbergstrasse O₃",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "F48C06" },
        marker: { size: 4, color: "F48C06" }
    };
    let traceStJohanns_O3 = {
        x: ds_xDates,
        y: ds_StJohanns_O3,
        name: "St. Johannsplatz O₃",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "FFBA08" },
        marker: { size: 4, color: "FFBA08" }
    };

    let medianG107_O3_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG107_O3.median, statsG107_O3.median],
        name: "Median G107 O₃",
        mode: "lines",
        hoverinfo: "skip", 
        line: { dash: "dash", width: 2, color: "red" }
    };

    let medianG107_O3_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG107_O3.median, statsG107_O3.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median G107 O₃: ${statsG107_O3.median}`,
            `Median G107 O₃: ${statsG107_O3.median}`
        ],
        marker: { color: "red", size: 8 },
        showlegend: false
    };

    let medianG125_O3_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG125_O3.median, statsG125_O3.median],
        name: "Median G125 O₃",
        mode: "lines",
        hoverinfo: "skip",
        line: { dash: "dash", width: 2, color: "green" }
    };

    let medianG125_O3_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG125_O3.median, statsG125_O3.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median G125 O₃: ${statsG125_O3.median}`,
            `Median G125 O₃: ${statsG125_O3.median}`
        ],
        marker: { color: "green", size: 8 },
        showlegend: false
    };

    let medianG131_O3_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG131_O3.median, statsG131_O3.median],
        name: "Median G131 O₃",
        mode: "lines",
        hoverinfo: "skip",
        line: { dash: "dash", width: 2, color: "blue" }
    };

    let medianG131_O3_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG131_O3.median, statsG131_O3.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median G131 O₃: ${statsG131_O3.median}`,
            `Median G131 O₃: ${statsG131_O3.median}`
        ],
        marker: { color: "blue", size: 8 },
        showlegend: false
    };

    let medianA2Hard_O3_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsA2Hard_O3.median, statsA2Hard_O3.median],
        name: "Median A2 Hard O₃",
        mode: "lines",
        hoverinfo: "skip",
        line: { dash: "dash", width: 2, color: "magenta" }
    };

    let medianA2Hard_O3_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsA2Hard_O3.median, statsA2Hard_O3.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median A2 Hard O₃: ${statsA2Hard_O3.median}`,
            `Median A2 Hard O₃: ${statsA2Hard_O3.median}`
        ],
        marker: { color: "magenta", size: 8 },
        showlegend: false
    };

    let medianFeld_O3_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsFeld_O3.median, statsFeld_O3.median],
        name: "Median Feldbergstrasse O₃",
        mode: "lines",
        hoverinfo: "skip",
        line: { dash: "dash", width: 2, color: "orange" }
    };

    let medianFeld_O3_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsFeld_O3.median, statsFeld_O3.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median Feldbergstrasse O₃: ${statsFeld_O3.median}`,
            `Median Feldbergstrasse O₃: ${statsFeld_O3.median}`
        ],
        marker: { color: "orange", size: 8 },
        showlegend: false
    };

    let medianStJohanns_O3_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsStJohanns_O3.median, statsStJohanns_O3.median],
        name: "Median St. Johannsplatz O₃",
        mode: "lines",
        hoverinfo: "skip",
        line: { dash: "dash", width: 2, color: "brown" }
    };

    let medianStJohanns_O3_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsStJohanns_O3.median, statsStJohanns_O3.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median St. Johannsplatz O₃: ${statsStJohanns_O3.median}`,
            `Median St. Johannsplatz O₃: ${statsStJohanns_O3.median}`
        ],
        marker: { color: "brown", size: 8 },
        showlegend: false
    };

    let layoutO3 = {
        title: "Ozone (O₃) / Date",
        xaxis: {
            title: "Date",
            type: "date",
            tickangle: -45,
            tickfont: { size: 9 },
            tickformat: "%d/%m"
        },
        yaxis: { title: "O₃ (μg/m³)" },
        hovermode: "x unified",
        legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.2 },
        margin: { l: 60, r: 30, t: 60, b: 100 }
    };

    Plotly.newPlot('chartO3', [
        traceG107_O3, traceG125_O3, traceG131_O3, traceA2Hard_O3, traceFeld_O3, traceStJohanns_O3,
        medianG107_O3_Line, medianG107_O3_Markers,
        medianG125_O3_Line, medianG125_O3_Markers,
        medianG131_O3_Line, medianG131_O3_Markers,
        medianA2Hard_O3_Line, medianA2Hard_O3_Markers,
        medianFeld_O3_Line, medianFeld_O3_Markers,
        medianStJohanns_O3_Line, medianStJohanns_O3_Markers
    ], layoutO3);

    let traceG107_PM25 = {
        x: ds_xDates,
        y: ds_G107_PM25,
        name: "G107 PM2.5",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "023E8A" },
        marker: { size: 4, color: "023E8A" }
    };

    let traceG125_PM25 = {
        x: ds_xDates,
        y: ds_G125_PM25,
        name: "G125 PM2.5",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "0077B6" },
        marker: { size: 4, color: "0077B6" }
    };

    let traceG131_PM25 = {
        x: ds_xDates,
        y: ds_G131_PM25,
        name: "G131 PM2.5",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "0096C7" },
        marker: { size: 4, color: "0096C7" }
    };

    let traceA2Hard_PM25 = {
        x: ds_xDates,
        y: ds_A2Hard_PM25,
        name: "A2 Hard PM2.5",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "DC2F02" },
        marker: { size: 4, color: "DC2F02" }
    };

    let traceFeld_PM25 = {
        x: ds_xDates,
        y: ds_Feld_PM25,
        name: "Feldbergstrasse PM2.5",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "F48C06" },
        marker: { size: 4, color: "F48C06" }
    };

    let traceStJohanns_PM25 = {
        x: ds_xDates,
        y: ds_StJohanns_PM25,
        name: "St. Johannsplatz PM2.5",
        mode: "lines+markers",
        line: { shape: "spline", smoothing: 1.2, width: 2, color: "FFBA08" },
        marker: { size: 4, color: "FFBA08" }
    };

    let medianG107_PM25_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG107_PM25.median, statsG107_PM25.median],
        name: "Median G107 PM2.5",
        mode: "lines",
        hoverinfo: "skip",
        line: { dash: "dash", width: 2, color: "red" }
    };

    let medianG107_PM25_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG107_PM25.median, statsG107_PM25.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median G107 PM2.5: ${statsG107_PM25.median}`,
            `Median G107 PM2.5: ${statsG107_PM25.median}`
        ],
        marker: { color: "red", size: 8 },
        showlegend: false
    };

    let medianG125_PM25_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG125_PM25.median, statsG125_PM25.median],
        name: "Median G125 PM2.5",
        mode: "lines",
        hoverinfo: "skip",
        line: { dash: "dash", width: 2, color: "green" }
    };

    let medianG125_PM25_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG125_PM25.median, statsG125_PM25.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median G125 PM2.5: ${statsG125_PM25.median}`,
            `Median G125 PM2.5: ${statsG125_PM25.median}`
        ],
        marker: { color: "green", size: 8 },
        showlegend: false
    };

    let medianG131_PM25_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG131_PM25.median, statsG131_PM25.median],
        name: "Median G131 PM2.5",
        mode: "lines",
        hoverinfo: "skip",
        line: { dash: "dash", width: 2, color: "blue" }
    };

    let medianG131_PM25_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsG131_PM25.median, statsG131_PM25.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median G131 PM2.5: ${statsG131_PM25.median}`,
            `Median G131 PM2.5: ${statsG131_PM25.median}`
        ],
        marker: { color: "blue", size: 8 },
        showlegend: false
    };

    let medianA2Hard_PM25_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsA2Hard_PM25.median, statsA2Hard_PM25.median],
        name: "Median A2 Hard PM2.5",
        mode: "lines",
        hoverinfo: "skip",
        line: { dash: "dash", width: 2, color: "magenta" }
    };

    let medianA2Hard_PM25_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsA2Hard_PM25.median, statsA2Hard_PM25.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median A2 Hard PM2.5: ${statsA2Hard_PM25.median}`,
            `Median A2 Hard PM2.5: ${statsA2Hard_PM25.median}`
        ],
        marker: { color: "magenta", size: 8 },
        showlegend: false
    };

    let medianFeld_PM25_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsFeld_PM25.median, statsFeld_PM25.median],
        name: "Median Feldbergstrasse PM2.5",
        mode: "lines",
        hoverinfo: "skip",
        line: { dash: "dash", width: 2, color: "orange" }
    };

    let medianFeld_PM25_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsFeld_PM25.median, statsFeld_PM25.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median Feldbergstrasse PM2.5: ${statsFeld_PM25.median}`,
            `Median Feldbergstrasse PM2.5: ${statsFeld_PM25.median}`
        ],
        marker: { color: "orange", size: 8 },
        showlegend: false
    };

    let medianStJohanns_PM25_Line = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsStJohanns_PM25.median, statsStJohanns_PM25.median],
        name: "Median St. Johannsplatz PM2.5",
        mode: "lines",
        hoverinfo: "skip",
        line: { dash: "dash", width: 2, color: "brown" }
    };

    let medianStJohanns_PM25_Markers = {
        x: [xDates[0], xDates[xDates.length - 1]],
        y: [statsStJohanns_PM25.median, statsStJohanns_PM25.median],
        mode: "markers",
        hoverinfo: "text",
        hovertext: [
            `Median St. Johannsplatz PM2.5: ${statsStJohanns_PM25.median}`,
            `Median St. Johannsplatz PM2.5: ${statsStJohanns_PM25.median}`
        ],
        marker: { color: "brown", size: 8 },
        showlegend: false
    };


    let layoutPM25 = {
        title: "Particulate Matter PM2.5 / Date",
        xaxis: {
            title: "Date",
            type: "date",
            tickangle: -45,
            tickfont: { size: 9 },
            tickformat: "%d/%m"
        },
        yaxis: { title: "PM2.5 (μg/m³)" },
        hovermode: "x unified",
        legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.2 },
        margin: { l: 60, r: 30, t: 60, b: 100 }
    };

    Plotly.newPlot('chartPM25', [
        traceG107_PM25, traceG125_PM25, traceG131_PM25, traceA2Hard_PM25, traceFeld_PM25, traceStJohanns_PM25,
        medianG107_PM25_Line, medianG107_PM25_Markers,
        medianG125_PM25_Line, medianG125_PM25_Markers,
        medianG131_PM25_Line, medianG131_PM25_Markers,
        medianA2Hard_PM25_Line, medianA2Hard_PM25_Markers,
        medianFeld_PM25_Line, medianFeld_PM25_Markers,
        medianStJohanns_PM25_Line, medianStJohanns_PM25_Markers
    ], layoutPM25);

    let ds1_NO2 = [];
    let ds2_NO2 = [];
    dailyMeans.forEach(d => {
        if (d["G107 NO2"] !== null) ds1_NO2.push(d["G107 NO2"]);
        if (d["G125 NO2"] !== null) ds1_NO2.push(d["G125 NO2"]);
        if (d["G131 NO2"] !== null) ds1_NO2.push(d["G131 NO2"]);
        if (d["A2Hard NO2"] !== null) ds2_NO2.push(d["A2Hard NO2"]);
        if (d["Feld NO2"] !== null) ds2_NO2.push(d["Feld NO2"]);
        if (d["StJohanns NO2"] !== null) ds2_NO2.push(d["StJohanns NO2"]);
    });

    let traceDs1_NO2 = {
        y: ds1_NO2,
        name: "NO₂ Measurements",
        type: "box"
    };
    let traceDs2_NO2 = {
        y: ds2_NO2,
        name: "Comparative NO₂ Measurements",
        type: "box"
    };
    let layoutBox = {
        title: "NO₂ Value Distribution per Dataset",
        yaxis: { title: "NO₂ (μg/m³)" }
    };
    Plotly.newPlot('boxplotNO2', [traceDs1_NO2, traceDs2_NO2], layoutBox);

    let ds1_O3 = [];
    let ds2_O3 = [];
    dailyMeans.forEach(d => {
        if (d["G107 O3"] != null) ds1_O3.push(d["G107 O3"]);
        if (d["G125 O3"] != null) ds1_O3.push(d["G125 O3"]);
        if (d["G131 O3"] != null) ds1_O3.push(d["G131 O3"]);
        if (d["A2Hard O3"] != null) ds2_O3.push(d["A2Hard O3"]);
        if (d["Feld O3"] != null) ds2_O3.push(d["Feld O3"]);
        if (d["StJohanns O3"] != null) ds2_O3.push(d["StJohanns O3"]);
    });

    let traceDs1_O3 = {
        y: ds1_O3,
        name: "O₃ Measurements",
        type: "box"
    };
    let traceDs2_O3 = {
        y: ds2_O3,
        name: "Comparative O₃ Measurements",
        type: "box"
    };
    let layoutBoxO3 = {
        title: "O₃ Value Distribution per Dataset",
        yaxis: { title: "O₃ (μg/m³)" }
    };
    Plotly.newPlot('boxplotO3', [traceDs1_O3, traceDs2_O3], layoutBoxO3);

    let ds1_PM25 = [];
    let ds2_PM25 = [];
    dailyMeans.forEach(d => {
        if (d["G107 PM2.5"] != null) ds1_PM25.push(d["G107 PM2.5"]);
        if (d["G125 PM2.5"] != null) ds1_PM25.push(d["G125 PM2.5"]);
        if (d["G131 PM2.5"] != null) ds1_PM25.push(d["G131 PM2.5"]);
        if (d["A2Hard PM2.5"] != null) ds2_PM25.push(d["A2Hard PM2.5"]);
        if (d["Feld PM2.5"] != null) ds2_PM25.push(d["Feld PM2.5"]);
        if (d["StJohanns PM2.5"] != null) ds2_PM25.push(d["StJohanns PM2.5"]);
    });

    let traceDs1_PM25 = {
        y: ds1_PM25,
        name: "PM2.5 Measurements",
        type: "box"
    };
    let traceDs2_PM25 = {
        y: ds2_PM25,
        name: "Comparative PM2.5 Measurements",
        type: "box"
    };
    let layoutBoxPM25 = {
        title: "PM2.5 Value Distribution per Dataset",
        yaxis: { title: "PM2.5 (μg/m³)" }
    };
    Plotly.newPlot('boxplotPM25', [traceDs1_PM25, traceDs2_PM25], layoutBoxPM25);

    let stats = data.stats;
    let sensorNames = Object.keys(stats);
    let means = sensorNames.map(sensor => stats[sensor].avg);
    let stdDevs = sensorNames.map(sensor => stats[sensor].std);

    let traceBar = {
        x: sensorNames,
        y: means,
        type: 'bar',
        error_y: {
            type: 'data',
            array: stdDevs,
            visible: true
        }
    };

    let layoutBar = {
        title: "Bar Plot: Comparison of Average Pollutant Levels per Sensor",
        xaxis: { title: "Sensor" },
        yaxis: { title: "Average Value" }
    };

    Plotly.newPlot('barPlotMeanStd', [traceBar], layoutBar);
}).fail(function (err) {
    console.error("Error loading /get_road_data for bar plot:", err);
});

$.getJSON('/get_corr_matrix', function (data) {
    let sensorNames = Object.keys(data);

    function getPollutantType(sensorName) {
        if (sensorName.indexOf("O3") > -1) return "O3";
        if (sensorName.indexOf("NO2") > -1) return "NO2";
        if (sensorName.indexOf("PM2.5") > -1) return "PM2.5";
        if (sensorName.indexOf("PM10") > -1) return "PM10";
        return null;
    }

    let zData = sensorNames.map(rowName => {
        return sensorNames.map(colName => {
            let rowType = getPollutantType(rowName);
            let colType = getPollutantType(colName);
            if (rowType !== null && colType !== null && rowType === colType) {
                return data[rowName][colName];
            } else {
                return null;
            }
        });
    });

    let traceHeatmap = {
        z: zData,
        x: sensorNames,
        y: sensorNames,
        type: 'heatmap',
        colorscale: 'Viridis',
        zmin: -1,
        zmax: 1,
        colorbar: { title: "Correlation" }
    };

    let layoutHeatmap = {
        title: "Correlation Heatmap: Homogeneous Measurements by Type (O₃, NO₂, PM2.5)",
        margin: { l: 100, r: 100, t: 100, b: 100 }
    };

    Plotly.newPlot('heatmapCorr', [traceHeatmap], layoutHeatmap);
}).fail(function (err) {
    console.error("Error loading correlation matrix:", err);
});

$.getJSON('/get_vehicle_data', function (data) {
    let daysAsDate = data.map(function (d) { return new Date(d.day); });
    let carValues = data.map(d => d.Car || 0);
    let truckValues = data.map(d => d["Truck / Bus"] || 0);
    let bikeValues = data.map(d => d["Bicycle / Motorbike"] || 0);
    let vanValues = data.map(d => d["Van / Suv"] || 0);

    function downsampleArray(arr, interval) {
        return arr.filter((_, i) => i % interval === 0);
    }
    let sampleInterval = 3;

    let ds_daysAsDate = downsampleArray(daysAsDate, sampleInterval);
    let ds_carValues = downsampleArray(carValues, sampleInterval);
    let ds_truckValues = downsampleArray(truckValues, sampleInterval);
    let ds_bikeValues = downsampleArray(bikeValues, sampleInterval);
    let ds_vanValues = downsampleArray(vanValues, sampleInterval);

    let traceCar = {
        y: ds_daysAsDate,
        x: ds_carValues,
        name: "Car",
        type: "bar",
        orientation: "h",
        marker: { color: "#1f77b4", line: { width: 1, color: "#fff" } }
    };

    let traceTruck = {
        y: ds_daysAsDate,
        x: ds_truckValues,
        name: "Truck / Bus",
        type: "bar",
        orientation: "h",
        marker: { color: "#ff7f0e", line: { width: 1, color: "#fff" } }
    };

    let traceBike = {
        y: ds_daysAsDate,
        x: ds_bikeValues,
        name: "Bicycle / Motorbike",
        type: "bar",
        orientation: "h",
        marker: { color: "#2ca02c", line: { width: 1, color: "#fff" } }
    };

    let traceVan = {
        y: ds_daysAsDate,
        x: ds_vanValues,
        name: "Van / Suv",
        type: "bar",
        orientation: "h",
        marker: { color: "purple", line: { width: 1, color: "#fff" } }
    };

    let layoutVehicle = {
        title: "Vehicle Type per Day",
        barmode: "stack",
        bargap: 0.1,
        xaxis: { title: "Number of Vehicles" },
        yaxis: {
            title: "Date",
            type: 'date',
            tickformat: '%d/%m',
            autorange: 'reversed'
        },
        hovermode: 'y unified',
        legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.15 },
        margin: { l: 80, r: 30, t: 80, b: 80 },
        width: 1435,
        height: 790
    };

    if ($('#vehicleChart').length) {
        Plotly.newPlot("vehicleChart", [traceCar, traceTruck, traceBike, traceVan], layoutVehicle);
    }

}).fail(function (err) {
    console.error("Error loading /get_vehicle_data:", err);
});

$.getJSON('/get_spso_data', function (data) {
    let daily = data.daily_data;
    let stats = data.overall_stats;
    if (stats.speed_min < 0) { stats.speed_min = 0; }
    if (stats.speed_avg < 0) { stats.speed_avg = 0; }
    if (stats.speed_max < 0) { stats.speed_max = 0; }
    if (stats.sound_min < 0) { stats.sound_min = 0; }
    if (stats.sound_avg < 0) { stats.sound_avg = 0; }
    if (stats.sound_max < 0) { stats.sound_max = 0; }

    let speeds = daily.map(d => d.avg_speed).filter(s => s != null);
    speeds.sort((a, b) => a - b);
    let localMedianSpeed = 0;
    if (speeds.length > 0) {
        let mid = Math.floor(speeds.length / 2);
        localMedianSpeed = (speeds.length % 2 !== 0) ? speeds[mid] : (speeds[mid - 1] + speeds[mid]) / 2;
    }

    let sounds = daily.map(d => d.avg_sound).filter(s => s != null);
    sounds.sort((a, b) => a - b);
    let localMedianSound = 0;
    if (sounds.length > 0) {
        let mid = Math.floor(sounds.length / 2);
        localMedianSound = (sounds.length % 2 !== 0) ? sounds[mid] : (sounds[mid - 1] + sounds[mid]) / 2;
    }

    $("#speed_min").text(stats.daily_speed_min.toFixed(2) + " km/h");
    $("#speed_avg").text(stats.daily_speed_avg.toFixed(2) + " km/h");
    $("#speed_max").text(stats.daily_speed_max.toFixed(2) + " km/h");
    $("#speed_median").text(stats.daily_speed_median.toFixed(2) + " km/h");
    $("#instantaneous_speed_max").text(stats.instantaneous_speed_max.toFixed(2) + " km/h");

    $("#sound_min").text(stats.daily_sound_min.toFixed(2) + " dB");
    $("#sound_avg").text(stats.daily_sound_avg.toFixed(2) + " dB");
    $("#sound_max").text(stats.daily_sound_max.toFixed(2) + " dB");
    $("#sound_median").text(stats.daily_sound_median.toFixed(2) + " dB");
    $("#instantaneous_sound_max").text(stats.instantaneous_sound_max.toFixed(2) + " dB");

    let vehicleCounts = daily.map(d => d.vehicle_count).filter(c => c != null);
    let vehicleMin = 0, vehicleMax = 0, vehicleAvg = 0, medianCountValue = 0;
    if (vehicleCounts.length > 0) {
        vehicleMin = Math.min(...vehicleCounts);
        vehicleMax = Math.max(...vehicleCounts);
        vehicleAvg = vehicleCounts.reduce((a, b) => a + b, 0) / vehicleCounts.length;
        vehicleCounts.sort((a, b) => a - b);
        let midCount = Math.floor(vehicleCounts.length / 2);
        medianCountValue = (vehicleCounts.length % 2 !== 0)
            ? vehicleCounts[midCount]
            : (vehicleCounts[midCount - 1] + vehicleCounts[midCount]) / 2;
    }

    $("#vehicle_min_speed").text(vehicleMin.toFixed(2));
    $("#vehicle_avg_speed").text(vehicleAvg.toFixed(2));
    $("#vehicle_max_speed").text(vehicleMax.toFixed(2));
    $("#vehicle_median_speed").text(medianCountValue.toFixed(2));
    $("#vehicle_instantaneous_speed").text(stats.instantaneous_vehicle_max.toFixed(2));

    $("#vehicle_min_sound").text(vehicleMin.toFixed(2));
    $("#vehicle_avg_sound").text(vehicleAvg.toFixed(2));
    $("#vehicle_max_sound").text(vehicleMax.toFixed(2));
    $("#vehicle_median_sound").text(medianCountValue.toFixed(2));
    $("#vehicle_instantaneous_sound").text(stats.instantaneous_vehicle_max.toFixed(2));
    
    let xDates = daily.map(d => new Date(d.day));

    function downsampleArray(arr, interval) {
        return arr.filter((_, i) => i % interval === 0);
    }
    let sampleInterval = 2;

    let ds_xDates = downsampleArray(xDates, sampleInterval);
    let ds_vehicleCounts = downsampleArray(daily.map(d => d.vehicle_count), sampleInterval);
    let ds_avgSpeed = downsampleArray(daily.map(d => d.avg_speed), sampleInterval);
    let ds_avgSound = downsampleArray(daily.map(d => d.avg_sound), sampleInterval);
    let ds_medianSpeed = downsampleArray(xDates.map(() => localMedianSpeed), sampleInterval);
    let ds_medianSound = downsampleArray(xDates.map(() => localMedianSound), sampleInterval);
    let ds_medianCount = downsampleArray(xDates.map(() => medianCountValue), sampleInterval);

    let traceCount1 = {
        x: ds_xDates,
        y: ds_vehicleCounts,
        name: "Number of Vehicles",
        type: "bar",
        yaxis: "y"
    };

    let traceSpeed = {
        x: ds_xDates,
        y: ds_avgSpeed,
        name: "Average Speed",
        type: "scatter",
        mode: "lines+markers",
        yaxis: "y2"
    };

    let traceSpeedMedian = {
        x: ds_xDates,
        y: ds_medianSpeed,
        name: "Median Speed",
        mode: "lines",
        line: { dash: "dash", width: 2, color: "red" },
        yaxis: "y2"
    };

    let traceCountMedian1 = {
        x: ds_xDates,
        y: ds_medianCount,
        name: "Median Number of Vehicles",
        mode: "lines",
        line: { dash: "dash", width: 2, color: "blue" },
        yaxis: "y"
    };

    let layout1 = {
        title: "Daily Number of Vehicles vs Average Speed",
        barmode: "group",
        xaxis: {
            title: "Date",
            type: "date",
            tickformat: "%d/%m",
            tickangle: -45
        },
        yaxis: { title: "Number of Vehicles", side: "left" },
        yaxis2: { title: "Speed (km/h)", overlaying: "y", side: "right" },
        legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.2 },
        margin: { l: 60, r: 60, t: 60, b: 80 }
    };

    if ($('#chart1').length) {
        Plotly.newPlot("chart1", [traceCount1, traceSpeed, traceCountMedian1, traceSpeedMedian], layout1);
    }

    let traceCount2 = {
        x: ds_xDates,
        y: ds_vehicleCounts,
        name: "Number of Vehicles",
        type: "bar",
        yaxis: "y"
    };

    let traceSound = {
        x: ds_xDates,
        y: ds_avgSound,
        name: "Average Sound Pressure Level",
        type: "scatter",
        mode: "lines+markers",
        yaxis: "y2"
    };

    let traceSoundMedian = {
        x: ds_xDates,
        y: ds_medianSound,
        name: "Median Sound Pressure Level",
        mode: "lines",
        line: { dash: "dash", width: 2, color: "red" },
        yaxis: "y2"
    };

    let traceCountMedian2 = {
        x: ds_xDates,
        y: ds_medianCount,
        name: "Median Number of Vehicles",
        mode: "lines",
        line: { dash: "dash", width: 2, color: "blue" },
        yaxis: "y"
    };

    let layout2 = {
        title: "Daily Number of Vehicles vs Average Sound Pressure Level",
        barmode: "group",
        xaxis: {
            title: "Date",
            type: "date",
            tickformat: "%d/%m",
            tickangle: -45
        },
        yaxis: { title: "Number of Vehicles", side: "left" },
        yaxis2: { title: "Sound Pressure (dB)", overlaying: "y", side: "right" },
        legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.2 },
        margin: { l: 60, r: 60, t: 60, b: 80 }
    };

    if ($('#chart2').length) {
        Plotly.newPlot("chart2", [traceCount2, traceSound, traceCountMedian2, traceSoundMedian], layout2);
    }

}).fail(function (err) {
    console.error("Error loading /get_spso_data:", err);
});


$(document).ready(function () {
    function downsampleArray(arr, interval) {
        return arr.filter((_, i) => i % interval === 0);
    }

    $.getJSON('/get_soundHz_data', function (data) {
        let times = data.map(d => new Date(d.Zeitstempel));
        let dailyData = {};
        data.forEach((d) => {
            let dateObj = new Date(d.Zeitstempel);
            let dayKey = dateObj.toISOString().slice(0, 10);
            if (!dailyData[dayKey]) {
                dailyData[dayKey] = { sum: 0, count: 0 };
            }
            dailyData[dayKey].sum += d.Mittelungspegel;
            dailyData[dayKey].count += 1;
        });
        let dailyKeys = Object.keys(dailyData).sort();
        let dailyTimes = dailyKeys.map(day => new Date(day));
        let dailyAverages = dailyKeys.map(day => dailyData[day].sum / dailyData[day].count);
        let sortedAverages = [...dailyAverages].sort((a, b) => a - b);
        let medianVal;
        if (sortedAverages.length % 2 === 0) {
            medianVal = (sortedAverages[sortedAverages.length / 2 - 1] + sortedAverages[sortedAverages.length / 2]) / 2;
        } else {
            medianVal = sortedAverages[Math.floor(sortedAverages.length / 2)];
        }
        let medianLine = {
            x: dailyTimes,
            y: dailyTimes.map(() => medianVal),
            name: "Daily Median (dB)",
            mode: "lines",
            line: { dash: "dash", width: 2, color: "red" }
        };

        let traceDaily = {
            x: dailyTimes,
            y: dailyAverages,
            name: "Daily Avg Noise (dB)",
            mode: "lines+markers",
            line: { shape: "spline", smoothing: 1.2, width: 2, color: "blue" },
            marker: { size: 6 }
        };

        let layoutDaily = {
            title: "Total Noise (Daily Average) / Time",
            xaxis: { title: "Date", type: "date", tickangle: -45 },
            yaxis: { title: "dB" },
            hovermode: "x unified",
            legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.2 },
            margin: { l: 60, r: 30, t: 60, b: 80 }
        };
        Plotly.newPlot("chartMittel", [traceDaily, medianLine], layoutDaily);

        let sampleIntervalFreq = 2;
        let sampledTimesFreq = downsampleArray(times, sampleIntervalFreq);
        let freqCols = Object.keys(data[0]).filter(c =>
            c.includes("Hz") && c !== "timestamp_text" && c !== "Zeitstempel" && c !== "Mittelungspegel"
        );
        freqCols.sort((a, b) => parseFloat(a) - parseFloat(b));

        let zData = freqCols.map(freq => {
            let arr = data.map(d => d[freq]);
            return downsampleArray(arr, sampleIntervalFreq);
        });

        let traceHeatmapFreq = {
            x: sampledTimesFreq,
            y: freqCols,
            z: zData,
            type: "heatmap",
            colorscale: "Viridis",
            colorbar: { title: "dB" }
        };

        let layoutHeatmapFreq = {
            title: "Frequency Analysis / Time (Heatmap)",
            xaxis: { title: "Time", type: "date", tickangle: -45 },
            yaxis: { title: "Frequency (Hz)" },
            margin: { l: 100, r: 30, t: 60, b: 80 },
            height: 800
        };

        Plotly.newPlot("chartFrequencies", [traceHeatmapFreq], layoutHeatmapFreq);

        let mid = Math.ceil(freqCols.length / 2);
        let leftFreqs = freqCols.slice(0, mid);
        let rightFreqs = freqCols.slice(mid);
        let $tbodyLeft = $("#statsSoundHzLeft tbody");
        let $tbodyRight = $("#statsSoundHzRight tbody");
        $tbodyLeft.empty();
        $tbodyRight.empty();

        function appendRow($tbody, freq) {
            let vals = data.map(d => d[freq]).filter(v => !isNaN(v));
            if (vals.length === 0) {
                $tbody.append(`
                    <tr>
                        <td>${freq}</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                `);
                return;
            }
            vals.sort((a, b) => a - b);
            let minVal = vals[0];
            let maxVal = vals[vals.length - 1];
            let avgVal = vals.reduce((sum, v) => sum + v, 0) / vals.length;
            let medianValFreq = 0;
            let midIndex = Math.floor(vals.length / 2);
            if (vals.length % 2 === 0) {
                medianValFreq = (vals[midIndex - 1] + vals[midIndex]) / 2;
            } else {
                medianValFreq = vals[midIndex];
            }
            $tbody.append(`
                <tr>
                    <td>${freq}</td>
                    <td>${minVal.toFixed(2)}</td>
                    <td>${maxVal.toFixed(2)}</td>
                    <td>${avgVal.toFixed(2)}</td>
                    <td>${medianValFreq.toFixed(2)}</td>
                </tr>
            `);
        }

        leftFreqs.forEach(freq => appendRow($tbodyLeft, freq));
        rightFreqs.forEach(freq => appendRow($tbodyRight, freq));

    }).fail(function (err) {
        console.error("Error loading /get_soundHz_data:", err);
    });
});

$(document).ready(function () {
    if (document.getElementById("parkingBoxplot") &&
        document.getElementById("parkingTimeseries") &&
        document.getElementById("detailedTimeseries")) {

        $.getJSON('/get_parking_data', function (data) {
            data.forEach(d => {
                if (d.start_time) d.start_time = new Date(d.start_time);
                if (d.end_time) d.end_time = new Date(d.end_time);
            });

            let occupancyBlue = [];
            let occupancyYellow = [];
            data.forEach(d => {
                if (d.parking_type === "Blue") {
                    occupancyBlue.push(d.occupancy * 100);
                } else if (d.parking_type === "Yellow") {
                    occupancyYellow.push(d.occupancy * 100);
                }
            });

            let traceBlueBox = {
                y: occupancyBlue,
                name: "Blue",
                type: "box"
            };

            let traceYellowBox = {
                y: occupancyYellow,
                name: "Yellow",
                type: "box"
            };

            let layoutBox = {
                title: "Occupancy Distribution by Type",
                yaxis: { title: "Occupancy (%)" }
            };

            Plotly.newPlot("parkingBoxplot", [traceBlueBox, traceYellowBox], layoutBox);

            let blueData = data.filter(d => d.parking_type === "Blue");
            let occupancyByDateBlue = {};
            blueData.forEach(d => {
                if (d.start_time) {
                    let dateStr = new Date(d.start_time).toISOString().split("T")[0];
                    if (!occupancyByDateBlue[dateStr]) {
                        occupancyByDateBlue[dateStr] = { sum: 0, count: 0 };
                    }
                    occupancyByDateBlue[dateStr].sum += d.occupancy * 100;
                    occupancyByDateBlue[dateStr].count += 1;
                }
            });
            let datesBlue = Object.keys(occupancyByDateBlue).sort();
            let avgOccupancyBlue = datesBlue.map(date => occupancyByDateBlue[date].sum / occupancyByDateBlue[date].count);

            function median(arr) {
                let sorted = arr.slice().sort((a, b) => a - b);
                let mid = Math.floor(sorted.length / 2);
                return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
            }
            let medianBlue = median(avgOccupancyBlue);
            let medianLineBlue = datesBlue.map(() => medianBlue);

            let traceTimeBlue = {
                x: datesBlue,
                y: avgOccupancyBlue,
                mode: "lines+markers",
                name: "Blue Avg Occupancy (%)"
            };

            let traceMedianBlue = {
                x: datesBlue,
                y: medianLineBlue,
                mode: "lines",
                name: "Blue Median",
                line: { dash: "dash", width: 2, color: "black" }
            };

            let layoutTimeBlue = {
                title: "Daily Occupancy Analysis for Blue Spots",
                xaxis: { title: "Date", type: "date" },
                yaxis: { title: "Occupancy (%)" },
                hovermode: "x unified"
            };

            Plotly.newPlot("parkingTimeseries", [traceTimeBlue, traceMedianBlue], layoutTimeBlue);

            let yellowData = data.filter(d => d.parking_type === "Yellow");
            let occupancyByHourYellow = {};
            yellowData.forEach(d => {
                if (d.start_time) {
                    let date = new Date(d.start_time);
                    let hour = date.getHours();
                    if (!occupancyByHourYellow[hour]) {
                        occupancyByHourYellow[hour] = { sum: 0, count: 0 };
                    }
                    occupancyByHourYellow[hour].sum += d.occupancy * 100;
                    occupancyByHourYellow[hour].count += 1;
                }
            });

            let hours = [];
            let avgOccupancyYellow = [];
            for (let h = 0; h < 24; h++) {
                hours.push(h);
                if (occupancyByHourYellow[h] && occupancyByHourYellow[h].count > 0) {
                    avgOccupancyYellow.push(occupancyByHourYellow[h].sum / occupancyByHourYellow[h].count);
                } else {
                    avgOccupancyYellow.push(0);
                }
            }

            let medianYellow = median(avgOccupancyYellow);
            let medianLineYellow = hours.map(() => medianYellow);
            let traceHourYellow = {
                x: hours,
                y: avgOccupancyYellow,
                mode: "lines+markers",
                name: "Avg Occupancy (%) (Yellow)"
            };

            let traceMedianYellow = {
                x: hours,
                y: medianLineYellow,
                mode: "lines",
                name: "Median (Yellow)",
                line: { dash: "dash", width: 2, color: "black" }
            };

            let layoutHourYellow = {
                title: "Detailed Hourly Analysis for Yellow Spots (Full Day)",
                xaxis: { title: "Hour of Day", dtick: 1 },
                yaxis: { title: "Occupancy (%)" },
                hovermode: "x unified"
            };

            Plotly.newPlot("detailedTimeseries", [traceHourYellow, traceMedianYellow], layoutHourYellow);

        }).fail(function (err) {
            console.error("Error loading /get_parking_data:", err);
        });
    }
});

$(document).ready(function () {
    function movingAverage(arr, windowSize) {
        let averaged = [];
        for (let i = 0; i < arr.length; i++) {
            let start = Math.max(0, i - Math.floor(windowSize / 2));
            let end = Math.min(arr.length, i + Math.ceil(windowSize / 2));
            let windowData = arr.slice(start, end);
            averaged.push(windowData.reduce((acc, val) => acc + val, 0) / windowData.length);
        }
        return averaged;
    }

    function downsampleChunk(xArray, yArray, targetPoints) {
        let chunkSize = Math.max(1, Math.floor(xArray.length / targetPoints));
        let newX = [];
        let newY = [];
        for (let i = 0; i < xArray.length; i += chunkSize) {
            let chunkX = xArray.slice(i, i + chunkSize);
            let chunkY = yArray.slice(i, i + chunkSize);
            let xVal = chunkX[Math.floor(chunkX.length / 2)];
            let yAvg = chunkY.reduce((acc, val) => acc + val, 0) / chunkY.length;
            newX.push(xVal);
            newY.push(yAvg);
        }
        return { x: newX, y: newY };
    }

    function calculateStats(data) {
        let sorted = data.slice().sort((a, b) => a - b);
        let min = sorted[0];
        let max = sorted[sorted.length - 1];
        let sum = sorted.reduce((acc, val) => acc + val, 0);
        let avg = sum / sorted.length;
        let median;
        let len = sorted.length;
        if (len % 2 === 0) {
            median = (sorted[len / 2 - 1] + sorted[len / 2]) / 2;
        } else {
            median = sorted[Math.floor(len / 2)];
        }
        return { min, max, avg, median };
    }

    function createStatsTableHTML(stats, title) {
        return `<h3>${title}</h3>
            <table border="1" style="border-collapse: collapse;">
                <tr>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Avg</th>
                    <th>Median</th>
                </tr>
                <tr>
                    <td>${stats.min.toFixed(2)}</td>
                    <td>${stats.max.toFixed(2)}</td>
                    <td>${stats.avg.toFixed(2)}</td>
                    <td>${stats.median.toFixed(2)}</td>
                </tr>
            </table>`;
    }

    $.ajax({
        url: "/get_echarging_data",
        dataType: "json",
        cache: false,
        success: function (data) {
            data.forEach(d => {
                d.startTimeJS = new Date(d["Start Time"]);
                d["Duration min"] = parseFloat(d["Duration min"]);
                d["[kWh]"] = parseFloat(d["[kWh]"]);
            });

            let groupedData = {};
            data.forEach(d => {
                let dateStr = d.startTimeJS.toISOString().split('T')[0];
                if (!groupedData[dateStr]) {
                    groupedData[dateStr] = { totalDuration: 0, count: 0 };
                }
                groupedData[dateStr].totalDuration += d["Duration min"];
                groupedData[dateStr].count++;
            });
            let datesAggregated = Object.keys(groupedData).sort();
            let durationsAggregated = datesAggregated.map(dateStr => groupedData[dateStr].totalDuration / groupedData[dateStr].count);

            let smoothDurations = movingAverage(durationsAggregated, 7);
            let downsampledDatesData = downsampleChunk(datesAggregated, smoothDurations, 80);
            let statsDuration = calculateStats(smoothDurations);

            let medianTrace1 = {
                x: [downsampledDatesData.x[0], downsampledDatesData.x[downsampledDatesData.x.length - 1]],
                y: [statsDuration.median, statsDuration.median],
                mode: 'lines',
                name: 'Median',
                line: { dash: 'dot', color: 'red' }
            };

            let traceDurationLine = {
                x: downsampledDatesData.x,
                y: downsampledDatesData.y,
                mode: "lines+markers",
                name: "Average Duration (min)",
                line: { shape: "spline" }
            };

            let layoutDurationLine = {
                title: "Average Charging Duration per Date",
                xaxis: { title: "Date" },
                yaxis: { title: "Average Duration (min)" }
            };

            Plotly.newPlot("chart-duration-by-date", [traceDurationLine, medianTrace1], layoutDurationLine);

            $("#duration_min").text(statsDuration.min.toFixed(2) + " min");
            $("#duration_max").text(statsDuration.max.toFixed(2) + " min");
            $("#duration_avg").text(statsDuration.avg.toFixed(2) + " min");
            $("#duration_median").text(statsDuration.median.toFixed(2) + " min");

            let energyData = data.filter(d => d["[kWh]"] >= 0);
            let energyDataSampled = energyData.filter((d, i) => i % 5 === 0);
            let sessionIndex = energyDataSampled.map((_, i) => i + 1);
            let energyKWh = energyDataSampled.map(d => d["[kWh]"]);
            let smoothEnergy = movingAverage(energyKWh, 3);
            let downsampledEnergyData = downsampleChunk(sessionIndex, smoothEnergy, 80);
            let statsEnergy = calculateStats(smoothEnergy);

            let medianTrace2 = {
                x: [downsampledEnergyData.x[0], downsampledEnergyData.x[downsampledEnergyData.x.length - 1]],
                y: [statsEnergy.median, statsEnergy.median],
                mode: 'lines',
                name: 'Median',
                line: { dash: 'dot', color: 'red' }
            };

            let traceEnergyLine = {
                x: downsampledEnergyData.x,
                y: downsampledEnergyData.y,
                mode: "lines+markers",
                name: "kWh",
                line: { shape: "spline" }
            };

            let layoutEnergyLine = {
                title: "Energy Consumption per Session",
                xaxis: { title: "Session #" },
                yaxis: { title: "kWh" }
            };

            Plotly.newPlot("chart-energy-per-session", [traceEnergyLine, medianTrace2], layoutEnergyLine);

            $("#energy_min").text(statsEnergy.min.toFixed(2) + " kWh");
            $("#energy_max").text(statsEnergy.max.toFixed(2) + " kWh");
            $("#energy_avg").text(statsEnergy.avg.toFixed(2) + " kWh");
            $("#energy_median").text(statsEnergy.median.toFixed(2) + " kWh");

            let durations = data.map(d => d["Duration min"]);
            let filteredDurations = durations.filter(duration => duration <= 4000);
            let traceDurationHist = {
                x: filteredDurations,
                type: "histogram",
                name: "Charging Duration"
            };
            let layoutDurationHist = {
                title: "Charging Frequency Histogram",
                xaxis: { title: "Duration (min)", range: [0, 4000] },
                yaxis: { title: "Number of Charging Sessions" }
            };
            Plotly.newPlot("chart-duration-histogram", [traceDurationHist], layoutDurationHist);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error loading /get_echarging_data:", textStatus, errorThrown);
        }
    });
});
