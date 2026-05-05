import { defineConfig } from '@apps-in-toss/web-framework/config';

// 앱인토스 미니앱 빌드/배포 설정
// - appName: 앱인토스 콘솔 등록 시 입력한 값과 동일해야 함 (intoss://pixel-stonks)
// - brand: 토스앱 내 미니앱 헤더에 표시되는 메타정보
// - permissions: 빈 배열이어도 명시 필수 (clipboard/geolocation/contacts/photos/camera/microphone 가능)
export default defineConfig({
  appName: 'pixel-stonks',
  outdir: 'dist',
  brand: {
    displayName: '픽셀단타왕',
    primaryColor: '#e67e22',
    icon: '/favicon.svg',
  },
  permissions: [],
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'vite --port 3000',
      build: 'vite build',
    },
  },
});
