# Request State Wrapper

A simple wrapper for Asynchronous JavaScript requests that allows you to detect stalled, fetching and finished states.

What is the point of this tool? Read [Better loading states for the modern web](#).

## API

```javascript
import { createRequest } from 'request-state-wrapper';

// Create your smart request
const request = createRequest({
    request: [<Promise>], // Array of Promises
    stalledDelay: Number, // Time in MS before we consider a request stalled
    onStateChange: Function, // Callback executed every time request state changes
});

// run it!
request();
```

## Example

```javascript
// Before

// Set our loading state
loading = true

// Start our asyncronous request/s
Promise.all([asyncRequest(), anotherAsyncRequest()]).then(payload => {

    // When it's finished, set loading state to false
    loading = false

    // Then handle the response
    if(payload.error) // show error screen
    // show success screen
});

// After
import { createRequest } from 'request-state-wrapper';

const getData = createRequest({
    request: [asyncRequest, anotherAsyncRequest],
    stalledDelay: 250,
    onStateChange: state => { ... },
})

getData().then(payload => console.log(payload));
```

With async/await

```javascript
// Before
async function requests () {
    const payload = await Promise.all[asyncRequest(), anotherAsyncRequest()];
    console.log(payload);
}

// After
import { createRequest } from 'request-state-wrapper';

const getData = createRequest({
    request: [asyncRequest, anotherAsyncRequest],
    stalledDelay: 250,
    onStateChange: state => { ... },
})

const data = await getData();
```

Add a specific handler for each type of event:

```javascript
import { createRequest } from 'request-state-wrapper';

const getData = createRequest({
    request: [asyncRequest(), anotherAsyncRequest()],
    stalledDelay: 250,
    onFetching: state => { ... },
    onStalled: state => { ... },
    onFinished: state => { ... },
})
```

Note, specific handler will override onStateChange().

Create your request, and add/override handlers when you run the request:

```javascript
import { createRequest } from 'request-state-wrapper';

const getData = createRequest({
    request: [asyncRequest(), anotherAsyncRequest()],
    stalledDelay: 250,
})

const data = await getData({ onStateChange: state => { ... } });
```

Want some more examples? Check out some demo recipes:

Simple UI with React
Simple UI with React Hooks
NodeJS server