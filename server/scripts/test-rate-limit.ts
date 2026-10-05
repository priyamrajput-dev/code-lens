import { redis, connectRedis, disconnectRedis, isRedisHealthy, redisKey } from "../src/lib/redis.js";
import { checkSlidingWindow, checkTokenBucket } from "../src/common/utils/rate-limit/limiter.js";
import { normalizeIp } from "../src/common/utils/rate-limit/ip-utils.js";

async function runTests() {
  console.log("=========================================");
  console.log("  CODE-LENS REDIS & RATE LIMIT TEST SUITE");
  console.log("=========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}${details ? ` (${details})` : ""}`);
      failed++;
    }
  }

  // --- 1. IP Utility & IPv6 /64 Subnet Masking Tests ---
  console.log("1. Testing IP Extraction & Subnet Masking:");
  assert(
    normalizeIp("192.168.1.1") === "192.168.1.1",
    "IPv4 address preserved as-is",
  );
  assert(
    normalizeIp("::ffff:192.168.1.1") === "192.168.1.1",
    "IPv4-mapped IPv6 stripped correctly",
  );
  assert(
    normalizeIp("::1") === "::1",
    "IPv6 localhost identified correctly",
  );

  const ipv6A = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
  const ipv6SameSubnet = "2001:0db8:85a3:0000:ffff:ffff:ffff:ffff";
  const ipv6DiffSubnet = "2001:0db8:85a3:0001:0000:8a2e:0370:7334";

  assert(
    normalizeIp(ipv6A) === normalizeIp(ipv6SameSubnet),
    "IPv6 addresses in same /64 subnet normalized to identical key",
  );
  assert(
    normalizeIp(ipv6A) !== normalizeIp(ipv6DiffSubnet),
    "IPv6 addresses in different /64 subnets normalized to separate keys",
  );

  // --- 2. Redis Connection Check ---
  console.log("\n2. Testing Redis Connection:");
  const connected = await connectRedis();
  const healthy = await isRedisHealthy();

  assert(connected && healthy, "Redis connection established and ping responded PONG");

  if (!healthy) {
    console.error("\n❌ Redis is not reachable. Ensure REDIS_URL is valid or start local Redis.");
    process.exit(1);
  }

  // --- 3. Sliding Window Counter Tests ---
  console.log("\n3. Testing Sliding Window Counter (Weighted Two-Window):");
  const swKey = `test_sw_${Date.now()}`;
  const swLimit = 5;
  const swWindow = 3; // 3 seconds window

  // Send 5 requests (all should be allowed)
  for (let i = 1; i <= swLimit; i++) {
    const res = await checkSlidingWindow({
      key: swKey,
      limit: swLimit,
      windowSeconds: swWindow,
    });
    assert(
      res.allowed && res.remaining === swLimit - i,
      `Request ${i}/${swLimit} allowed, remaining = ${res.remaining}`,
    );
  }

  // 6th request must be rejected
  const swOverLimit = await checkSlidingWindow({
    key: swKey,
    limit: swLimit,
    windowSeconds: swWindow,
  });
  assert(
    !swOverLimit.allowed && swOverLimit.remaining === 0 && swOverLimit.retryAfterSeconds > 0,
    `Request 6/${swLimit} rejected (429), retry-after = ${swOverLimit.retryAfterSeconds}s`,
  );

  // Wait for window to expire
  console.log(`     Waiting ${swWindow + 1}s for sliding window to reset...`);
  await new Promise((r) => setTimeout(r, (swWindow + 1) * 1000));

  const swAfterReset = await checkSlidingWindow({
    key: swKey,
    limit: swLimit,
    windowSeconds: swWindow,
  });
  assert(
    swAfterReset.allowed,
    `Request allowed after window slide, remaining = ${swAfterReset.remaining}`,
  );

  // --- 4. Token Bucket Tests ---
  console.log("\n4. Testing Token Bucket (Capacity & Refill):");
  const tbKey = `test_tb_${Date.now()}`;
  const capacity = 3;
  const refillRate = 1; // 1 token per second

  for (let i = 1; i <= capacity; i++) {
    const res = await checkTokenBucket({
      key: tbKey,
      capacity,
      refillRate,
    });
    assert(
      res.allowed && res.remaining === capacity - i,
      `Token consumed ${i}/${capacity}, remaining tokens = ${res.remaining}`,
    );
  }

  // Next burst should be rejected
  const tbExhausted = await checkTokenBucket({
    key: tbKey,
    capacity,
    refillRate,
  });
  assert(
    !tbExhausted.allowed && tbExhausted.retryAfterSeconds >= 1,
    `Exhausted bucket rejected, retry-after = ${tbExhausted.retryAfterSeconds}s`,
  );

  // Wait 1.2s for 1 token to refill
  console.log("     Waiting 1.2s for 1 token to refill...");
  await new Promise((r) => setTimeout(r, 1200));

  const tbRefilled = await checkTokenBucket({
    key: tbKey,
    capacity,
    refillRate,
  });
  assert(
    tbRefilled.allowed,
    `Request allowed after token bucket partial refill`,
  );

  // --- 5. Atomic Concurrency & Race Condition Test ---
  console.log("\n5. Testing Atomic Concurrency (Race Condition Resilience):");
  const raceKey = `test_race_${Date.now()}`;
  const raceLimit = 10;
  const totalConcurrentRequests = 25;

  console.log(`     Firing ${totalConcurrentRequests} simultaneous requests with limit ${raceLimit}...`);
  const concurrentResults = await Promise.all(
    Array.from({ length: totalConcurrentRequests }).map(() =>
      checkSlidingWindow({
        key: raceKey,
        limit: raceLimit,
        windowSeconds: 10,
      }),
    ),
  );

  const allowedCount = concurrentResults.filter((r) => r.allowed).length;
  const rejectedCount = concurrentResults.filter((r) => !r.allowed).length;

  assert(
    allowedCount === raceLimit,
    `Exactly ${raceLimit} of ${totalConcurrentRequests} requests allowed (actual: ${allowedCount})`,
  );
  assert(
    rejectedCount === totalConcurrentRequests - raceLimit,
    `Exactly ${totalConcurrentRequests - raceLimit} requests rejected with 429 (actual: ${rejectedCount})`,
  );

  // --- 6. Cleanup & Teardown ---
  console.log("\n6. Cleaning up test keys...");
  try {
    const fullSwKey = redisKey("rl", "sw", swKey);
    const fullTbKey = redisKey("rl", "tb", tbKey);
    const fullRaceKey = redisKey("rl", "sw", raceKey);
    await redis.del(fullSwKey, fullTbKey, fullRaceKey);
    console.log("  ✓ Test keys cleaned up");
  } catch (err) {
    console.warn("  Could not clean up all test keys:", err);
  }

  await disconnectRedis();

  console.log("\n=========================================");
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
