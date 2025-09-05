// /server/routes/liveStreamingServer.js
// RTMP/WebRTC → 플랫폼 송출 브리지 서버 (NodeMediaServer 기반)
import NodeMediaServer from 'node-media-server';
import path from 'path';
import fs from 'fs';

// 설정 파일 경로
const CONFIG_PATH = path.join(process.cwd(), 'streamConfig.json');

// 기본 설정값
let streamConfig = {
  rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
  streamKey: 'YOUR_DEFAULT_KEY'
};

// 설정 파일이 있으면 불러오기
if (fs.existsSync(CONFIG_PATH)) {
  try {
    streamConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (err) {
    console.error('⚠️ streamConfig.json 파싱 실패, 기본값 사용');
  }
} else {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(streamConfig, null, 2));
}

// NodeMediaServer 설정
const config = {
  logType: 2,
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*'
  },
  relay: {
    ffmpeg: '/usr/bin/ffmpeg', // ⚠️ 서버에 설치된 ffmpeg 경로
    tasks: [
      {
        app: 'live',
        mode: 'push',
        edge: `${streamConfig.rtmpUrl}/${streamConfig.streamKey}`
      }
    ]
  }
};

const nms = new NodeMediaServer(config);

// 이벤트 로그
nms.on('postPublish', (id, StreamPath, args) => {
  console.log(`📡 방송 시작됨: id=${id} path=${StreamPath}`);
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log(`🛑 방송 종료됨: id=${id} path=${StreamPath}`);
});

// 외부에서 실행할 수 있도록 export
export const runLiveStreamingServer = () => {
  nms.run();
};
