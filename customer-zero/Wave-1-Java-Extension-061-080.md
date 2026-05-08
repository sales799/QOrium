# Wave 1: Java Extension Questions 061–080

**STATUS:** AI-drafted v0.6 EXTENSION (continues `Wave-1-Java-Extension-021-040.md` and `041-060.md`). SME Lead validation pending.

**Scope:** 20 questions on senior Java topics: Project Loom virtual threads, Records, Pattern matching, Sealed classes, Java Modules, GraalVM native-image, ZGC + Shenandoah, JMH benchmarking, Reactive Streams, Java 21 LTS features, JEP-450+, performance tuning, Spring Boot 3.x patterns.

**Difficulty Distribution:** 3 Easy / 9 Medium / 6 Hard / 2 Very Hard.
**Format Distribution:** 12 MCQ / 4 Code / 2 Design / 2 Case-Study.

---

## QUESTION 61: Project Loom — Virtual Threads

**question_id:** QOR-JAVA-061
**skill_id:** senior-java
**sub_skill_id:** virtual-threads
**format:** MCQ
**difficulty_b:** -1.0 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** OpenJDK Project Loom + JEP 444 (Java 21)

**body:**

What's the key difference between virtual threads (Java 21+) and platform threads?

**options:**

- A) Virtual threads are mounted on platform threads via JVM scheduler; suspended-on-blocking-IO virtual thread releases the platform thread; supports millions of threads on commodity hardware (vs ~5K platform threads); dramatically improves IO-bound concurrency
- B) Virtual threads are faster for CPU work
- C) Virtual threads are deprecated
- D) Same as platform threads, just renamed

**answer_key:**

A — Virtual threads (JEP 444, GA in Java 21):
- Lightweight: ~1KB stack vs ~1MB for platform thread.
- Mounted on platform thread (carrier); blocking IO unmounts; carrier serves another virtual thread.
- Result: 1M+ concurrent IO-bound tasks on commodity hardware.
- Same `Thread` API; existing `synchronized` + `BlockingQueue` work.
- For CPU-bound work: no benefit (still bound by cores).

(B), (C), (D) wrong. References: OpenJDK JEP 444; Java 21 documentation.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-java-v0.6-061-seed-2a8f1c4e
**variant_seed:** qorium-java-v0.6-2026-05-07-061
**bias_check_notes:** No bias.

---

## QUESTION 62: Java Records

**question_id:** QOR-JAVA-062
**skill_id:** senior-java
**sub_skill_id:** records
**format:** MCQ
**difficulty_b:** -0.8 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** JEP 395 (Java 16)

**body:**

What does `record Point(int x, int y) {}` provide automatically?

**options:**

- A) Constructor `Point(int x, int y)`; accessor methods `x()` + `y()` (NOT `getX()`/`getY()`); `equals()` + `hashCode()` based on components; `toString()` formatted as `Point[x=1, y=2]`; final + immutable; concise data carriers
- B) Just an empty class
- C) Lombok-style getters + setters
- D) Generic placeholder class

**answer_key:**

A — Java Records (JEP 395, GA in Java 16):
- Compact constructor + canonical constructor.
- Accessor methods named after components (no `get` prefix).
- Auto-generated `equals()` based on component equality.
- Auto-generated `hashCode()`.
- Auto-generated `toString()`.
- Final class; cannot extend; immutable by default.
- Use case: data transfer objects, value carriers.

References: JEP 395; Java 16 docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-java-v0.6-062-seed-9c4d2a8e
**variant_seed:** qorium-java-v0.6-2026-05-07-062
**bias_check_notes:** No bias.

---

## QUESTION 63: Pattern Matching for switch

**question_id:** QOR-JAVA-063
**skill_id:** senior-java
**sub_skill_id:** pattern-matching
**format:** MCQ
**difficulty_b:** -0.5 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** JEP 441 (Java 21)

**body:**

What does pattern-matching `switch` (Java 21) enable?

**options:**

- A) Type-pattern + record-deconstruction in switch arms; exhaustiveness checking for sealed hierarchies; eliminates instanceof + cast; e.g., `switch (shape) { case Circle c -> Math.PI * c.r() * c.r(); case Square s -> s.side() * s.side(); }`
- B) Same as old switch, just looks different
- C) Only works with strings
- D) Deprecated

**answer_key:**

A — Pattern matching for switch (JEP 441, GA in Java 21):
- Type patterns: `case Circle c -> ...` (binds to `c`, no cast needed).
- Record deconstruction: `case Point(int x, int y) -> ...`.
- `when` clauses for guards.
- Exhaustiveness checking on sealed hierarchies.
- Replaces verbose if-else-instanceof chains.

