export type Format = 'jpeg'|'png'|'webp'|'pdf';
export type Rules = {format:Format; maxKB:number; minKB:number; width:number; height:number; fit:'contain'|'cover'; pdfMode:'preserve'|'flatten'};
export const defaults:Rules={format:'jpeg',maxKB:200,minKB:0,width:0,height:0,fit:'contain',pdfMode:'preserve'};
export type Parsed={rules:Partial<Rules>; warnings:string[]; found:string[]};
export function parseRequirements(text:string):Parsed{
 const s=text.toLowerCase().replace(/,/g,'').replace(/[–—]/g,'-'); const rules:Partial<Rules>={};const warnings:string[]=[];const found:string[]=[];
 const formats=[...s.matchAll(/\b(jpe?g|png|webp|pdf)\b/g)].map(m=>m[1]==='jpg'?'jpeg':m[1]);
 if(formats.length){rules.format=formats[0] as Format;found.push('format');if(new Set(formats).size>1)warnings.push('Multiple formats mentioned. Choose the one the form accepts.');}
 const scale=(n:string,u:string)=>Number(n)*(u.startsWith('m')?1000:1);
 const range=s.match(/(\d+(?:\.\d+)?)\s*(kb|mb|kib|mib)?\s*(?:-|to|and)\s*(\d+(?:\.\d+)?)\s*(kb|mb|kib|mib)\b/);
 if(range){rules.minKB=scale(range[1],range[2]||range[4]);rules.maxKB=scale(range[3],range[4]);found.push('size range');}
 else {const sizes=[...s.matchAll(/(\d+(?:\.\d+)?)\s*(kb|mb|kib|mib)\b/g)];for(const m of sizes){const before=s.slice(Math.max(0,m.index!-30),m.index); if(/(?:minimum|min\.?|at least|larger than|greater than)\s*(?:file\s*size\s*)?(?:of|:|is)?\s*$/.test(before)){rules.minKB=scale(m[1],m[2]);found.push('minimum size');}else{rules.maxKB=scale(m[1],m[2]);found.push('maximum size');}} if(sizes.length>1)warnings.push('Several size limits found. Confirm the limits for this file.');}
 const d=s.match(/\b(\d{1,5})\s*(?:px|pixels)?\s*(?:x|×|by)\s*(\d{1,5})\s*(?:px|pixels)?\b/);
 if(d){if(/\b(?:cm|mm|inch|inches)\b/.test(s.slice(d.index!,d.index!+d[0].length+12)))warnings.push('Physical dimensions need a DPI value. Enter the required pixel dimensions manually.');else{rules.width=Number(d[1]);rules.height=Number(d[2]);found.push('dimensions');}}
 else {const w=s.match(/(?:width\s*[:=]?\s*(\d+)\s*(?:px|pixels)?|(\d+)\s*(?:px|pixels)\s*(?:wide|width))/);const h=s.match(/(?:height\s*[:=]?\s*(\d+)\s*(?:px|pixels)?|(\d+)\s*(?:px|pixels)\s*(?:high|height|tall))/);if(w){rules.width=Number(w[1]||w[2]);found.push('width');}if(h){rules.height=Number(h[1]||h[2]);found.push('height');}}
 if(/\b(dpi|ppi)\b/.test(s)) warnings.push('DPI metadata is not verified. This tool checks pixel dimensions.');
 if(/\b(white background|signature|face|passport|colour|color|black.and.white)\b/.test(s))warnings.push('Check appearance requirements yourself. Background, subject, and legibility are not automatically certified.');
 if(/\b(kib|mib)\b/.test(s)) warnings.push('This tool uses decimal KB (1,000 bytes), a conservative limit for KiB requirements.');
 if(/\b(minimum|maximum|at least|at most)\b[^.!\n]{0,35}\b(?:pixels|px)\b/.test(s))warnings.push('Dimension bounds were interpreted as target dimensions. Confirm the fields below.');
 if(!found.length)warnings.push('No supported requirements found. Set the fields manually.');
 return {rules,warnings,found};
}
export function validateRules(r:Rules){
 if(!Number.isFinite(r.maxKB)||r.maxKB<1||r.maxKB>50000)throw new Error('Set a maximum file size between 1 and 50,000 KB.');
 if(!Number.isFinite(r.minKB)||r.minKB<0||r.minKB>r.maxKB)throw new Error('Minimum size must be between 0 and the maximum size.');
 if(![r.width,r.height].every(n=>Number.isInteger(n)&&n>=0&&n<=8000))throw new Error('Use whole pixel dimensions between 1 and 8,000, or leave blank.');
 if(r.width*r.height>24000000)throw new Error('Use dimensions below 24 million pixels.');
}
export function dimensions(w:number,h:number,r:Rules){const width=r.width||Math.max(1,Math.round(w*(r.height?r.height/h:1)));const height=r.height||Math.max(1,Math.round(h*(r.width?r.width/w:1)));if(width*height>24000000||width>8000||height>8000)throw new Error('Output is too large. Choose smaller dimensions.');return {width,height};}
export function sizeLabel(n:number){return n>=1000000?`${(n/1000000).toFixed(2)} MB`:`${(n/1000).toFixed(1)} KB`;}
export type Check={label:string;detail:string;pass:boolean};
export function checkOutput(size:number,type:string,w:number,h:number,r:Rules,isPdf=false):Check[]{return [
 {label:'File format',detail:r.format==='jpeg'?'JPG':r.format.toUpperCase(),pass:type===(r.format==='pdf'?'application/pdf':`image/${r.format}`)},
 {label:'Maximum size',detail:`${sizeLabel(size)} / ${sizeLabel(r.maxKB*1000)}`,pass:size<=Math.floor(r.maxKB*1000)},
 ...(r.minKB?[{label:'Minimum size',detail:`At least ${sizeLabel(r.minKB*1000)}`,pass:size>=Math.ceil(r.minKB*1000)}]:[]),
 ...(!isPdf&&(r.width||r.height)?[{label:'Pixel dimensions',detail:`${w} × ${h} px`,pass:(!r.width||r.width===w)&&(!r.height||r.height===h)}]:[])
 ];}
