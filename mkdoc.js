
const path = require('path');
const typedoc = require('typedoc');
const package = require('./package');

const options = {
    mode: 'modules',
    logger: 'none',
    target: 'ES2015',
    module: 'CommonJS',
    experimentalDecorators: true,
    exclude: '**/node_modules/**/*.*',
    out: path.resolve(__dirname, `./doc/${package.name.replace(/@\w+\//g, '')}/${package.version}`),
}

const app = new typedoc.Application();

// If you want TypeDoc to load tsconfig.json / typedoc.json files
app.options.addReader(new typedoc.TSConfigReader());
app.options.addReader(new typedoc.TypeDocReader());

app.bootstrap(options);

const project = app.convert(app.expandInputFiles([
    path.resolve(__dirname, './src')
]));

if (project) {
    const outputDir = options.out;
    app.generateDocs(project, outputDir);
    app.generateJson(project, outputDir + '/documentation.json');
}
