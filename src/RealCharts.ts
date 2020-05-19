import * as PIXI from 'pixi.js';

type RealChartsSerieData = Array<[number, number]>;

class RealChartsSerie {
    public name: string;
    public data: RealChartsSerieData;
    public color: number;
}

const devLog = true;
function logger(...toLog: any) {
    if (devLog) {
        console.log(...toLog);
    }
}

interface RealChartsOptions {
    /**
     * Container id
     */
    container: string;
    /**
     * Initial series to be plotted
     */
    series: RealChartsSerie[];
    backgroundColor: number;
}


export class RealCharts {
    series: RealChartsSerie[] = [];

    pixiApp: PIXI.Application;

    private chartOrigin;

    private tooltipCoordinates;

    constructor(public options: RealChartsOptions) {
        this.setUp();
    }

    private setUp() {
        const container = document.getElementById(this.options.container);
        if (container) {

            // Init pixi application
            this.pixiApp = new PIXI.Application({
                antialias: true,
                width: Number(container.style.width.split('p')[0]),
                height: Number(container.style.height.split('p')[0])
            });

            // Append pixi view
            container.appendChild(this.pixiApp.view);

            this.setUpRenderer();

            this.startTicker();

            this.setUpInteractionContainer();
        } else {
            logger(`Container #${this.options.container} not found`);
        }
    }

    private setUpRenderer() {
        this.pixiApp.renderer.backgroundColor = this.options.backgroundColor;
        this.chartOrigin = [10, this.pixiApp.renderer.height / 2];
    }

    /**
     * Setup RealCharts interactive events 
     * hover, zoom
     */
    private setUpInteractionContainer() {
        let interactionManager = new PIXI.interaction.InteractionManager(this.pixiApp.renderer);
        interactionManager.on('mousemove', (event) => {
            logger((event.data.getLocalPosition(this.pixiApp.stage)));
            this.tooltipCoordinates = { x: event.data.getLocalPosition(this.pixiApp.stage).x, y: event.data.getLocalPosition(this.pixiApp.stage).y };
        });
    }

    /**
     * Internal plotting serie mechanism
     * It detects serie type and will trigger the specific plotting mechanism
     * @param serieIndex 
     */
    private plotSerie(serieIndex: number) {

        const serieRef = this.options.series[serieIndex];
        if (serieRef) {
            this.plotLineSerie(serieRef.data, serieRef.color);
        }
    }

    /**
     * Plotting line type serie
     * @param data 
     * @param color 
     */
    private plotLineSerie(data: Array<[number, number]>, color: number) {
        let line = new PIXI.Graphics();
        line.lineStyle(1, color, 1);
        line.moveTo(this.chartOrigin[0], this.chartOrigin[1]);

        // Min and max data y 
        const max = Math.max(...data.map(x => x[0]));
        const min = Math.min(...data.map(x => x[0]));

        // Min and max data x
        const maxVal = Math.max(...data.map(x => x[1]));
        const minVal = Math.min(...data.map(x => x[1]));

        // y Ratio
        const ratio = this.pixiApp.renderer.width / (max - min);

        // x Ratio
        const ratioVal = this.pixiApp.renderer.height / (maxVal - minVal);

        // Draw line using points coordinates
        for (let point of data.map(entry => [((entry[0] - min) * ratio), ((entry[1] - minVal) * ratioVal)])) {
            line.lineTo((this.chartOrigin[0] + point[0]), this.chartOrigin[1] - point[1]);
        }

        // Move line to its origin
        line.x = this.chartOrigin[0];
        line.y = this.chartOrigin[1];
        this.pixiApp.stage.addChild(line);
    }

    private drawXAxis() {
        let line = new PIXI.Graphics();
        line.lineStyle(1, 0X00000, 1);
        line.moveTo(this.chartOrigin[0], this.chartOrigin[1]);
        line.lineTo(this.pixiApp.renderer.width, this.chartOrigin[1])
        line.x = this.chartOrigin[0];
        line.y = this.chartOrigin[1];
        this.pixiApp.stage.addChild(line);

    }

    private drawCursor() {
        if (this.tooltipCoordinates) {
            const cursor = new PIXI.Graphics();
            cursor.lineStyle(1, 0X00000, 1);
            cursor.moveTo(this.tooltipCoordinates.x, 0);
            cursor.lineTo(this.tooltipCoordinates.x, this.pixiApp.renderer.height);
            cursor.x = this.tooltipCoordinates.x;
            cursor.y = 0;
            this.pixiApp.stage.addChild(cursor);
        }
    }

    /**
     * Internal ticker 
     * Its main purpose is to render each chart state
     */
    private startTicker() {
        let self = this;
        this.pixiApp.ticker.add(() => {
            self.pixiApp.renderer.clear();
            const BLANK = new PIXI.Graphics();
            BLANK.beginFill(0xFFFFFF, 1);
            BLANK.drawRect(0, 0, this.pixiApp.renderer.width, this.pixiApp.renderer.height);
            BLANK.endFill();
            this.pixiApp.stage.addChild(BLANK);
            this.drawXAxis();
            for (let i = 0; i < this.options.series.length; i++) {
                this.plotSerie(i);
            }
            this.drawCursor();
        });
    }
}