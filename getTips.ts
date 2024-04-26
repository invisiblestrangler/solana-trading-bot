import WebSocket from 'ws';

// Define the interface for the response structure
interface TipStreamResponse {
    time: string;
    landed_tips_25th_percentile: number;
    landed_tips_50th_percentile: number;
    landed_tips_75th_percentile: number;
    landed_tips_95th_percentile: number;
    landed_tips_99th_percentile: number;
    ema_landed_tips_50th_percentile: number;
}

// Class to manage WebSocket connection and EMA value retrieval
export class JitoTipsWSClient {
    private wsUrl: string;
    private ws: WebSocket | null = null;
    private emaValue: number = 0.0002;

    constructor(url: string) {
        this.wsUrl = url;
        this.connect();
    }

    private connect(): void {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.on('open', () => {
            console.log('Connected to the WebSocket server.');
        });

        this.ws.on('message', this.onMessage.bind(this));

        this.ws.on('error', (err) => {
            console.error('WebSocket error:', err);
        });

        this.ws.on('close', () => {
            console.log('WebSocket connection closed. Reconnecting...');
            this.reconnect();
        });
    }

    private onMessage(data: string): void {
        try {
            const responses: TipStreamResponse[] = JSON.parse(data);
            if (responses.length > 0 && responses[0].ema_landed_tips_50th_percentile !== undefined) {
                this.emaValue = responses[0].ema_landed_tips_50th_percentile;
                console.log('Updated Jito Tips EMA value:', this.emaValue);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }

    private reconnect(): void {
        setTimeout(() => {
            this.connect();
        }, 1000); // Reconnect after 1 second
    }

    public getEMAValue(): number {
        return this.emaValue;
    }

    public closeConnection(): void {
        if (this.ws) {
            this.ws.close();
        }
    }
}
