const fs = require('fs');
const emojiMap = {
  'feat': '✨',
  'fix': '🐛',
  'docs': '📝',
  'style': '💄',
  'refactor': '♻️',
  'test': '🚨',
  'chore': '🔧',
  'ci': '🔨',
  'update': '🚧',
  'perf': '🚀',
};
const commitMsgFile = process.env.HUSKY_GIT_PARAMS;
let commitMsg = fs.readFileSync(commitMsgFile, 'utf-8').trim() || '';
if (!commitMsg.includes('Merge branch')) {
  const msgArr = commitMsg.split(/\s*[:：]\s*/);
  const commitType = (msgArr.length > 1 ? msgArr[0].toLowerCase() : 'update') || 'update';
  const emoji = emojiMap[commitType];
  commitMsg = `${emoji} ${commitType}: ${msgArr.length > 1 ? msgArr[1]: msgArr[0]}`;
}
fs.writeFileSync(commitMsgFile, commitMsg);
