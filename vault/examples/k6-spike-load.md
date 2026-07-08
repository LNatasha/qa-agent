---
type: example
name: k6 Spike Load Test
domains: [performance]
tags: [k6, performance, spike, load]
---

k6 spike test that ramps to 200 VUs in 10s, holds for 1m, then drops.

## Code

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 200 },
    { duration: '1m', target: 200 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('https://your-api.example.com/endpoint');
  check(res, { 'status is 200': r => r.status === 200 });
  sleep(1);
}
```
