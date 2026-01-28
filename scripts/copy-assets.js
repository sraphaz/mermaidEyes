const fs = require('fs');
const path = require('path');

const extensionDir = path.join(__dirname, '..', 'extension');
const packagesDir = path.join(__dirname, '..', 'packages');
const targetPackagesDir = path.join(extensionDir, 'packages');

// Função para copiar diretório recursivamente
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copiar temas
const themesSrc = path.join(packagesDir, 'themes');
const themesDest = path.join(targetPackagesDir, 'themes');
if (fs.existsSync(themesSrc)) {
  console.log('Copiando temas...');
  copyDir(themesSrc, themesDest);
  console.log('✓ Temas copiados');
} else {
  console.warn('⚠ Diretório de temas não encontrado:', themesSrc);
}

// Copiar presets
const presetsSrc = path.join(packagesDir, 'presets');
const presetsDest = path.join(targetPackagesDir, 'presets');
if (fs.existsSync(presetsSrc)) {
  console.log('Copiando presets...');
  copyDir(presetsSrc, presetsDest);
  console.log('✓ Presets copiados');
} else {
  console.warn('⚠ Diretório de presets não encontrado:', presetsSrc);
}

console.log('✓ Assets copiados com sucesso!');