References: JEP 441; Java 21 docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-java-v0.6-063-seed-3a8c1f4e
**variant_seed:** qorium-java-v0.6-2026-05-07-063
**bias_check_notes:** No bias.

---

## QUESTION 64: Sealed Classes

**question_id:** QOR-JAVA-064
**skill_id:** senior-java
**sub_skill_id:** sealed-classes
**format:** MCQ
**difficulty_b:** 0.3 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** JEP 409 (Java 17)

**body:**

What does `sealed interface Shape permits Circle, Square, Triangle {}` enable?

**options:**

- A) Restricts which classes can implement Shape (only Circle, Square, Triangle); enables exhaustiveness checking in pattern-matching switch (compiler verifies all 3 cases handled); useful for ADT-style design (algebraic data types)
- B) Makes the interface immutable
- C) Marks for serialization
- D) Forbids inheritance entirely

**answer_key:**

A — Sealed classes/interfaces (JEP 409, GA in Java 17):
- `sealed ... permits X, Y, Z` restricts implementations.
- Subclasses must be `final`, `sealed`, or `non-sealed`.
- Enables compiler exhaustiveness checking on pattern-matching switch.
- Foundation for algebraic data types (ADT) in Java.

References: JEP 409; Java 17 docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-java-v0.6-064-seed-7c4d2a1f
**variant_seed:** qorium-java-v0.6-2026-05-07-064
**bias_check_notes:** No bias.

---

## QUESTION 65: Java Modules (JPMS)

**question_id:** QOR-JAVA-065
**skill_id:** senior-java
**sub_skill_id:** java-modules
**format:** MCQ
**difficulty_b:** 0.5 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Java Module System (Java 9+)

**body:**

A module-info.java declares `requires java.sql;` + `exports com.qorium.api;`. What does this tell the JVM?

**options:**

- A) The module depends on `java.sql` (transitively reachable) and exposes only `com.qorium.api` package to other modules. Stronger encapsulation than classpath; classes outside `com.qorium.api` are inaccessible from other modules even if `public`
- B) Just a comment for IDE
- C) Marks the module for deprecation
- D) Compresses module classes

**answer_key:**

A — Java Platform Module System (JPMS, Java 9+):
- `requires` declares dependency.
- `exports` declares which packages are accessible to other modules.
- Stronger than classpath encapsulation: `public` classes in non-exported packages are inaccessible from outside the module.
- `requires transitive` makes the dependency available to dependents.
- `opens` enables runtime reflection.

References: Java 9 Module System Reference.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-java-v0.6-065-seed-1d4f8a3c
**variant_seed:** qorium-java-v0.6-2026-05-07-065
**bias_check_notes:** No bias.

---

## QUESTION 66: GraalVM Native Image

**question_id:** QOR-JAVA-066
**skill_id:** senior-java
**sub_skill_id:** graalvm-native
**format:** MCQ
**difficulty_b:** 0.6 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** GraalVM Documentation

**body:**

What's the trade-off of GraalVM native-image vs JVM mode?

**options:**

- A) Native: ~50ms startup vs ~1s JVM (10-20x faster); ~10x lower memory at runtime; fixed memory (no GC overhead). Trade-off: compile-time closed-world assumption (no dynamic reflection without configuration); slower peak throughput; limited dynamic features (e.g., dynamic class loading, runtime bytecode generation). Use case: serverless, CLI tools, ARM containers
- B) Native is always faster
- C) JVM is always faster
- D) Native and JVM identical

**answer_key:**

A — GraalVM native-image trade-offs:
- AOT compilation → standalone executable.
- ~50ms cold start (vs ~1s JVM).
- ~10x lower memory at runtime.
- Closed-world: all reflection / dynamic loading must be configured at build time.
- Cost: slower peak throughput than HotSpot JIT (no profile-guided optimisation post-warmup).

Use cases: AWS Lambda, Cloud Run, CLI tools, ARM containers. Not suitable for: dynamic class loading, agent-based monitoring, hot reload.

References: GraalVM Native Image Documentation.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-java-v0.6-066-seed-9a3c2f7b
**variant_seed:** qorium-java-v0.6-2026-05-07-066
**bias_check_notes:** No bias.

---

## QUESTION 67: ZGC vs G1GC vs Shenandoah

**question_id:** QOR-JAVA-067
**skill_id:** senior-java
**sub_skill_id:** garbage-collection
**format:** MCQ
**difficulty_b:** 0.7 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** OpenJDK GC Documentation

**body:**

For a low-latency Java service with 100GB heap requirement, which GC is canonical?

**options:**

