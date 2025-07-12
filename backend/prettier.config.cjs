module.exports = {
  printWidth: 100, // wrap after ~2-line IDE width
  tabWidth: 2, // stay consistent with JS & TS eco-system
  semi: true, // required by many Node runtimes & tooling
  singleQuote: true, // matches most TS style guides (Airbnb, ESLint default)
  trailingComma: 'all', // cleaner git-diffs & easier re-ordering
  arrowParens: 'avoid', // <fn> vs (fn) looks cleaner in callbacks
  bracketSpacing: true, // { a: 1 } not {a:1}
  endOfLine: 'lf', // avoids Windows/Unix line-ending churn in CI
};
