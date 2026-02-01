/** @type {import("stylelint").Config} */
export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-selector-bem-pattern'],
  rules: {
    'declaration-block-no-redundant-longhand-properties': null,
    'selector-class-pattern': null,
    'plugin/selector-bem-pattern': {
      preset: 'bem',
    },
  },
};
