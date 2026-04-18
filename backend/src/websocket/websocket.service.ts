import { BadGatewayException, BadRequestException, GatewayTimeoutException, Injectable } from '@nestjs/common';

@Injectable()
export class WebsocketService {

    sendProtocolWebsocketAI(
        url: string, 
        payload: string, 
        time=60000, 
        msgError='Nao foi possivel comunicar com a IA', 
        msgTypeInvalid='Resposta invalida recebida da IA'
    ) {
        return new Promise((resolve, reject) => {
            const socket = new WebSocket(url);
            const timeout = setTimeout(() => {
                socket.close();
                reject(new GatewayTimeoutException('Tempo limite excedido ao consultar a IA.'));
            }, time);

            socket.addEventListener('open', () => {
                socket.send(payload);
            });

            socket.addEventListener('message', (event) => {
                clearTimeout(timeout);
                socket.close();

                try {
                    const data = typeof event.data === 'string' ? event.data : String(event.data);
                    resolve(JSON.parse(data));
                } catch {
                    reject(new BadGatewayException(msgTypeInvalid));
                }
            });

            socket.addEventListener('error', () => {
                clearTimeout(timeout);
                reject(new BadGatewayException(msgError));
            });
        }); 
    }

    extractDocumentProtocolId(path: string) {
        const fileName = path.split('/').at(-1);

        if (!fileName) {
            throw new BadRequestException('Caminho do arquivo invalido.');
        }

        return fileName.replace(/\.pdf$/i, '');
    }
}
