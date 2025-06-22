# 🤝 Contributing to Smart Network Controller (SNC)

Thanks for your interest in contributing to **Smart Network Controller (SNC)**! This document will guide you through the process of contributing code, documentation, or ideas to the project.

---

## 🧱 What is SNC?

SNC is a modular, framework-agnostic request orchestration layer designed to manage API calls intelligently — via prioritization, caching, concurrency control, and more. Built with scalability and developer experience in mind.

---

## 🙋‍♀️ How Can I Help?

We welcome contributions in all forms:

- 🧠 **Ideas & Discussions** – Share thoughts in [GitHub Discussions](https://github.com/YOUR-USERNAME/SNC/discussions)
- 🐛 **Bug Reports** – Found a bug? Open an issue with reproduction steps.
- 🧹 **Code Improvements** – Improve logic, fix edge cases, or optimize performance.
- 🪄 **New Features** – Add useful enhancements (e.g., telemetry hooks, offline sync).
- 📝 **Documentation** – Improve README, write tutorials, or add code comments.
- 🎨 **Developer Experience** – Add tools like devtools integration, tests, or playgrounds.

---

## 🛠 Project Setup

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR-USERNAME/snc.git
cd snc
npm install
````

### 2. Branching

Create a feature or fix branch:

```bash
git checkout -b feat/my-feature
```

### 3. Run the Build

Make sure everything compiles:

```bash
npm run build
```

Test your changes by writing minimal test/demo code inside `__tests__` or in the usage example.

---

## 🧪 Writing Good PRs

* Keep pull requests **focused and atomic**
* Add comments where code is tricky
* Use clear commit messages (e.g. `fix(queue): handle stuck retries`)
* Link related issues (e.g. `Closes #12`)
* Include unit tests if possible

---

## 🧼 Code Style

* Language: **TypeScript**
* Formatting: **Prettier**
* Linting: **ESLint**
* File naming: `camelCase` for files and functions
* Folder structure is modular — try to place things logically

Run formatter and linter before pushing:

```bash
npm run lint
npm run format
```

---

## 🏷️ Issue Labels to Look For

| Label              | Meaning                              |
| ------------------ | ------------------------------------ |
| `good first issue` | Great starting point for newcomers   |
| `help wanted`      | We need assistance on these          |
| `enhancement`      | Feature suggestions and improvements |
| `bug`              | Confirmed issues to resolve          |
| `discussion`       | Open-ended ideas needing feedback    |

---

## 📢 Code of Conduct

We follow a **positive, inclusive, and respectful** community philosophy. Please read the [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) before contributing.

---

## 📦 Publishing Strategy

SNC may be published to NPM in the future as a package (`@vishal/sncontroller`). Contributions that align with a clean API surface and modularity will be prioritized.

---

## 🙏 Thanks!

Whether it's a big feature or a typo fix — **every contribution counts**. Thank you for helping make SNC better for everyone.

—

Made with ☕️ & 💻 by Vishal Varshney
