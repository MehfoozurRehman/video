"""Turn the generated / client clips into frame sequences the film can seek frame-accurately.

  python3 -I tools/prep_clips.py <clips.json> <out_dir>

clips.json: [{"name", "src", "mode": "plain"|"key"|"screen", "t0", "t1", "crop": [x, y, w, h], "spill": 1}]
  plain   JPEG frames at the source resolution and frame rate (no scaling, no frame-rate change)
  key     green removed -> WebP with alpha
  screen  like key, plus the 4 corners of the green screen per frame (for mapping app UI onto it)
Writes <out_dir>/<name>/fNNNN.(jpg|webp) and <out_dir>/clips.js (frame counts, fps, size, screen quads).
"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
from scipy.spatial import ConvexHull

cfg = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
meta = {}


def probe(src):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate',
                        '-of', 'csv=p=0', src], capture_output=True, text=True).stdout.strip().split(',')
    a, b = r[2].split('/')
    return int(r[0]), int(r[1]), float(a) / float(b)


def frames(src, w, h):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    n = w * h * 3
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        yield np.frombuffer(b, np.uint8).reshape(h, w, 3)


def key(a, t0, t1, spill, border=False, shadow=None, ratio=None):
    f = a.astype(np.float32)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    d = g - np.maximum(r, b)
    if ratio:  # hue-based key for dark / unevenly lit green: uses green dominance relative to brightness
        k = d / (g + 8)
        alpha = np.clip((ratio[1] - k) / (ratio[1] - ratio[0]), 0, 1)
    else:
        alpha = np.clip((t1 - d) / (t1 - t0), 0, 1)
    if border:  # only green connected to the frame edge is background (keeps plants etc. inside the subject)
        lab, n = ndimage.label(ndimage.binary_opening(alpha < 0.5, iterations=2))
        edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        bgm = np.isin(lab, list(edge))
        bgm = ndimage.binary_dilation(bgm, iterations=3)
        alpha = np.where(bgm, alpha, np.maximum(alpha, (alpha < 1) * 1.0))
    if shadow:  # background-coloured pixels become a soft black shadow instead of a hole
        lum = f.mean(-1)
        sh = np.clip(1 - lum / shadow, 0, 1) ** 0.8 * 0.85
        keyed = alpha < 1
        a_sh = np.where(keyed, np.maximum(alpha, sh * (1 - alpha)), alpha)
        f = np.where((keyed & (alpha < 0.5))[..., None], f * 0.15, f)
        r, g, b = f[..., 0], f[..., 1], f[..., 2]
        alpha = a_sh
    # despill: pull green down to the level of the other channels near the key
    near = ndimage.maximum_filter((alpha < 0.98).astype(np.uint8), size=9) > 0 if spill == 1 else np.ones_like(alpha, bool)
    lim = np.maximum(r, b) + 4
    g2 = np.where(near & (g > lim), lim, g)
    rgb = np.stack([r, g2, b], -1)
    return np.dstack([rgb, alpha * 255]).clip(0, 255).astype(np.uint8), alpha


def _reduce(pts, k=4):
    pts = [tuple(p) for p in pts]
    while len(pts) > k:  # Visvalingam: drop the vertex whose triangle is smallest
        areas = []
        for i in range(len(pts)):
            (x1, y1), (x2, y2), (x3, y3) = pts[i - 1], pts[i], pts[(i + 1) % len(pts)]
            areas.append(abs((x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1)))
        pts.pop(int(np.argmin(areas)))
    return pts


def quad(mask, min_area):
    m = mask
    m = ndimage.binary_closing(m, iterations=6)
    lab, n = ndimage.label(m)
    if n == 0:
        return None
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    k = int(np.argmax(sizes)) + 1
    if sizes[k - 1] < min_area:
        return None
    ys, xs = np.nonzero(lab == k)
    P = np.stack([xs, ys], 1).astype(float)
    hull = ConvexHull(P)
    q = np.array(_reduce(P[hull.vertices]))
    # order TL, TR, BR, BL: sort by angle around the centre, start at the point nearest the top-left
    q = q[np.argsort(q[:, 1])]
    top, bot = q[:2][np.argsort(q[:2, 0])], q[2:][np.argsort(q[2:, 0])]
    return [top[0].tolist(), top[1].tolist(), bot[1].tolist(), bot[0].tolist()]  # TL, TR, BR, BL


for c in cfg:
    w, h, fps = probe(c['src'])
    d = os.path.join(OUT, c['name'])
    os.makedirs(d, exist_ok=True)
    for old in os.listdir(d):
        os.remove(os.path.join(d, old))
    mode = c.get('mode', 'plain')
    cx, cy, cw, ch = c.get('crop', [0, 0, w, h])
    quads, n = [], 0
    for a in frames(c['src'], w, h):
        n += 1
        a = a[cy:cy + ch, cx:cx + cw]
        if mode == 'plain':
            Image.fromarray(a).save(f'{d}/f{n:04d}.jpg', quality=95, subsampling=0)
            continue
        if mode == 'recolor':  # green background -> brand navy, keeping its light and shadow (no matte edges)
            f = a.astype(np.float32)
            dd = f[..., 1] - np.maximum(f[..., 0], f[..., 2])
            k = dd / (f[..., 1] + 8)
            w = np.clip((k - 0.06) / (0.18 - 0.06), 0, 1)
            lab, _ = ndimage.label(ndimage.binary_opening(w > 0.5, iterations=2))
            edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
            bgm = ndimage.gaussian_filter(ndimage.binary_dilation(np.isin(lab, list(edge)), iterations=4).astype(np.float32), 3)
            w = w * bgm
            lum = f.mean(-1, keepdims=True)
            base = np.array(c.get('to', [12, 40, 86]), np.float32)
            tgt = base * (lum / c.get('ref', 54)) ** 0.9
            out = f * (1 - w[..., None]) + tgt * w[..., None]
            Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(f'{d}/f{n:04d}.jpg', quality=95, subsampling=0)
            continue
        rgba, alpha = key(a, c.get('t0', 30), c.get('t1', 70), c.get('spill', 1), c.get('border', False), c.get('shadow'), c.get('ratio'))
        if c.get('soft'):
            al = ndimage.gaussian_filter(ndimage.grey_erosion(rgba[..., 3], size=3).astype(float), c['soft'])
            rgba[..., 3] = al.clip(0, 255).astype(np.uint8)
        if mode == 'screen':
            f = a.astype(np.int16)
            q = quad((f[..., 1] - np.maximum(f[..., 0], f[..., 2])) > c.get('qd', 45), cw * ch * c.get('min_area', 0.01))
            quads.append(q)
            # transparency only inside the (slightly grown) screen quad: reflections on hands/sleeves stay solid
            inside = np.zeros((ch, cw), bool)
            if q:
                m = Image.new('L', (cw, ch), 0)
                cq = np.array(q).mean(0)
                ImageDraw.Draw(m).polygon([tuple(cq + (np.array(p) - cq) * 1.04) for p in q], fill=255)
                inside = np.array(m) > 0
            rgba[..., 3] = np.where(inside, rgba[..., 3], 255)
        Image.fromarray(rgba, 'RGBA').save(f'{d}/f{n:04d}.webp', quality=92, method=4)
    if quads:  # fill gaps and smooth the corners over time (5-frame median)
        good = [q for q in quads if q]
        last = good[0] if good else None
        for i, q in enumerate(quads):
            if q: last = q
            else: quads[i] = last
        Q = np.array(quads, float)
        S = Q.copy()
        for i in range(len(Q)):
            S[i] = np.median(Q[max(0, i - 2):i + 3], axis=0)
        quads = S.round(1).tolist()
    meta[c['name']] = {'n': n, 'fps': fps, 'w': cw, 'h': ch, 'ext': 'jpg' if mode in ('plain', 'recolor') else 'webp', **({'quads': quads} if quads else {})}
    print(c['name'], n, 'frames', f'{cw}x{ch}', fps, 'fps', mode, flush=True)

prev = {}
js = os.path.join(OUT, 'clips.js')
if os.path.exists(js):
    prev = json.loads(open(js).read().split('=', 1)[1].rstrip(';\n'))
prev.update(meta)
open(js, 'w').write('const GEN = ' + json.dumps(prev) + ';\n')
