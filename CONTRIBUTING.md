# Contributing Guide

> 🌐 **日本語**: See [CONTRIBUTING_ja.md](CONTRIBUTING_ja.md)

Thank you for your interest in contributing to the Flutter Setup Tool!

## 🤝 How to Contribute

### Bug Reports

If you find a bug, please create an issue with the following information:

1. **Environment Information**

   - OS (macOS, Windows, Linux)
   - Node.js version
   - Flutter SDK version
   - Firebase CLI version

2. **Reproduction Steps**

   - Specific operation steps
   - Expected behavior
   - Actual behavior

3. **Error Logs**
   - Console error messages
   - Browser developer tools errors

### Feature Requests

We welcome new feature proposals! Please explain the following in an issue:

- Overview of the proposed feature
- Problems that the feature would solve
- If possible, implementation ideas or UI mockups

### Pull Requests

1. **Fork and Clone**

   ```bash
   git clone https://github.com/yokkomystery/yokoflu.git
   cd yokoflu
   npm install
   ```

2. **Create a Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Development**

   - Edit code
   - Test functionality (`npm run dev`)
   - Add tests if necessary

4. **Commit**

   ```bash
   git add .
   git commit -m "feat: description of feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Conventions

- Follow existing code style for TypeScript/JavaScript
- Follow `flutter_lints` recommendations for Dart code
- Use clear variable and function names
- Add comments for complex logic

## 🧪 Testing

- After changes, always generate a Flutter project to verify functionality
- Test both Firebase enabled/disabled scenarios
- Test each template (Counter, TODO, etc.)

## 🎨 Adding New Templates

When adding a new app template:

1. Create a new file in `src/templates/flutter/app_templates/`
2. Add to `APP_TEMPLATE_OPTIONS` in `src/config/templateOptions.ts`
3. Add configuration to `src/app/api/flutter-setup/app-template-utils.ts`

## 🚀 Adding New Advanced Features

When adding a new advanced feature:

1. Create necessary template files in `src/templates/flutter/`
2. Add to `ADVANCED_FEATURE_OPTIONS` in `src/config/templateOptions.ts`
3. Add implementation to `src/app/api/flutter-setup/advanced-features-utils.ts`
4. Implement processing to add dependencies to pubspec.yaml if necessary

## 📧 Questions or Consultation

If you have any questions, please ask in an issue or feel free to contact us at contact@mysterylog.com.

---

We appreciate your contributions! 🙏

