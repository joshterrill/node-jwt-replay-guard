# node-jwt-replay-guard

prevents malicious people from performing replay attacks using stolen JWT tokens.

**This is a working demo, but is still a work in progress. -jt**

#### Install


```
npm i node-jwt-replay-guard --save
```

#### How to use

1. Set your JWT token secret at init using the `setJWTSecret('JWT SECRET GOES HERE')` method. If you don't set it, the library will try to use an environment variable called `JWT_SECRET` accessed through `process.env.JWT_SECRET`.
2. Whenever you create a JWT token (like after a successful login call), call the `storeToken(token, req)` method and pass in the `token` and express `req` variables.
3. Lastly, you can use `replayGuard` as a middleware on any routes that expect a JWT token to be passed through. It will check to make sure the JWT token is being used by the same IP address which last successfully logged in to the system.

#### Example (express)

```javascript
const express = require('express');
const njrg = require('nodw-jwt-replay-guard');
const app = express();

const JWT_SECRET = 'test';
njrg.setJWTSecret(JWT_SECRET);

app.post('/login', (req, res) => {
  // do login logic then create a jwt token and store it in the cache
  const token = jwt.encode({
    name: 'Josh Terrill',
    email: 'joshterrill.dev@gmail.com',
    roles: ['admin']
  }, JWT_SECRET);
  njrg.storeToken(token, req);
  res.json({token});
});

app.post('/test', njrg.replayGuard, (req, res) => {
  res.json({hello: 'world'});
});

app.listen(3000, () => {
  console.log('Server listening on port 3000.');
});
```

#### Contact

Josh Terrill <joshterrill.dev@gmail.com>