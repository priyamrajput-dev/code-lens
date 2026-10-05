/**
 * Atomic Lua scripts for rate limiting in Redis.
 *
 * Both scripts use Redis server time via `redis.call('TIME')` to eliminate clock drift
 * between distributed Express app servers and Redis.
 */

/**
 * Sliding Window Counter Script (Weighted Two-Window Model).
 *
 * Trade-offs vs Sorted Sets (ZSET):
 * - Sorted Set stores individual timestamps for every request: O(N) memory per client,
 *   which explodes under high traffic / DDoS.
 * - Sliding Window Counter stores only the current window count and previous window count.
 *   Memory is strictly O(1) (~80 bytes per key) and CPU execution is O(1) arithmetic.
 *
 * KEYS[1]: rate limit key
 * ARGV[1]: limit (number)
 * ARGV[2]: window_seconds (number)
 * ARGV[3]: cost (number, default 1)
 *
 * Returns: [allowed (0/1), current_count, remaining, reset_time_seconds, retry_after_seconds]
 */
export const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local cost = tonumber(ARGV[3]) or 1

local time_res = redis.call('TIME')
local now_sec = tonumber(time_res[1])

local current_window = math.floor(now_sec / window)
local elapsed_in_window = now_sec % window
local prev_window_weight = (window - elapsed_in_window) / window

local data = redis.call('HMGET', key, 'curr_win', 'curr_count', 'prev_count')
local stored_win = tonumber(data[1])
local curr_count = tonumber(data[2]) or 0
local prev_count = tonumber(data[3]) or 0

if stored_win == nil then
  curr_count = 0
  prev_count = 0
elseif stored_win == current_window then
  -- within same window, counts are accurate
elseif stored_win == (current_window - 1) then
  -- advanced by 1 window: old current becomes previous
  prev_count = curr_count
  curr_count = 0
else
  -- older than 1 window: previous window is 0
  prev_count = 0
  curr_count = 0
end

local current_estimate = math.floor(prev_count * prev_window_weight) + curr_count
local reset_seconds = math.max(1, window - elapsed_in_window)

if (current_estimate + cost) <= limit then
  curr_count = curr_count + cost
  redis.call('HMSET', key, 'curr_win', current_window, 'curr_count', curr_count, 'prev_count', prev_count)
  redis.call('EXPIRE', key, window * 2 + 1)
  local remaining = math.max(0, limit - (current_estimate + cost))
  return { 1, current_estimate + cost, remaining, reset_seconds, 0 }
else
  redis.call('HMSET', key, 'curr_win', current_window, 'curr_count', curr_count, 'prev_count', prev_count)
  redis.call('EXPIRE', key, window * 2 + 1)
  local remaining = 0
  local retry_after = reset_seconds
  return { 0, current_estimate, remaining, reset_seconds, retry_after }
end
`;

/**
 * Token Bucket Script (for bursty / expensive routes like AI reviews).
 *
 * Supports capacity bursts with smooth continuous refill.
 *
 * KEYS[1]: rate limit key
 * ARGV[1]: capacity (max burst tokens)
 * ARGV[2]: refill_rate (tokens added per second, float allowed)
 * ARGV[3]: cost (number of tokens consumed)
 *
 * Returns: [allowed (0/1), current_tokens_consumed, remaining_tokens, reset_time_seconds, retry_after_seconds]
 */
export const TOKEN_BUCKET_LUA = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local cost = tonumber(ARGV[3]) or 1

local time_res = redis.call('TIME')
local now = tonumber(time_res[1]) + (tonumber(time_res[2]) / 1000000)

local data = redis.call('HMGET', key, 'tokens', 'last_updated')
local stored_tokens = tonumber(data[1])
local last_updated = tonumber(data[2])

local tokens = capacity
if stored_tokens ~= nil and last_updated ~= nil then
  local elapsed = math.max(0, now - last_updated)
  tokens = math.min(capacity, stored_tokens + (elapsed * refill_rate))
end

-- Key TTL: time to refill from 0 to full capacity + buffer
local ttl = math.max(60, math.ceil(capacity / refill_rate) + 60)

if tokens >= cost then
  tokens = tokens - cost
  redis.call('HMSET', key, 'tokens', tokens, 'last_updated', now)
  redis.call('EXPIRE', key, ttl)
  local remaining = math.floor(tokens)
  local reset_seconds = math.max(1, math.ceil((capacity - tokens) / refill_rate))
  return { 1, math.floor(capacity - tokens), remaining, reset_seconds, 0 }
else
  redis.call('HMSET', key, 'tokens', tokens, 'last_updated', now)
  redis.call('EXPIRE', key, ttl)
  local remaining = 0
  local reset_seconds = math.max(1, math.ceil((capacity - tokens) / refill_rate))
  local retry_after = math.max(1, math.ceil((cost - tokens) / refill_rate))
  return { 0, math.floor(capacity - tokens), remaining, reset_seconds, retry_after }
end
`;
