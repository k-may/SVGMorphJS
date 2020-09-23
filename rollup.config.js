import {terser} from 'rollup-plugin-terser';

export default {
    input: 'src/Index.js',
    output: [
        {
            file: 'dist/svgmorph.js',
            format: 'es'
        },
        {
            file: 'dist/svgmorph.min.js',
            compact: true,
            format: 'es',
            plugins: [terser()]
        }]
};