const defaultChartProperties = {
    width:800,
    height:500,
    timeScale:{
        timeVisible:true,
        secondsVisible:false,
        rightOffset: 2,
    },
}

const high_precission_price_scale = {
    priceFormat: {
        type: 'price',
        precision: 8,
        minMove: 0.00000001,
    },
};
class SymbolChart {
    constructor(symbol, elementID, timeFrame, chartProperties) {
        this.symbol = symbol;
        this.elementID = elementID;
        this.domElement = document.getElementById(this.elementID);
        this.chart = LightweightCharts.createChart(this.domElement,chartProperties);
        this.candleSeries = this.chart.addCandlestickSeries();
        this.series = {
            'volume': this.chart.addHistogramSeries({
                color: '#ffbf00',
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: '',
                scaleMargins: {
                    top: 0.8,
                    bottom: 0,
                },
            })
        };
        this.timeFrame = timeFrame;
        this.ws = null;
        this.live = false;
        if (! this.symbol.endsWith('USDT')) {
            this.candleSeries.applyOptions(high_precission_price_scale);
        }
    }

    loadHistoricData(limit=1000) {
        var url = 'https://api.binance.com/api/v3/klines?symbol='+this.symbol.toUpperCase()+
            '&interval='+this.timeFrame+'&limit='+limit;
        fetch(url)
            .then(res => res.json())
            .then(
                data => {
                    const cdata_price = data.map(
                        d => {
                            return {
                                time:d[0]/1000,
                                open:parseFloat(d[1]),
                                high:parseFloat(d[2]),
                                low:parseFloat(d[3]),
                                close:parseFloat(d[4]),
                                value:parseFloat(d[5]),
                            }
                        }
                    ); // cdata done, now it can be used
                    const cdata_volume = data.map(
                        d => {
                            return {
                                time:d[0]/1000,
                                value:parseFloat(d[5]),
                            }
                        }
                    ); // cdata done, now it can be used
                    this.candleSeries.setData(cdata_price);
                    this.series.volume.setData(cdata_volume);
                })
            .catch(err => console.log(err))
    }

    setLive(bool=true) {
        this.live = bool;
        if (bool===true) {
            var chart = this;
            var url = 'wss://stream.binance.com:9443/stream?streams='+this.symbol.toLowerCase()+'@kline_'+this.timeFrame;
            this.ws = new WebSocket(url);

            this.ws.onopen = function() {
                console.log('WebSocket connection created.');
            };


            // Close Websocket
            // https://www.tutorialspoint.com/How-to-reconnect-to-websocket-after-close-connection-with-HTML

            // this.ws.onclose = function() {
            //     console.log('WebSocket connection created.');
            // };

            // const socketCloseListener = (event) => {
            //    if (mySocket) {
            //       console.error('Disconnected.');
            //    }
            //    mySocket = new WebSocket('ws://localhost:8080');
            //    mySocket.addEventListener('open', socketOpenListener);
            //    mySocket.addEventListener('message', socketMessageListener);
            //    mySocket.addEventListener('close', socketCloseListener);
            // };


            if (this.ws.readyState == WebSocket.OPEN) {
                this.ws.onopen();
            }

            this.ws.onmessage = function(event) {
                const json = JSON.parse(event.data);
                var candle_update = SymbolChart._ws_kline2chart(json.data.k);
                // console.log(candle_update);
                // console.log(chart);
                chart.candleSeries.update(candle_update);
                chart.series.volume.update({time: candle_update.time, value: candle_update.volume});
            };

        }
        else if (this.live && bool===false) {
            this.ws.close();
        }
    }

    setTimeFrame(timeFrame) {
        if (this.live) {
            this.ws.close();
        }

        this.chart.removeSeries(this.candleSeries);
        this.candleSeries = this.chart.addCandlestickSeries();
        this.timeFrame = timeFrame;

        if (! this.symbol.endsWith('USDT')) {
            this.candleSeries.applyOptions(high_precission_price_scale);
        }

        this.loadHistoricData();
        this.setLive(this.live);
    }

    setSymbol(symbol) {
        if (this.live) {
            this.ws.close();
        }

        this.chart.removeSeries(this.candleSeries);
        this.candleSeries = this.chart.addCandlestickSeries();
        this.symbol = symbol;

        if (! this.symbol.endsWith('USDT')) {
            this.candleSeries.applyOptions(high_precission_price_scale);
        }

        this.loadHistoricData();
        this.setLive(this.live);
    }

    static _ws_kline2chart(data) {
        return {
            time: data.t/1000,
            open: parseFloat(data.o),
            close: parseFloat(data.c),
            high: parseFloat(data.h),
            low: parseFloat(data.l),
            volume: parseFloat(data.v),
        }
    }

}

// Usage:
//
// var btcusd_chart = new SymbolChart('btcusdt','tv_live_chart','5m', chartProperties);
// btcusd_chart.loadHistoricData();
// btcusd_chart.setLive();
