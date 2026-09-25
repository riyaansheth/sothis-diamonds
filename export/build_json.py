"""Turn the raw WordPress export (raw/*.jsonl) into clean, WordPress-free JSON in data/.
Re-run after a fresh export: python3 build_json.py"""
import json, re, html, os, glob
from collections import defaultdict

RAW, OUT = 'raw', 'data'
os.makedirs(OUT, exist_ok=True)
UPLOADS = re.compile(r'https?://(?:www\.)?sothisdiamonds\.com/wp-content/uploads/')
LANGS = {'fr_BE': 'fr', 'nl_BE': 'nl', 'de_DE': 'de', 'it_IT': 'it', 'es_ES': 'es'}

def jl(name):
    return [json.loads(l) for l in open(f'{RAW}/{name}.jsonl', encoding='utf8') if l.strip()]

def save(name, data):
    with open(f'{OUT}/{name}.json', 'w', encoding='utf8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'{name}.json: {len(data)}')

def clean_html(s):
    s = re.sub(r'<!--\s*/?wp:.*?-->', '', s or '', flags=re.S)  # block editor comments
    s = UPLOADS.sub('/media/', s)
    return s.strip()

def text(s):
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', s or '')).split())

rows = jl('content')
by_id = {r['id']: r for r in rows}
meta = lambda r, k, d=None: (r.get('meta') or {}).get(k, d)

# media: attachment id -> local path under media/
media = {}
for r in rows:
    if r['type'] == 'attachment' and meta(r, '_wp_attached_file'):
        media[r['id']] = {'id': r['id'], 'path': 'media/' + meta(r, '_wp_attached_file'), 'mime': r['mime'],
                          'title': r['title'], 'alt': meta(r, '_wp_attachment_image_alt', '')}
img = lambda i: media.get(int(i))['path'] if str(i).isdigit() and int(i) in media else None

# translated slugs: original slug -> {lang: slug}
slugs = defaultdict(dict)
for s in jl('slugs'):
    if s['translated'] and s['lang'] in LANGS:
        slugs[s['original']][LANGS[s['lang']]] = s['translated']

# SEO title/description per post id and per permalink
seo_by_obj, seo_by_url = {}, {}
for s in jl('seo'):
    entry = {k: s[k] for k in ('title', 'description', 'noindex', 'og_image', 'canonical') if s.get(k)}
    if s['object_type'] == 'post':
        seo_by_obj[s['object_id']] = entry
    if s.get('permalink'):
        seo_by_url[s['permalink']] = entry

def terms(r, *taxes):
    return [t['name'] for t in (r.get('terms') or []) if t['tax'] in taxes]

def spec_table(content):
    """Product description is a <th>label</th><td>value</td> table -> dict."""
    pairs = re.findall(r'<th[^>]*>(.*?)</th>\s*<td[^>]*>(.*?)</td>', content or '', re.S)
    return {text(k): text(v) for k, v in pairs if text(v).lower() not in ('', '-', 'nan')}

def elementor_text(r):
    """Pull readable copy out of Elementor layout JSON, in page order."""
    try:
        data = json.loads(meta(r, '_elementor_data') or '[]')
    except ValueError:
        return []
    keys = ('title', 'editor', 'text', 'description_text', 'title_text', 'heading', 'content',
            'subtitle', 'button_text', 'tab_title', 'tab_content', 'testimonial_content', 'name', 'job')
    out = []
    def walk(node):
        if isinstance(node, dict):
            st = node.get('settings') or {}
            for k in keys:
                v = st.get(k)
                if isinstance(v, str) and text(v):
                    out.append({'widget': node.get('widgetType'), 'field': k, 'text': text(v)})
            for v in st.values():  # repeaters (lists of items)
                if isinstance(v, list):
                    for item in v:
                        if isinstance(item, dict):
                            for k in keys:
                                if isinstance(item.get(k), str) and text(item[k]):
                                    out.append({'widget': node.get('widgetType'), 'field': k, 'text': text(item[k])})
            for child in node.get('elements') or []:
                walk(child)
        elif isinstance(node, list):
            for n in node:
                walk(n)
    walk(data)
    return out

def video(r):
    m = re.search(r'upload_video_url";s:\d+:"([^"]+)"', meta(r, 'woodmart_wc_video_gallery') or '')
    return UPLOADS.sub('media/', m.group(1)) if m else None

# products
products = []
for r in rows:
    if r['type'] != 'product':
        continue
    gallery = [img(i) for i in (meta(r, '_product_image_gallery') or '').split(',') if img(i)]
    attrs = {t['tax'][3:]: t['name'] for t in (r.get('terms') or []) if t['tax'].startswith('pa_')}
    products.append({
        'id': r['id'], 'sku': meta(r, '_sku'), 'slug': r['slug'], 'title': r['title'], 'status': r['status'],
        'price': float(meta(r, '_price') or 0) or None,
        'regular_price': float(meta(r, '_regular_price') or 0) or None,
        'sale_price': float(meta(r, '_sale_price') or 0) or None,
        'currency': 'USD',  # FOX base currency; EUR is a converted display currency
        'stock': int(float(meta(r, '_stock') or 0)), 'in_stock': meta(r, '_stock_status') == 'instock',
        'categories': terms(r, 'product_cat'), 'tags': terms(r, 'product_tag'),
        'attributes': attrs, 'specs': spec_table(r['content']),
        'image': img(meta(r, '_thumbnail_id')), 'gallery': gallery, 'video': video(r),
        'short_description': clean_html(r['excerpt']),
        'created': r['date'], 'modified': r['modified'],
        'slugs': {'en': r['slug'], **slugs.get(r['slug'], {})}, 'seo': seo_by_obj.get(r['id'], {}),
    })
save('products', sorted(products, key=lambda p: p['created'], reverse=True))

# posts, pages, portfolio, reusable blocks
def doc(r):
    return {
        'id': r['id'], 'slug': r['slug'], 'title': html.unescape(r['title']), 'status': r['status'],
        'date': r['date'], 'modified': r['modified'], 'parent': r['parent'] or None,
        'excerpt': clean_html(r['excerpt']), 'content_html': clean_html(r['content']),
        'elementor_text': elementor_text(r),
        'featured_image': img(meta(r, '_thumbnail_id')),
        'categories': terms(r, 'category', 'project-cat'), 'tags': terms(r, 'post_tag'),
        'slugs': {'en': r['slug'], **slugs.get(r['slug'], {})}, 'seo': seo_by_obj.get(r['id'], {}),
    }
for kind, types in {'posts': ('post',), 'pages': ('page',), 'portfolio': ('portfolio',),
                    'blocks': ('cms_block', 'woodmart_slide', 'elementor_library', 'woodmart_size_guide')}.items():
    save(kind, [doc(r) | ({'type': r['type']} if kind == 'blocks' else {}) for r in rows if r['type'] in types])

save('media', sorted(media.values(), key=lambda m: m['path']))

# categories, tags and attribute values
save('taxonomies', [{'taxonomy': t['tax'], 'slug': t['slug'], 'name': html.unescape(t['name']),
                     'description': t['description'], 'parent': t['parent'] or None, 'count': t['count'],
                     'slugs': {'en': t['slug'], **slugs.get(t['slug'], {})}}
                    for t in jl('terms') if t['tax'] in ('product_cat', 'product_tag', 'category', 'post_tag')
                    or t['tax'].startswith('pa_')])

# menus
menu_names = {t['slug']: t['name'] for t in jl('terms') if t['tax'] == 'nav_menu'}
menus = defaultdict(list)
for r in rows:
    if r['type'] != 'nav_menu_item':
        continue
    target = by_id.get(int(meta(r, '_menu_item_object_id') or 0))
    menu = next((t['name'] for t in r.get('terms') or [] if t['tax'] == 'nav_menu'), '?')
    menus[menu].append({'id': r['id'], 'order': r['menu_order'],
                        'parent': int(meta(r, '_menu_item_menu_item_parent') or 0) or None,
                        'label': html.unescape(r['title'] or (target or {}).get('title', '')),
                        'url': meta(r, '_menu_item_url') or None,
                        'links_to': {'type': target['type'], 'slug': target['slug']} if target else None})
save('menus', {k: sorted(v, key=lambda i: i['order']) for k, v in menus.items()})

# forms: field definitions only (no submissions)
forms = []
for r in rows:
    if r['type'] == 'wpforms':
        f = json.loads(r['content'] or '{}')
        forms.append({'id': r['id'], 'title': r['title'], 'fields': [
            {k: v for k, v in fld.items() if k in ('id', 'type', 'label', 'required', 'choices', 'placeholder', 'description', 'size')}
            for fld in (f.get('fields') or {}).values()]})
save('forms', forms)

# UI/content string translations: {lang: {english: translated}}
for code, short in LANGS.items():
    save(f'translations_{short}', {t['o']: t['t'] for t in jl(f'tr_{code.lower()}')})

# SEO + search performance (for redirects and keeping rankings)
save('seo_by_url', seo_by_url)
save('search_pages', jl('gsc_pages'))
save('search_queries', jl('gsc_queries'))
