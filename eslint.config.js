import js from '@eslint/js'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/**
 * ESLint (sección 16 del PRD). Además de las reglas recomendadas, convierte en errores de lint las
 * prohibiciones del PRD para que no dependan solo de la revisión manual.
 */
export default tseslint.config(
  { ignores: ['dist', 'coverage', 'public/mockServiceWorker.js'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat['recommended-latest'],
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // FE-011 / NFR-FE-005: sin any.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Los manejadores de eventos de React reciben promesas a propósito (react-hook-form, navigate).
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      // FE-013 / NFR-FE-004: nada de tokens ni respuestas en consola.
      'no-console': ['error', { allow: ['error'] }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react-router-dom', message: 'Eliminado en v8: importa desde "react-router".' },
            { name: 'axios', message: 'Usa fetch nativo a través de src/lib/http.ts.' },
          ],
        },
      ],
      // El token nunca va a localStorage ni a cookies (12.2).
      'no-restricted-globals': [
        'error',
        {
          name: 'localStorage',
          message: 'El token vive en memoria y sessionStorage, nunca en localStorage.',
        },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'document', property: 'cookie', message: 'No se usan cookies para el token.' },
        { object: 'React', property: 'FC', message: 'Sin React.FC: tipa las props con interface.' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Sin enum de TS: usa uniones literales o z.enum.',
        },
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message:
            'Prohibido dangerouslySetInnerHTML: los textos de la API se renderizan como texto.',
        },
        {
          selector: "ImportSpecifier[imported.name='FC']",
          message: 'Sin FC: tipa las props con interface.',
        },
        {
          // FE-008: `bg-${color}-500` no lo detecta Tailwind; usa mapas con clases completas.
          selector:
            "JSXAttribute[name.name='className'] TemplateLiteral[expressions.length>0] > TemplateElement[value.raw=/(^|\\s)[a-z:-]*(bg|text|border|from|to|via|ring|fill|stroke|outline)-$/]",
          message: 'Clase Tailwind dinámica: usa un Record<Variante, string> con clases completas.',
        },
      ],
    },
  },
  {
    // Pruebas y mocks: el backend falso y los helpers de prueba no son código de la UI.
    files: ['src/test/**/*.{ts,tsx}'],
    rules: {
      // Las pruebas leen localStorage para comprobar que el token NO está ahí (QT-FE-007).
      'no-restricted-globals': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['*.config.{js,ts}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },
)
