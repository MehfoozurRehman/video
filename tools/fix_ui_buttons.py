"""Repair elements whose styles the design export expanded into hundreds of `unset` properties.

  python3 -I tools/fix_ui_buttons.py src/assets/ui/NN.html ...

The expansion keeps the element's real `padding` and `border-radius`, but later in the same style it
also writes the logical longhands (`padding-inline-start: unset`, `border-start-start-radius: unset`, ...),
which reset them. Pills turn into hard rectangles squeezed around their label. The real values are
re-asserted at the end of the style so they win again.
"""
import re, sys

PROPS = ('padding', 'border-radius', 'margin', 'border', 'border-top', 'border-right', 'border-bottom', 'border-left')


def fix(style):
    keep = [f'{k}:{v}' for k, v in re.findall(r'(?:^|;)\s*([\w-]+):\s*([^;]+)', style) if k in PROPS and v.strip() != 'unset']
    return style.rstrip('; ') + ';' + ';'.join(keep) if keep else style


for p in sys.argv[1:]:
    s, n = open(p).read(), 0
    def rep(m):
        global n
        n += 1
        return m.group(1) + fix(m.group(2)) + '"'
    s = re.sub(r'(<[a-z]+[^>]*?style=")([^"]{3000,})"', rep, s)
    open(p, 'w').write(s)
    print(p, n, 'elements re-asserted')
