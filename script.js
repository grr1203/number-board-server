const { exec } = require('child_process');

exec('forever start build/server.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`server 실행 중 오류 발생: ${error}`);
    return;
  }
  console.log(`server 실행 결과: ${stdout}`);
  console.error(`server 실행 오류: ${stderr}`);

  setTimeout(() => {
    exec('forever start init.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`browser 실행 중 오류 발생: ${error}`);
        return;
      }
      console.log(`browser 실행 결과: ${stdout}`);
      console.error(`browser 실행 오류: ${stderr}`);
    });
  }, 3000);
});
