# Builds the preview loops: python3 checks/loops.py [name ...]  (run from the repo root; files land in out/, copy them to assets/loops/)
# SRC is the folder holding the source films.
import subprocess, concurrent.futures as cf, os
SRC='/mnt/user-data/uploads/Website'
TALL='crop=ih*4/5:ih,scale=576:720:flags=lanczos'; WIDE='scale=1280:720:flags=lanczos'
clips=[('velvet','Velvet Skin.mov',68.52,TALL,WIDE),('figma','Josh Figma.mov',0.1,TALL,WIDE),
       ('demo','Demo Reel 2026.mov',3.6,'crop=642:803:(iw-642)/2:138,scale=576:720:flags=lanczos',WIDE),
       ('birthday','Birthday Draw_2026.mov',68.8,'crop=708:885:(iw-708)/2:39,scale=576:720:flags=lanczos','crop=iw:iw*9/16:0:0,scale=1280:720:flags=lanczos')]
def enc(src,start,vf,out,crf):
    fc=f"[0:v]{vf},format=yuv420p,split[a][b];[a]trim=0:3,setpts=PTS-STARTPTS[m];[b]trim=3:3.4,setpts=PTS-STARTPTS[t];[t][m]xfade=transition=fade:duration=0.4:offset=0,format=yuv420p[x]"
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(start),'-t','3.4','-i',src,'-filter_complex',fc,'-map','[x]','-an','-c:v','libaom-av1','-crf',str(crf),'-b:v','0','-cpu-used','5','-row-mt','1','-g','30',
      '-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv','-loop','0',out],check=True)
    return out
import sys
only=sys.argv[1:]
jobs=[]
if __name__=='__main__':
  with cf.ThreadPoolExecutor(4) as ex:
    for n,f,s,t,w in clips:
        if only and n not in only: continue
        jobs.append(ex.submit(enc,f'{SRC}/{f}',s,t,f'out/{n}-tall.avif',int(os.environ.get('CRF_T',30))))
        jobs.append(ex.submit(enc,f'{SRC}/{f}',s,w,f'out/{n}.avif',int(os.environ.get('CRF_W',32))))
    for j in jobs: print(j.result(), os.path.getsize(j.result())//1024,'KB')
