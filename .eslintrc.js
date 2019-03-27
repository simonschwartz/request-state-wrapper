module.exports = {
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "jest": true,
  },
  "plugins": [
    "jest",
    "flowtype",
    "prettier",
  ],
  "extends": "standard",
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "prettier/prettier": "error",
    "comma-dangle": "off",
    "space-before-function-paren": "off",
  }
}
