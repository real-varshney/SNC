# 🚦 Smart Network Controller (SNC)

**Smart Network Controller (SNC)** is a modular, framework-agnostic request management system built in TypeScript. It intelligently manages API calls in modern web applications by introducing priority-based queuing, in-memory and persistent caching, controlled concurrency, and smooth orchestration — all aimed at reducing network overhead and improving responsiveness.

---

## 🚀 Features

- ✅ **Priority-based global request queue** (LOW → CRITICAL)
- ⚡ **Concurrent request execution** (configurable limit)
- 🔁 **Retry and timeout support**
- 🧠 **Cache-first design** using:
  - LRU-style in-memory cache
  - Persistent cache via IndexedDB
- 📡 **Framework-agnostic**: Works with any JS/TS frontend or backend
- 🧩 **Modular components**: `executor`, `queue`, `cache`, `orchestrator`, etc.
- 🔍 **Unique ID → response mapping**
- 🚀 **Prefetch and fallback URL support**
- 🧪 Built-in hooks for future extensions like telemetry and analytics

---

## 🧩 Project Structure

```

/src
├── orchestrator/         # Entry point for requests (snc.post, snc.get, etc.)
├── data-manager/         # In-memory and IndexedDB cache handlers
├── executor/             # Fetch-based request executor with concurrency handling
├── queue/                # Priority queue with subscriptions and triggers
├── mapping/              # Tracks active requests and their resolution
├── config.ts             # Global config (timeouts, cache size, concurrency, etc.)
├── globaltypes.ts        # Shared types across modules
├── utils.ts              # Helper functions for hashing, keys, and transformation

````

---

## 🧪 Request Lifecycle

### PART 1 – Queuing

1. `snc.post(...)` creates a `SNCRequest`.
2. The **Orchestrator** transforms it into a `NetworkRequest`.
3. **DataManager** checks for cached response (Memory → IndexedDB).
4. If not cached, it's enqueued in the **GlobalQueue**.

### PART 2 – Execution

5. The **Executor** listens for new queue items and executes them with concurrency logic.
6. The result is returned to the caller via **Mapping** module.
7. The result is optionally cached for future requests.

---

## 📦 Installation

```bash
npm install
````

If using persistent storage:

```bash
npm install idb
```

---

## 🛠 Usage

### Sending a request

```ts
import { snc } from './orchestrator';

const result = await snc.post('/api/user', {
  body: { id: 123 },
  priority: 8,
  cache: true,
});
```

### Custom Configuration (`config.ts`)

```ts
export const CONFIG = {
  MEMORY_CACHE_MAX_SIZE: 100, // Number of items
  MAX_CONCURRENT_REQUESTS: 5, // Parallel requests
  DEFAULT_TIMEOUT: 15000,     // In ms
};
```

---

## 🔁 Priority Levels

```ts
export enum SNCRequestPriority {
  LOW = 0,
  NORMAL = 5,
  HIGH = 8,
  CRITICAL = 10
}
```

Higher values are dequeued and executed first.

---

## 💾 Caching Strategy

### ✅ In-Memory (`MemoryCache`)

* Fast LRU cache
* Max size and `lastUsed` metadata support

### ✅ Persistent (`IndexedDB`)

* Long-term caching via `idb`
* Used for `prefetch` and offline-first scenarios

---

## 👷 Components Overview

| Module           | Responsibility                                     |
| ---------------- | -------------------------------------------------- |
| **Orchestrator** | Converts request and manages full lifecycle        |
| **DataManager**  | Handles memory and persistent cache                |
| **MemoryCache**  | LRU in-memory wrapper around Cache API             |
| **Queue**        | Global request queue with priority                 |
| **Executor**     | Executes requests with concurrency and retry logic |
| **Mapping**      | Maps unique IDs to resolve/reject handlers         |
| **Utils**        | Shared helpers like hashing, key generation        |
| **Config**       | Limits, TTLs, size bounds, etc.                    |

---

## 🧠 Advanced Features

* Prefetch support (`prefetch: true`)
* Retry on failure (`retry: 3`)
* Timeout control (`timeout: 5000`)
* Fallback URLs (`fallbackUrls: [...]`)
* Infinite scrolling support (`infiniteScroll: true`)
* Pagination hooks (`pagination: true`)

---

## 🔄 Future Enhancements

* ⏹ Abortable requests via `AbortController`
* 📊 Telemetry hooks for performance tracking
* 👷‍♂️ Web worker support for background queue execution
* 🌐 Offline-first support with background sync
* 🧩 Devtools integration for real-time inspection

---

## 🤝 Contributing

Got ideas to improve SNC? Fork the repo and open a PR!

This system is designed to be modular — easy to plug in your own executor, cache layer, or analytics.

---

## 📝 License

MIT © Vishal Varshney

---

## 👋 Author

**Vishal Varshney**
Java Backend Developer & Systems Engineer
Crafting clean, smart, and scalable infrastructure 🚀
