import { Observable, of } from 'rxjs';
import { concatMap, delay, retry, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

const maxReconnectAttempts = 3;
const reconnectAttemptDelay = 100;
const WsCustomServerError = { code: 4444, reason: "server error???" };

class WsService {
  private wsSubject: WebSocketSubject<any>;
  disconnected = false;
  onMessage: Observable<any>;
  constructor(url: string) {
    this.wsSubject = webSocket<any>({
      url,
      closeObserver: {
        next() {
          console.log(`code: ${WsCustomServerError.code}, reason: ${WsCustomServerError.reason}`);
        }
      }
    });
    this.onMessage = this.wsSubject.pipe(
      retry({count: maxReconnectAttempts, delay: (errors) =>
        errors.pipe(
          concatMap((error) => {
            return of(error).pipe(
              tap(() => {
                this.disconnected = true;
                console.log('Trying to reconnect to WebSocket server...');
              }),
              delay(reconnectAttemptDelay)
            );
          })
        ),
      resetOnSuccess: true}),
      tap(() => {
        if (this.disconnected) {
          this.disconnected = false;
          console.info('Successfully re-connected to the WebSocket server.');
        }
      })
    );
  }
}

class EntityRecordsWsService extends WsService {
  constructor(url: string) {
    super(url);
  }
}

class EntityFormWsService extends WsService {
  constructor(url: string) {
    super(url);
  }
}

export const webSocketService = new EntityRecordsWsService('');
