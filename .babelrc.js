module.exports = {
  presets: ['@babel/preset-env', ['next/babel', { 'preset-react': { runtime: 'automatic' } }]],
  plugins: [
    'babel-plugin-macros',
    '@babel/plugin-transform-runtime',
    ['styled-components', { ssr: true }],
    ['module-resolver', { root: ['./'] }],
  ],
};