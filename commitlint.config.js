module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [
      2,
      'never',
      [
        'lower-case',
        'start-case',
        'pascal-case',
        'upper-case',
        'camel-case',
        'kebab-case',
        'snake-case',
      ],
    ],
    'header-max-length': [0, 'always', 100],
    'subject-full-stop': [1, 'always'],
    'scope-case': [0, 'always'],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'improvement',
      ],
    ],
  },
}
