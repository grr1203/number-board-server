import express, { Request, Response, json, urlencoded } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';

const app: express.Application = express();
const port: number = 80;

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));

// build된 react web app 파일들을 제공
app.use(express.static(path.join(__dirname, 'dist')));

// Router
app.get('/', (request: Request, response: Response) => {
  response.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// SSE Client 관리
let clients: Response[] = [];
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  clients.push(res);

  req.on('close', () => (clients = clients.filter((client) => client !== res)));
});
app.use((req, res, next) => {
  (req as any).SSEClients = clients;
  next();
});

let data = { number1: '-', number2: '-', notice: 'ㅤ' };

// API
app.get('/api/data', (_, res: Response) => res.json(data));
app.put('/api/data', (req: any, res: Response) => {
  const { number1, number2, notice } = req.body;
  console.log('req.body', req.body);

  number1 && (data.number1 = number1);
  number2 && (data.number2 = number2);
  notice && (data.notice = notice);

  // 클라이언트들에게 SSE로 업데이트 알림
  if (number1 || number2) req.SSEClients.forEach((client: any) => client.write('data: refresh\n\n'));
  if (notice) req.SSEClients.forEach((client: any) => client.write('data: refreshNotice\n\n'));

  res.json(data);
});

app.get('/*', (request: Request, response: Response) => {
  response.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Server Run
app.listen(port, () => console.log(`App is listening on port ${port} \n`));
