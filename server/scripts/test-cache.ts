import { connectRedis, disconnectRedis, isRedisHealthy, redisKey } from "../src/lib/redis.js";
import { cache, cacheKey } from "../src/lib/cache.js";

async function runTests() {
  console.log("=========================================");
  console.log("   CODE-LENS REDIS CACHING TEST SUITE    ");
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

  // 1. Redis Connection Check
  console.log("1. Testing Redis Connection:");
  const connected = await connectRedis();
  const healthy = await isRedisHealthy();

  assert(connected && healthy, "Redis connection established and ready");
  if (!healthy) {
    console.error("❌ Redis is not reachable. Aborting cache tests.");
    process.exit(1);
  }

  // 2. Basic Get & Set Tests
  console.log("\n2. Testing Basic Get, Set & Serialization:");
  const testKeyString = cacheKey("test", "string");
  const testKeyObject = cacheKey("test", "object");
  const testKeyArray = cacheKey("test", "array");

  await cache.set(testKeyString, "hello_world", 30);
  const valString = await cache.get<string>(testKeyString);
  assert(valString === "hello_world", "String value stored and retrieved correctly");

  const sampleObj = { id: 123, name: "CodeLens", tags: ["ai", "devtools"], active: true };
  await cache.set(testKeyObject, sampleObj, 30);
  const valObj = await cache.get<typeof sampleObj>(testKeyObject);
  assert(
    valObj?.name === "CodeLens" && valObj?.tags.length === 2 && valObj?.active === true,
    "Complex JSON object serialized and parsed correctly"
  );

  const sampleArr = [1, 2, 3, "four", { five: 5 }];
  await cache.set(testKeyArray, sampleArr, 30);
  const valArr = await cache.get<typeof sampleArr>(testKeyArray);
  assert(
    Array.isArray(valArr) && valArr.length === 5 && (valArr[4] as any).five === 5,
    "Array with nested items retrieved correctly"
  );

  const nonExistent = await cache.get(cacheKey("test", "non_existent_key_xyz"));
  assert(nonExistent === null, "Missing cache key returns null (no crash)");

  // 3. Testing Existence & TTL
  console.log("\n3. Testing Has & TTL:");
  const hasObj = await cache.has(testKeyObject);
  assert(hasObj === true, "cache.has returns true for existing key");

  const ttl = await cache.ttl(testKeyObject);
  assert(ttl > 0 && ttl <= 30, `cache.ttl returns valid TTL (${ttl}s remaining)`);

  const hasMissing = await cache.has(cacheKey("test", "missing"));
  assert(hasMissing === false, "cache.has returns false for non-existent key");

  // 4. Testing TTL Expiration
  console.log("\n4. Testing TTL Auto-Expiration:");
  const expiringKey = cacheKey("test", "expiring");
  await cache.set(expiringKey, "short-lived", 2); // 2 second TTL
  const immediateVal = await cache.get<string>(expiringKey);
  assert(immediateVal === "short-lived", "Key exists immediately after set with TTL");

  console.log("     Waiting 2.5s for TTL expiry...");
  await new Promise((r) => setTimeout(r, 2500));
  const expiredVal = await cache.get<string>(expiringKey);
  assert(expiredVal === null, "Key expired and returns null after TTL elapsed");

  // 5. Testing Delete (Single & Batch)
  console.log("\n5. Testing Single and Batch Deletion:");
  const delKey1 = cacheKey("test", "del1");
  const delKey2 = cacheKey("test", "del2");
  await cache.set(delKey1, "val1", 30);
  await cache.set(delKey2, "val2", 30);

  const deletedSingle = await cache.del(delKey1);
  assert(deletedSingle === 1, "cache.del deletes single key");
  assert((await cache.get(delKey1)) === null, "Deleted key is no longer in cache");

  const deletedBatch = await cache.del([delKey2, cacheKey("test", "does_not_exist")]);
  assert(deletedBatch === 1, "cache.del batch correctly deletes only existing key");

  // 6. Testing Cache-Aside (getOrSet)
  console.log("\n6. Testing Cache-Aside (getOrSet):");
  const cacheAsideKey = cacheKey("test", "cache_aside");
  let fetchCount = 0;

  async function mockDbQuery(): Promise<{ data: string }> {
    fetchCount++;
    return { data: `database_record_${fetchCount}` };
  }

  // First call -> Cache MISS -> fetcher invoked
  const firstResult = await cache.getOrSet(cacheAsideKey, mockDbQuery, 30);
  assert(
    firstResult.data === "database_record_1" && fetchCount === 1,
    "First getOrSet invoked fetcher on cache MISS"
  );

  // Second call -> Cache HIT -> returned from Redis without invoking fetcher
  const secondResult = await cache.getOrSet(cacheAsideKey, mockDbQuery, 30);
  assert(
    secondResult.data === "database_record_1" && fetchCount === 1,
    "Second getOrSet served from cache HIT (fetcher not called again)"
  );

  // 7. Testing Pattern Deletion & Namespace Clearing
  console.log("\n7. Testing Non-Blocking Pattern Deletion & Namespace Clearing:");
  const nsKey1 = cacheKey("test_cleanup", "user_1", "item_a");
  const nsKey2 = cacheKey("test_cleanup", "user_1", "item_b");
  const nsKey3 = cacheKey("test_cleanup", "user_2", "item_c");
  const otherNsKey = cacheKey("other_ns", "preserve_me");

  await cache.set(nsKey1, "data1", 60);
  await cache.set(nsKey2, "data2", 60);
  await cache.set(nsKey3, "data3", 60);
  await cache.set(otherNsKey, "data_keep", 60);

  const cleared = await cache.clearNamespace("test_cleanup");
  assert(cleared === 3, `cache.clearNamespace cleared all 3 namespace keys (actual: ${cleared})`);

  const check1 = await cache.get(nsKey1);
  const check2 = await cache.get(nsKey2);
  const check3 = await cache.get(nsKey3);
  const checkOther = await cache.get(otherNsKey);

  assert(
    check1 === null && check2 === null && check3 === null,
    "All keys in cleared namespace are confirmed deleted"
  );
  assert(
    checkOther === "data_keep",
    "Keys outside cleared namespace were preserved intact"
  );

  // 8. Clean up all remaining test keys
  console.log("\n8. Cleaning up test artifacts...");
  await cache.clearNamespace("test");
  await cache.clearNamespace("other_ns");
  console.log("  ✓ Test namespace cleaned up");

  await disconnectRedis();

  console.log("\n=========================================");
  console.log(`  CACHE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner encountered fatal error:", err);
  process.exit(1);
});
