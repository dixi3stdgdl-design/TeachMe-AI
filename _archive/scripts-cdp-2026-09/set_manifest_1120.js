const fs = require('fs');
const p = 'D:/ToolTip AI Translate/ToolTipAI-Translate/MicrosoftStore_Submission/Package/AppxManifest.xml';
let m = fs.readFileSync(p, 'utf8');
m = m.replace(/Version="[0-9\.]+"/, 'Version="1.1.2.0"');
fs.writeFileSync(p, m, 'utf8');
console.log('Manifest actualizado a 1.1.2.0:');
console.log(m.split('\n').slice(8, 15).join('\n'));