- A) ZGC — designed for low-latency on heaps up to 16TB; sub-millisecond pause times; concurrent collection (no stop-the-world); slightly more CPU overhead than G1; default-capable since Java 17. Alternative: Shenandoah (Red Hat) — similar properties, also concurrent.
- B) G1GC — fine for 100GB but pauses scale with heap size; ~50-200ms pauses at 100GB
- C) ParallelGC — best for batch workloads, not low-latency
- D) Serial GC — single-threaded; not for production

**answer_key:**

A — ZGC + Shenandoah are designed for ultra-low pause times on large heaps:
- ZGC: ≤1ms pauses; 16TB max heap; concurrent-everything.
- Shenandoah: similar, Red Hat origin; in OpenJDK.
- G1GC: pauses scale with heap; OK for 10-50GB; degrades at 100GB+.
- ParallelGC: high throughput but stop-the-world.

Trade-off: ZGC + Shenandoah have ~10-15% CPU overhead vs G1; worth it for low-latency.

References: OpenJDK ZGC + Shenandoah Documentation.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-java-v0.6-067-seed-3d8a4f2c
**variant_seed:** qorium-java-v0.6-2026-05-07-067
**bias_check_notes:** No bias.

---

## QUESTION 68: JMH Microbenchmarking

**question_id:** QOR-JAVA-068
**skill_id:** senior-java
**sub_skill_id:** jmh-benchmarking
**format:** MCQ
**difficulty_b:** 0.7 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** JMH Documentation

**body:**

Why is JMH (Java Microbenchmark Harness) preferred over `System.currentTimeMillis()` for measuring code performance?

**options:**

- A) JMH handles JIT warmup, dead-code elimination, loop unrolling, GC noise + provides statistical confidence intervals; simple millis-based timing produces wildly inaccurate results because of JIT optimisation patterns + GC interruptions
- B) JMH is just a fancy wrapper around currentTimeMillis
- C) currentTimeMillis is more accurate
- D) JMH only works with Spring

**answer_key:**

A — JMH addresses JVM-specific microbenchmark pitfalls:
- JIT warmup: runs N iterations before measurement (hot code is compiled).
- Dead-code elimination: ensures benchmark output is consumed (`@Blackhole`).
- Loop unrolling: prevents loop-induced bias.
- GC noise: configurable warmup + measurement counts to spot variance.
- Statistical confidence: standard error + percentiles.
- Sample mode (continuous benchmarking) + average mode.

References: JMH Documentation; OpenJDK JMH Tutorials.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-java-v0.6-068-seed-7c4a8f1e
**variant_seed:** qorium-java-v0.6-2026-05-07-068
**bias_check_notes:** No bias.

---

## QUESTION 69: Reactive Streams (Project Reactor)

**question_id:** QOR-JAVA-069
**skill_id:** senior-java
**sub_skill_id:** reactive-streams
**format:** MCQ
**difficulty_b:** 0.8 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Project Reactor Documentation

**body:**

What is Reactive Streams, and how does Mono/Flux fit?

**options:**

- A) Reactive Streams = standard for async non-blocking back-pressure (subscriber requests N items, publisher delivers up to N). Project Reactor = library implementing it. `Mono<T>` = 0-or-1 element; `Flux<T>` = 0-N elements. Used for non-blocking IO + composable operators (map, filter, flatMap, etc.) in Spring WebFlux + Java 9+ Flow API
- B) Same as Java Stream
- C) Just a name for blocking IO
- D) Deprecated

**answer_key:**

A — Reactive Streams:
- Specification (JEP 266 in Java 9 as Flow API).
- Standard interfaces: Publisher, Subscriber, Subscription, Processor.
- Backpressure: subscriber requests N items.
- Implementations: Project Reactor (Mono/Flux), RxJava, Akka Streams.
- Used in: Spring WebFlux (reactive web), Spring Data R2DBC.

References: Reactive Streams Specification; Project Reactor Documentation.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-java-v0.6-069-seed-2a4d8f1c
**variant_seed:** qorium-java-v0.6-2026-05-07-069
**bias_check_notes:** No bias.

---

## QUESTION 70: Spring Boot 3.x — Virtual Threads Integration

**question_id:** QOR-JAVA-070
**skill_id:** senior-java
**sub_skill_id:** spring-boot-3
**format:** MCQ
**difficulty_b:** 0.9 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Spring Boot 3.2+ Documentation

**body:**

How does Spring Boot 3.2+ integrate Java 21 virtual threads?

**options:**

- A) Set `spring.threads.virtual.enabled=true`; Tomcat / Jetty / Undertow request handlers run on virtual threads instead of platform thread pool; existing blocking JDBC / RestTemplate / etc. work unchanged but benefit from virtual thread mounting (1M+ concurrent requests possible); IO-bound apps see major throughput improvement without code change
- B) Spring Boot doesn't support virtual threads
- C) Requires Spring rewrite to reactive
- D) Virtual threads only work with WebFlux, not WebMVC

