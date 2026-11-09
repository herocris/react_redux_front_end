import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

// Run after npm run build -- --manifest. Follow only static dependencies of
// the entry and its immediate bootstrap, never the protected lazy routes.
const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'));
const reachable = new Set();
function visit(key) {
    if (reachable.has(key)) return;
    assert.ok(manifest[key], `Missing manifest entry: ${key}`);
    reachable.add(key);
    for (const dependency of manifest[key].imports ?? []) visit(dependency);
}
visit('index.html');
visit('src/bootstrap.tsx');
const startup = new Set();
for (const key of reachable) {
    startup.add(manifest[key].file);
    for (const css of manifest[key].css ?? []) startup.add(css);
}
const files = [...new Set(Object.values(manifest).flatMap(entry => [entry.file, ...(entry.css ?? [])]))]
    .filter(file => /\.(js|css)$/.test(file));
const heavy = { charts: [], leaflet: [], dataGrid: [] };
const markers = { charts: /recharts-wrapper/, leaflet: /leaflet-container/, dataGrid: /MuiDataGrid/ };
const sizes = files.map(file => {
    const bytes = readFileSync(`dist/${file}`);
    if (file.endsWith('.js')) {
        for (const [name, pattern] of Object.entries(markers)) {
            if (pattern.test(bytes.toString())) heavy[name].push(file);
        }
    }
    return { file, bytes: bytes.length, gzip: gzipSync(bytes).length, startup: startup.has(file) };
});
for (const [name, chunks] of Object.entries(heavy)) {
    assert.ok(chunks.length, `No chunk identified for ${name}; review markers`);
    assert.ok(chunks.every(file => !startup.has(file)), `${name} loaded at startup`);
}
assert.ok(!sizes.some(entry => entry.startup && entry.file.endsWith('.css') &&
    /leaflet-container/.test(readFileSync(`dist/${entry.file}`, 'utf8'))), 'Leaflet CSS loaded at startup');
const sum = entries => entries.reduce((total, entry) => ({ bytes: total.bytes + entry.bytes,
    gzip: total.gzip + entry.gzip }), { bytes: 0, gzip: 0 });

// Analysis views do not render tables. Keep DataGrid out of their static graph,
// including shared chunks pulled in by a component barrel.
const routes = {};
for (const [name, key] of Object.entries({
    graph: 'src/modules/graph/views/GraphView.tsx',
    map: Object.keys(manifest).find(key => manifest[key].name === 'map'),
})) {
    const routeFiles = new Set();
    const visited = new Set();
    const walk = entryKey => {
        if (visited.has(entryKey)) return;
        assert.ok(manifest[entryKey], `Missing ${name} route manifest entry`);
        visited.add(entryKey);
        routeFiles.add(manifest[entryKey].file);
        for (const dependency of manifest[entryKey].imports ?? []) walk(dependency);
    };
    walk(key);
    assert.ok(heavy.dataGrid.every(file => !routeFiles.has(file)), `DataGrid loaded by ${name}`);
    routes[name] = sum(sizes.filter(entry => routeFiles.has(entry.file) && !entry.startup && entry.file.endsWith('.js')));
}
console.log(JSON.stringify({ startupJS: sum(sizes.filter(entry => entry.startup && entry.file.endsWith('.js'))),
    startupCSS: sum(sizes.filter(entry => entry.startup && entry.file.endsWith('.css'))),
    totalJS: sum(sizes.filter(entry => entry.file.endsWith('.js'))), routes, heavy, files: sizes }, null, 2));
