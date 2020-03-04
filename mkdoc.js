
const path = require('path');
const fs = require('fs');
const typedoc = require('typedoc');

const package = require('./package');

const sources = [
    path.resolve(__dirname, './src')
];

const options = {
    module: 'commonjs',
    target: 'es5',
    exclude: '**/node_modules/**/*.*',
    experimentalDecorators: true,
    excludeExternals: true,
    out: path.resolve(__dirname, `./doc/${package.name.replace(/@\w+\//g, '')}/${package.version}`),
    mode: 'modules',
    excludePrivate: true,
    excludeProtected: true,
    tsconfig: path.resolve(__dirname, './tsconfig.json'),
    theme: 'markdown',
    mdEngine: 'github'
};

const docApp = new typedoc.Application(options);
const src = docApp.expandInputFiles(sources);
const project = docApp.convert(src);

if (project) {
    docApp.generateDocs(project, options.out);
}