**answer_key:**

A — Spring Boot 3.2+ first-class virtual thread support:
- `spring.threads.virtual.enabled=true` in `application.properties`.
- Tomcat/Jetty/Undertow servlet containers run on virtual threads.
- `@Async` methods run on virtual threads.
- Existing blocking code (JDBC, RestTemplate, MongoDB driver) works unchanged.
- IO-bound apps: 10-100x concurrency improvement with no code rewrite.
- Spring WebMVC + virtual threads ≈ throughput of WebFlux without reactive code complexity.

References: Spring Boot 3.2 Reference Guide §Threading.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-java-v0.6-070-seed-9a4d8c1f
**variant_seed:** qorium-java-v0.6-2026-05-07-070
**bias_check_notes:** No bias.

---

## QUESTION 71: Virtual Threads Code Pattern (Code)

**question_id:** QOR-JAVA-071
**skill_id:** senior-java
**sub_skill_id:** virtual-threads
**format:** code
**difficulty_b:** 1.3 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 12
**citation:** OpenJDK JEP 444

**body:**

Write Java 21 code: process 10,000 URLs concurrently using virtual threads. Each task fetches the URL + extracts title. Use structured concurrency.

**answer_key:**

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.concurrent.StructuredTaskScope;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class UrlTitleFetcher {

    record Result(String url, String title, Throwable error) {}

    private static final HttpClient client = HttpClient.newHttpClient();
    private static final Pattern TITLE_PATTERN =
        Pattern.compile("<title[^>]*>([^<]+)</title>", Pattern.CASE_INSENSITIVE);

    public static List<Result> fetchTitles(List<String> urls) throws InterruptedException {
        try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
            // Each task forked as virtual thread (lightweight)
            var subtasks = urls.stream()
                .map(url -> scope.fork(() -> fetchOne(url)))
                .toList();
            scope.join();          // wait for all
            return subtasks.stream()
                .map(s -> s.state() == StructuredTaskScope.Subtask.State.SUCCESS
                    ? s.get()
                    : new Result(/*url*/ "", /*title*/ "",
                                 s.exception()))
                .toList();
        }
    }

    private static Result fetchOne(String url) {
        try {
            var request = HttpRequest.newBuilder(URI.create(url))
                .timeout(java.time.Duration.ofSeconds(10))
                .build();
            var response = client.send(request, HttpResponse.BodyHandlers.ofString());
            Matcher m = TITLE_PATTERN.matcher(response.body());
            String title = m.find() ? m.group(1).strip() : "";
            return new Result(url, title, null);
        } catch (Exception e) {
            return new Result(url, "", e);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        List<String> urls = List.of(/* ...10K URLs... */);
        long start = System.currentTimeMillis();
        var results = fetchTitles(urls);
        long ms = System.currentTimeMillis() - start;
        long ok = results.stream().filter(r -> r.error == null).count();
        System.out.printf("Fetched %d/%d in %dms (avg %.2f ms/url)%n",
                          ok, urls.size(), ms, (double) ms / urls.size());
    }
}
```

**Key elements:**

1. `StructuredTaskScope.ShutdownOnFailure` — structured concurrency, JEP 462.
2. `scope.fork()` returns a Subtask running on virtual thread.
3. `HttpClient` is virtual-thread-friendly (blocking IO unmounts).
4. `scope.join()` waits for all.
5. Per-task error isolation (Result captures exception).
6. 10s timeout per request.
7. With 10K URLs and structured concurrency, runs in seconds (not 10K × 100ms = 1000s).

**rubric:** 5/4/3/2/1/0 by completeness — virtual threads + structured concurrency + error isolation + timeout.

**watermark_seed:** qorium-java-v0.6-071-seed-3a8c4f1e
**variant_seed:** qorium-java-v0.6-2026-05-07-071
**bias_check_notes:** No bias.

---

## QUESTION 72: Spring Boot 3.x Reactive Endpoint (Code)

**question_id:** QOR-JAVA-072
**skill_id:** senior-java
**sub_skill_id:** spring-webflux
**format:** code
**difficulty_b:** 1.4 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 15
**citation:** Spring WebFlux Documentation

**body:**

Write a Spring WebFlux 3.x reactive endpoint: `GET /products/{category}` that streams 10,000 products from a reactive MongoDB. Include error handling + backpressure.

**answer_key:**

```java
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// --- Product entity
public record Product(String id, String name, String category, double price) {}

// --- Repository (reactive)
public interface ProductRepository extends ReactiveMongoRepository<Product, String> {
    Flux<Product> findByCategory(String category);
}

