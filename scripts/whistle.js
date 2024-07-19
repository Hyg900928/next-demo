const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs-extra');

function exec({ cmd, args = [], onData, onError }) {
  const suitCmd = process.platform === 'win32' ? `${cmd}.cmd` : cmd;
  const child = spawn(suitCmd, args, { shell: true });
  child.stdout.on('data', bData => {
    const data = bData.toString();
    onData(data);
  });
  child.stderr.on('data', onError);
}

function checkIsInstalled() {
  return new Promise((resolve, reject) => {
    exec({
      cmd: 'npm',
      args: ['ls', 'whistle', '-g'],
      onData(data) {
        if (!/empty/i.test(data)) {
          resolve(true);
        }
        resolve(false);
      },
      onError: reject
    });
  });
}

function checkIsRunning() {
  return new Promise((resolve, reject) => {
    exec({
      cmd: 'w2',
      args: ['status'],
      onData(data) {
        if (!/no\s*running/im.test(data)) {
          resolve(true);
        }
        resolve(false);
      },
      onError: reject
    });
  });
}

function runIt() {
  return new Promise((resolve, reject) => {
    exec({
      cmd: 'w2',
      args: ['start'],
      onData: resolve,
      onError: reject
    });
  });
}

function useRules(cfgPath) {
  return new Promise((resolve, reject) => {
    exec({
      cmd: 'w2',
      args: ['use', cfgPath, '--force', ...process.argv.slice(2)],
      onData: resolve,
      onError: reject
    });
  });
}

function installWhistle() {
  return new Promise((resolve, reject) => {
    exec({
      cmd: 'npm',
      args: ['i', 'whistle', '-g'],
      onData: resolve,
      onError: reject
    });
  });
}

function getDefaultCfgPath() {
  return path.resolve(process.cwd(), 'whistle.cfg.js');
}

async function start(cfgPath = getDefaultCfgPath()) {
  if (!fs.existsSync(cfgPath)) {
    console.log('\r\n\r\n\033[31mnotice: there is no whistle config file  \033[39m\r\n\r\n');
    return;
  }
  try {
    const isInstalled = await checkIsInstalled();
    if (isInstalled) {
      const isRunning = await checkIsRunning();
      if (!isRunning) {
        await runIt();
      }
      try {
        await useRules(cfgPath);
      } catch(e) {
        console.log('whsitle配置文件不合法', e.toString());
        process.exit(0);
      }
      console.log('\r\n\r\n\033[32minfo: auto proxy is running...\033[39m\r\n\r\n');
    } else {
      throw new Error('not installed!');
    }
  } catch (e) {
    try {
      console.log('\r\n\033[32mwait while whistle is installing...\033[39m\r\n');
      await installWhistle();
      await start(cfgPath);
    } catch (e) {
      console.log(
        '\r\n\r\n\033[31mnotice: Please run npm i whistle -g to enable auto proxy\033[39m\r\n\r\n'
      );
    }
  }
}

module.exports = start;
