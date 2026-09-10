import {createRequire} from 'node:module';
import {mkdir,copyFile,readdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const req=createRequire(import.meta.url);
const root=process.cwd();
const pdf=path.dirname(req.resolve('pdfjs-dist/package.json'));
const ocr=path.dirname(req.resolve('tesseract.js/package.json'));
const ocrReq=createRequire(path.join(ocr,'package.json'));
const core=path.dirname(ocrReq.resolve('tesseract.js-core/package.json'));
const lang=path.dirname(req.resolve('@tesseract.js-data/eng/package.json'));
await mkdir(path.join(root,'public/vendor/ocr'),{recursive:true});
await copyFile(path.join(pdf,'build/pdf.worker.min.mjs'),path.join(root,'public/vendor/pdf.worker.min.mjs'));
await copyFile(path.join(ocr,'dist/worker.min.js'),path.join(root,'public/vendor/ocr/worker.min.js'));
for(const name of await readdir(core))if(name.endsWith('.wasm.js')||name.endsWith('.wasm'))await copyFile(path.join(core,name),path.join(root,'public/vendor/ocr',name));
await copyFile(path.join(lang,'4.0.0_best_int/eng.traineddata.gz'),path.join(root,'public/vendor/ocr/eng.traineddata.gz'));
for(const [dir,name] of [[pdf,'PDFJS'],[ocr,'TESSERACT'],[core,'TESSERACT-CORE'],[lang,'LANGUAGE-DATA']]){for(const candidate of ['LICENSE','LICENSE.md','LICENSE.txt'])try{await copyFile(path.join(dir,candidate),path.join(root,'public/vendor',name+'-LICENSE.txt'));break;}catch{}}
await writeFile(path.join(root,'public/vendor/README.txt'),'Self-hosted PDF.js and Tesseract assets, copied from pinned npm dependencies by scripts/prepare-assets.mjs. The application does not send user files to a third-party service.\n');
console.log('Prepared local PDF and OCR assets.');