// --- Controller
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductRepository repo;

    @GetMapping(value = "/{category}", produces = MediaType.APPLICATION_NDJSON_VALUE)
    public Flux<Product> getByCategory(@PathVariable String category) {
        return repo.findByCategory(category)
            .timeout(java.time.Duration.ofSeconds(30))
            .onErrorResume(throwable -> {
                log.error("Error fetching products for {}", category, throwable);
                return Flux.empty();    // graceful: return empty stream
            })
            // Backpressure: limit upstream demand
            .limitRate(100);
    }

    @GetMapping(value = "/{category}/count")
    public Mono<Long> countByCategory(@PathVariable String category) {
        return repo.findByCategory(category)
            .count()
            .timeout(java.time.Duration.ofSeconds(10));
    }
}
```

**Key elements:**

1. Reactive endpoint: returns `Flux<Product>` (streaming).
2. `application/x-ndjson` content type for NDJSON streaming.
3. Backpressure: `limitRate(100)` — request 100 at a time.
4. Timeout: `timeout(30s)`.
5. Error handling: `onErrorResume` (graceful fallback to empty).
6. Pure reactive (Flux/Mono); no blocking calls.
7. Reactive repository (ReactiveMongoRepository).

**rubric:** 5/4/3/2/1/0 by completeness — reactive + streaming + backpressure + timeout + error handling.

**watermark_seed:** qorium-java-v0.6-072-seed-9c4d8a1f
**variant_seed:** qorium-java-v0.6-2026-05-07-072
**bias_check_notes:** No bias.

---

## QUESTION 73: Java Concurrency — CompletableFuture Composition

**question_id:** QOR-JAVA-073
**skill_id:** senior-java
**sub_skill_id:** completable-future
**format:** MCQ
**difficulty_b:** 1.0 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Java Concurrency in Practice + CompletableFuture Reference

**body:**

What's the difference between `thenApply()` and `thenCompose()` on `CompletableFuture`?

**options:**

- A) `thenApply(Function<T, R>)` synchronously transforms the result (T → R). `thenCompose(Function<T, CompletableFuture<R>>)` asynchronously chains: each task returns a Future. Like `map` vs `flatMap` in Streams; use `thenCompose` when the next step is itself async
- B) Same method, just different name
- C) `thenApply` is async, `thenCompose` is sync
- D) Both are deprecated

**answer_key:**

A — Functional difference:
- `thenApply(Function<T, R>)`: synchronous transform. Like `map`.
- `thenCompose(Function<T, CompletableFuture<R>>)`: chains async tasks. Like `flatMap`.
- Without `thenCompose`, async-of-async returns nested CompletableFutures.

Example:
```java
CompletableFuture<User> userFuture = ...;
CompletableFuture<Order> orderFuture = userFuture
    .thenCompose(user -> getOrderAsync(user.getId()));  // unwraps nested
