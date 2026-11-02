// Tiny local server that mimics Vercel for this site: cleanUrls + headers from vercel.json
const http=require('http'),fs=require('fs'),path=require('path');
const root=process.argv[2], port=+process.argv[3]||8787;
const cfg=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff':'font/woff','.woff2':'font/woff2','.txt':'text/plain','.xml':'application/xml','.json':'application/json','.mp4':'video/mp4'};
const rx=src=>new RegExp('^'+src.replace(/\(\.\*\)/g,'(.*)')+'$');
http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]); if(p==='/') p='/index.html';
  let f=path.join(root,p); if(!fs.existsSync(f)&&fs.existsSync(f+'.html')) f+='.html';
  for(const h of cfg.headers) if(rx(h.source).test(p)) h.headers.forEach(x=>res.setHeader(x.key,x.value));
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end('404');}
  res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream'); fs.createReadStream(f).pipe(res);
}).listen(port,()=>console.log('serving',root,'on',port));
