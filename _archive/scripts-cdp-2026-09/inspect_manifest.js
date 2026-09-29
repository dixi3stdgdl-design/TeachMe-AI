const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outDir = path.join(__dirname, 'inspect_1120_msix');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const msixPath = 'C:\\Users\\drbea\\Desktop\\ToolTip AI Translate — Instalador\\ToolTipAITranslate_1.1.2.0_x64.msix';
execSync(`tar -xf "${msixPath}" -C "${outDir}" AppxManifest.xml`);

const manifest = fs.readFileSync(path.join(outDir, 'AppxManifest.xml'), 'utf8');
console.log('=== APPXMANIFEST DE 1.1.2.0 ===');
console.log(manifest);