```

References: java.util.concurrent.CompletableFuture JavaDoc.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-java-v0.6-073-seed-3a8c2f4e
**variant_seed:** qorium-java-v0.6-2026-05-07-073
**bias_check_notes:** No bias.

---

## QUESTION 74: Memory — Stack vs Heap

**question_id:** QOR-JAVA-074
**skill_id:** senior-java
**sub_skill_id:** memory-model
**format:** MCQ
**difficulty_b:** 0.6 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** Java Memory Model Specification

**body:**

What's stored on stack vs heap in a typical Java application?

**options:**

- A) **Stack**: per-thread; primitive locals, object references (not the object itself), method frames; LIFO; auto-cleaned on method return; size ~512KB-1MB per thread. **Heap**: shared across threads; objects, arrays, instance variables; managed by GC; sized via `-Xmx` (typical 512MB-100GB+); fragmented + managed by GC algorithm
- B) Same memory; just different names
- C) Stack stores objects; heap stores references
- D) Both deprecated in modern JVMs

**answer_key:**

A — Java memory layout:
- **Stack** (per-thread):
  - Primitive locals (int, long, double).
  - Object references (the pointer; not the object).
  - Method invocation frames.
  - Size: 512KB-1MB per thread.
  - Auto-cleaned on method return (no GC needed).
- **Heap** (shared):
  - Objects + arrays + instance variables.
  - Garbage collected.
  - Generations: Young (Eden + Survivor) + Old + Metaspace (in Java 8+ for class metadata).

References: JLS §17 (Java Memory Model).

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-java-v0.6-074-seed-7c4d2a1f
**variant_seed:** qorium-java-v0.6-2026-05-07-074
**bias_check_notes:** No bias.

---

## QUESTION 75: Spring Boot Actuator + Production Observability

**question_id:** QOR-JAVA-075
**skill_id:** senior-java
**sub_skill_id:** spring-actuator
**format:** MCQ
**difficulty_b:** 0.7 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** Spring Boot Actuator Documentation

**body:**

Spring Boot Actuator exposes `/actuator/*` endpoints. Which combination is canonical for production?

**options:**

- A) `/actuator/health` (liveness + readiness probes for Kubernetes); `/actuator/metrics` (Prometheus scrape via Micrometer); `/actuator/info` (build info); `/actuator/loggers` (runtime log-level changes); `/actuator/heapdump` (debugging); secure via Spring Security; `management.endpoints.web.exposure.include=health,metrics,info,loggers`
- B) Expose all `/actuator/*` to the public internet
- C) Disable Actuator in production
- D) Only `/actuator/health` should be exposed

**answer_key:**

A — Production Actuator config:
- `/actuator/health` (with `livenessState` + `readinessState` for K8s).
- `/actuator/metrics` + `/actuator/prometheus` (via Micrometer).
- `/actuator/info` for build info.
- `/actuator/loggers` for runtime log changes (Spring Boot 2.5+).
- `/actuator/heapdump` (debugging).
- `/actuator/threaddump` (debugging).
- Secure via Spring Security (basic auth or OAuth2).
- `management.endpoints.web.exposure.include=health,metrics,info,loggers,prometheus`.

References: Spring Boot Actuator Reference §1.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-java-v0.6-075-seed-1d4f7a3c
**variant_seed:** qorium-java-v0.6-2026-05-07-075
**bias_check_notes:** No bias.

---

## QUESTION 76: Java 21 Sequenced Collections

**question_id:** QOR-JAVA-076
**skill_id:** senior-java
**sub_skill_id:** sequenced-collections
**format:** MCQ
**difficulty_b:** 0.5 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** JEP 431 (Java 21)

**body:**

What does Java 21's Sequenced Collections (JEP 431) add?

**options:**

- A) Common interface `SequencedCollection<E>` for collections with defined encounter order; `getFirst()`, `getLast()`, `addFirst()`, `addLast()`, `reversed()` as views; applies to LinkedHashSet, ArrayDeque, ArrayList, etc.; eliminates per-collection workarounds for "first/last element"
- B) New collection implementation
- C) Removes existing collections
- D) Java 21 reverted to Java 8 collections

**answer_key:**

A — Sequenced Collections (JEP 431, GA in Java 21):
- `SequencedCollection<E>` interface adds `getFirst()`, `getLast()`, `addFirst()`, `addLast()`, `reversed()`.
- `SequencedSet<E>` extends + adds `Set` semantics.
- `SequencedMap<K,V>` for ordered maps.
- Applies retroactively: LinkedHashSet, LinkedHashMap, ArrayDeque, ArrayList, etc. now `extends SequencedXxx`.
- Eliminates `linkedHashSet.iterator().next()` antipattern for "first".

References: JEP 431; Java 21 docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-java-v0.6-076-seed-2a4d8f1c
**variant_seed:** qorium-java-v0.6-2026-05-07-076
**bias_check_notes:** No bias.

---

## QUESTION 77: Java Microservices Communication (Design)

**question_id:** QOR-JAVA-077
**skill_id:** senior-java
**sub_skill_id:** microservices-architecture
**format:** design
**difficulty_b:** 1.6 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 18
**citation:** Microservices Communication Patterns Reference

**body:**

Design inter-service communication for 30-microservice architecture (Spring Boot 3.x, K8s). Cover: synchronous + asynchronous patterns, observability, resilience, security, deployment. 400-600 words.

**answer_key:**

**Synchronous communication:**

- HTTP/REST for request-response between services.
- Spring Cloud OpenFeign declarative client.
- Spring WebClient for reactive calls.
- Service discovery via Kubernetes DNS or Spring Cloud Eureka.
- Load balancing: K8s service-mesh (Istio / Linkerd) or Spring Cloud LoadBalancer.

**Asynchronous communication:**

- Kafka / RabbitMQ for event-driven flows.
- Saga pattern for distributed transactions.
- Spring Cloud Stream binders abstract Kafka/RabbitMQ.
- Outbox pattern for transactional event publishing.

**Observability:**

- Distributed tracing: Spring Cloud Sleuth → Zipkin / Jaeger / Tempo.
- Metrics: Micrometer → Prometheus → Grafana.
- Logging: structured logs (JSON) → Loki / Elasticsearch.
- OpenTelemetry: vendor-neutral standard.

**Resilience:**

- Resilience4j: circuit breakers, retries, rate limiters, bulkheads, timeouts.
- Configurable per-method via annotations.
- Fallback methods.

**Security:**

- OAuth2 + JWT for service-to-service auth.
- Spring Security + Spring Authorization Server.
- mTLS via service mesh (Istio).
- API Gateway (Spring Cloud Gateway / Kong) at perimeter.

**Deployment:**

- Container per service (Docker).
- Kubernetes for orchestration.
- ConfigMap + Secrets for configuration.
- Helm charts for deployment templates.
- GitOps (ArgoCD) for declarative deployments.
- Blue-green or canary deployment patterns.

**Risk + mitigation:**

| Risk | Mitigation |
|---|---|
| Cascade failures | Circuit breakers + bulkheads; per-service timeouts |
| Distributed transaction inconsistency | Saga pattern + outbox |
| Service version mismatch | Backward-compat APIs; feature flags |
| Security breach | mTLS service mesh + OAuth2 + audit logging |
| Observability gap | Mandatory OTel for all services + alerting |

**rubric:** 5/4/3/2/1/0 — sync + async + observability + resilience + security + deployment.

**watermark_seed:** qorium-java-v0.6-077-seed-9a3c2f7b
**variant_seed:** qorium-java-v0.6-2026-05-07-077
**bias_check_notes:** No bias.

---

## QUESTION 78: 18-Month Java 8 → Java 21 Migration (Design)

**question_id:** QOR-JAVA-078
**skill_id:** senior-java
**sub_skill_id:** java-version-migration
**format:** design
**difficulty_b:** 1.7 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 20
**citation:** Java Version Migration Reference

**body:**

A 5M LOC Java 8 codebase wants to migrate to Java 21 LTS over 18 months. Design the plan. 400-600 words.

**answer_key:**

**Phase 1 (Months 1-3) — Pre-flight:**

- Migration tooling: Eclipse JDT, IntelliJ migration support, Spring Boot Migrator.
- Dependency audit: identify libraries with Java 21 compatibility issues.
- Build system: Maven 3.9+ / Gradle 8+ supports Java 21.
- CI/CD: dual-build matrix (Java 8 + Java 21) initially.

**Phase 2 (Months 4-9) — Library + Framework Migration:**

- Spring Boot 2.x → Spring Boot 3.x (jakarta namespace migration; major change).
- Hibernate 5 → Hibernate 6.x.
- Lombok / Mockito / etc. update to Java 21 compatible.
- Bytecode manipulation libs (ASM, ByteBuddy) update.

**Phase 3 (Months 10-15) — Per-Service Migration:**

- Migrate one service at a time; smallest first, riskiest last.
- Each service: build with Java 21; run regression suite; deploy to staging; soak test 1 week; promote.
- Code modernisation: switch expressions, records, var, sealed classes (optional).

**Phase 4 (Months 16-18) — Cleanup + Adoption:**

- Adopt Java 21 features in new code: virtual threads (huge throughput gain for IO-bound), pattern matching, records.
- Remove Java 8 build matrix from CI.
- Update training material.

**Risks + mitigation:**

| Risk | Mitigation |
|---|---|
| Spring Boot 2 → 3 jakarta namespace breaks | Use Spring Boot Migrator tool; per-package incremental |
| Library compatibility | Audit + identify alternatives upfront |
| Performance regression | Per-service benchmarks before/after |
| Team productivity dip during migration | Training + Power-user mentor program |
| Production incident from migration | Phased rollout per service; immediate rollback path |

**rubric:** 5/4/3/2/1/0 — phased plan + tooling + per-service + risks.

**watermark_seed:** qorium-java-v0.6-078-seed-3d8a4f2c
**variant_seed:** qorium-java-v0.6-2026-05-07-078
**bias_check_notes:** No bias.

---

## QUESTION 79: Performance Crisis (Case Study)

**question_id:** QOR-JAVA-079
**skill_id:** senior-java
**sub_skill_id:** performance-crisis
**format:** casestudy
**difficulty_b:** 2.0 (Very Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 25
**citation:** Java Performance Tuning Reference

**body:**

**Scenario:** Production Spring Boot 3.x service handling 10K req/sec on K8s + JVM 21. Suddenly p95 latency jumps from 50ms to 800ms; CPU 80%; heap 7GB / 8GB. Diagnose + remediate. 500-700 words.

**answer_key:**

**Triage:**

1. Immediate: scale horizontally (more pods) to reduce per-instance load; verify circuit breakers tripping.
2. Capture diagnostics: heap dump (jmap or `/actuator/heapdump`); thread dump; GC logs; flame graph (Async Profiler).
3. Check infra: DB latency, network, dependent service latency.

**Common causes + fixes:**

**Memory leak (heap near max):**
- Heap dump analysis via Eclipse MAT.
- Look for: large retained collections; growing cache; unclosed resources; classloader leaks.
- Quick fix: rolling restart (K8s rollout) to clear heap.
- Long fix: identify leak source + patch.

**GC pressure:**
- GC logs analysis: `-Xlog:gc*` + `-XX:+PrintGCDetails`.
- Long pauses with G1GC: switch to ZGC for sub-millisecond pauses.
- Excessive minor GC: increase young gen.
- Tune: `-Xmx16G -XX:+UseZGC`.

**Lock contention:**
- Thread dump: many threads BLOCKED on same monitor.
- Flame graph reveals hot methods.
- Refactor to ConcurrentHashMap, AtomicLong, ReadWriteLock.

**Slow downstream:**
- Distributed tracing reveals slow downstream call.
- Add timeout + circuit breaker.
- Increase parallelism with virtual threads.

**Database query degradation:**
- Slow query log shows offending queries.
- Missing index; add via migration.
- N+1 query: replace with eager fetch or join.

**External library spike:**
- New library version with regression.
- Profile against previous version.
- Pin or roll back.

**Phased remediation:**

- 0-1h: scale horizontally; immediate relief.
- 1-4h: identify root cause via diagnostics.
- 4-8h: deploy fix to staging; verify.
- 8-24h: rolling production deployment.
- Post-incident: writeup + monitoring tuning.

**Long-term prevention:**

- Add SLO-based alerts on p95 latency.
- Continuous JFR (Java Flight Recorder) profiling in production.
- Chaos engineering: regular game-days for similar scenarios.

**Risks during remediation:**

| Risk | Mitigation |
|---|---|
| Misdiagnosis costs more time | Triage by signal: heap full = leak; thread blocking = lock; slow IO = downstream/DB |
| Rollback during peak hours | Practice in staging; documented runbook |
| Multiple causes mask each other | Address one at a time; verify before next |

**rubric:** 5/4/3/2/1/0 — triage + diagnosis + common causes + remediation + prevention.

**watermark_seed:** qorium-java-v0.6-079-seed-7e1c4a8f
**variant_seed:** qorium-java-v0.6-2026-05-07-079
**bias_check_notes:** No bias.

---

## QUESTION 80: 24-Month Monolith to Microservices (Case Study)

**question_id:** QOR-JAVA-080
**skill_id:** senior-java
**sub_skill_id:** monolith-decomposition
**format:** casestudy
**difficulty_b:** 2.1 (Very Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 30
**citation:** Microservices Migration Reference

**body:**

**Scenario:** A 1M LOC Java monolith (Spring 4 + Hibernate 5) wants to migrate to Spring Boot 3 microservices on K8s over 24 months. Team: 50 engineers. Design the plan. 500-700 words.

**answer_key:**

**Phase 1 (Months 1-6) — Foundation:**

- Domain decomposition: identify bounded contexts (typical monolith has 5-15).
- Strangler-fig pattern: keep monolith; extract one bounded context at a time.
- Infrastructure: K8s cluster, Docker images, CI/CD, observability stack (OpenTelemetry, Grafana, Loki).
- API Gateway in front of monolith.

**Phase 2 (Months 7-15) — Wave 1 Extraction:**

- Extract 3-5 simplest bounded contexts as microservices.
- Each service: own database (database-per-service), own deployment, own team.
- Anti-Corruption Layer (ACL) translates between monolith DB and microservice.
- Saga pattern for cross-service transactions.

**Phase 3 (Months 16-22) — Wave 2 Extraction:**

- Extract 4-7 more services.
- Migrate Spring 4 → Spring Boot 3 (jakarta namespace).
- Migrate Hibernate 5 → 6.x.
- Migrate to Java 21.

**Phase 4 (Months 23-24) — Monolith Retirement:**

- Last bounded context extracted.
- Monolith goes read-only, then retired.
- Final data migration.

**Team org:**

- Per-service teams (Conway's law).
- Platform team for shared infrastructure.
- Senior architects for cross-service design.

**Risks + mitigation:**

| Risk | Mitigation |
|---|---|
| Distributed transaction complexity | Saga pattern + compensating transactions |
| Data consistency across services | Eventual consistency; idempotency keys |
| Operational complexity | Strong observability + on-call rotation |
| Team productivity dip during transition | Clear ownership boundaries + training |
| Per-service over-engineering | Architecture review + simple-first principle |
| Monolith dependency on extracted service | ACL + contract testing |

**Cost projection:**

- Total program: $5-10M over 24 months (50 engineers, infrastructure, training).
- Operational cost: K8s + observability stack = $50K-100K/month.
- Benefits: faster team velocity, independent deployment, scalability.

**rubric:** 5/4/3/2/1/0 — phased plan + decomposition + infrastructure + team org + risks.

**watermark_seed:** qorium-java-v0.6-080-seed-9c2a4f1e
**variant_seed:** qorium-java-v0.6-2026-05-07-080
**bias_check_notes:** No bias.

---

## End of Wave 1 Java Extension 061–080

**Set status:** 20/20 v0.6 complete. SME Lead validation pending. **Q081-Q100 in next file.**
