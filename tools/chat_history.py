"""Readable Markdown transcript of a Claude Code session log (.jsonl).

  python3 -I tools/chat_history.py <session.jsonl> <out.md>

Keeps every message from the user and every reply, plus each tool call and a short excerpt of its result.
Internal reasoning, images and very large outputs are left out; long tool inputs/outputs are shortened.
Credentials (API keys, tokens) and e-mail addresses are masked.
"""
import json, re, sys

src, out = sys.argv[1:3]
MASK = [(re.compile(r'(gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9-]{20,}|xox[abp]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16})'), '[credential removed]'),
        (re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'), '[email removed]'),
        (re.compile(r'data:[a-z]+/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]{100,}'), '[inline data]')]
def clean(s):
    for r, t in MASK: s = r.sub(t, s)
    return s
def cut(s, n):
    s = s.strip()
    return s if len(s) <= n else s[:n] + f'\n… [{len(s) - n:,} more characters]'
def fence(s):
    return '````\n' + s.replace('````', "'''") + '\n````'

lines, n_user, n_reply, n_tool = [], 0, 0, 0
lines.append('# ZOOD Video A — full chat history\n\nEvery message from the user and every reply from Claude, with each tool step (command, file edit, render) and an excerpt of its result, in order. Internal reasoning, images and very large outputs are summarised; credentials and e-mail addresses are masked.\n')
for raw in open(src):
    try: d = json.loads(raw)
    except Exception: continue
    t, m, ts = d.get('type'), d.get('message') or {}, (d.get('timestamp') or '')[:16].replace('T', ' ')
    if t not in ('user', 'assistant') or d.get('isMeta'): continue
    content = m.get('content')
    if isinstance(content, str): content = [{'type': 'text', 'text': content}]
    for x in content or []:
        if not isinstance(x, dict): continue
        k = x.get('type')
        if t == 'user' and k == 'text':
            txt = clean(x['text'])
            if txt.startswith('<system-reminder>') or txt.startswith('<task-notification>') or '[SYSTEM NOTIFICATION' in txt[:200]:
                lines.append(f'\n> _System notice ({ts})_: ' + cut(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', txt)), 300) + '\n'); continue
            label = 'Session summary (context carried over)' if txt.startswith('This session is being continued') else 'User'
            n_user += label == 'User'
            lines.append(f'\n---\n\n## {label} — {ts}\n\n' + cut(txt, 60000) + '\n')
        elif t == 'user' and k == 'image':
            lines.append('\n_[image attached]_\n')
        elif t == 'user' and k == 'tool_result':
            r = x.get('content')
            if isinstance(r, list): r = '\n'.join(y.get('text', '[image]') if isinstance(y, dict) else str(y) for y in r)
            lines.append('<details><summary>result</summary>\n\n' + fence(cut(clean(str(r or '')), 1500)) + '\n</details>\n')
        elif t == 'assistant' and k == 'text' and x.get('text', '').strip():
            n_reply += 1
            lines.append(f'\n## Claude — {ts}\n\n' + clean(x['text']) + '\n')
        elif t == 'assistant' and k == 'tool_use':
            n_tool += 1
            inp = x.get('input') or {}
            desc = inp.get('description') or inp.get('file_path') or inp.get('query') or ''
            body = inp.get('command') or inp.get('content') or inp.get('new_string') or inp.get('prompt') or json.dumps(inp, ensure_ascii=False)
            lines.append(f'\n**Tool · {x.get("name")}** — {clean(str(desc))}\n\n' + fence(cut(clean(str(body)), 2500)) + '\n')
open(out, 'w').write('\n'.join(lines))
print(f'{n_user} user messages, {n_reply} replies, {n_tool} tool steps')
