## Course Scenarios

You can find the original scenario documentation provided by the opentelemetry demo project [here](https://opentelemetry.io/docs/demo/feature-flags/)

The demo provides several feature flags that you can use to simulate different
scenarios. These flags are managed by [`flagd`](https://flagd.dev), a simple
feature flag service that supports [OpenFeature](https://openfeature.dev).

Flag values can be changed through the user interface provided at
<http://localhost:8080/feature> when running the demo. Changing the values
through this user interface will be reflected in the flagd service.

There are two options when it comes to changing the feature flags through the
user interface:

- **Basic View**: A user friendly view in which default variants (the same
  options that need to be changed when configuring through the raw file) can be
  selected and saved for each feature flag. Currently, the basic view does not
  support fractional targeting.

- **Advanced View**: A view in which the raw configuration JSON file is loaded
  and can be edited within the browser. The view provides the flexibility that
  comes with editing a raw JSON file, however it also provides schema checking
  to ensure that the JSON is valid and that the provided configuration values
  are correct.

## OpenTelemetry Project Scenarios

| Scenario                        | Service(s)       | Description                                                                                               |
| ----------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| `adServiceFailure`                  | Ad Service       | Generate an error for `GetAds` 1/10th of the time                                                         |
| `adServiceManualGc`                 | Ad Service       | Trigger full manual garbage collections in the ad service                                                 |
| `adServiceHighCpu`                  | Ad Service       | Trigger high cpu load in the ad service. If you want to demo cpu throttling, set cpu resource limits      |
| `cartServiceFailure`                | Cart Service     | Generate an error whenever `EmptyCart` is called                                                          |
| `productCatalogFailure`             | Product Catalog  | Generate an error for `GetProduct` requests with product ID: `OLJCESPC7Z`                                 |
| `recommendationServiceCacheFailure` | Recommendation   | Create a memory leak due to an exponentially growing cache. 1.4x growth, 50% of requests trigger growth.  |
| `paymentServiceFailure`             | Payment Service  | Generate an error when calling the `charge` method.                                                       |
| `paymentServiceUnreachable`         | Checkout Service | Use a bad address when calling the PaymentService to make it seem like the PaymentService is unavailable. |
| `loadgeneratorFloodHomepage`        | Loadgenerator    | Start flooding the homepage with a huge amount of requests, configurable by changing flagd JSON on state. |
| `kafkaQueueProblems`                | Kafka            | Overloads Kafka queue while simultaneously introducing a consumer side delay leading to a lag spike.      |
| `imageSlowLoad`                     | Frontend         | Utilizes envoy fault injection, produces a delay in loading of product images in the frontend.            |

## Splunk O11y CD Scenarios

| Scenario                        | Service(s)       | Description                                                                                               |
| ----------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| `slowRecommendationSpan`                  | Recommendation       | Create a slow 5sec span in the recommendation service (get_product_list)                                                        |
| `slowRecommendationRegionSpan`                  | Recommendation       | Create a slow 5sec span in the recommendation service (get_product_list) for the San Francisco region(get_product_list)                                                        |
| `recommendationErrors`                  | Recommendation       | Introduce different types of errors in the recommendation service 20% of the time                                                      |

## Jess Recommendations for Courses

### Using APM

Goal: Replace large payment service error scenario with a variety of smaller scenarios

- slowRecommendationSpan: Demonstrate how to see spike in latency on APM overview built in charts -> View the slow spans in the trace analyzer/waterfall view (filter traces by service and opertation)
- slowRecommendationRegionSpan: Same as above except can add how to filter by region tag (filter traces by above and region tag), can also index tag and look at regional differences in the tag spotlight, as well as apply a breakdown on the service map and see differences split by region tag
You could also add tenant back in, in this manner
- recommendationErrors: show what error spans look like in traces and how to see error messages in the spans
- adServiceFailure: view errors in built in charts and traces for the ad service (similar to above just different service)
- adHighCpu: might be useful for monitoring and detecting on a cpu metric that spike suddenly
- recommendationServiceCacheFailure: can see a different type of error in the trace tags (app.cache_hit) and can also see spike in memory/number of requests on charts 




### Using RUM

Goal: Replace large checkout process -> payment service error scenario with a variety of smaller scenarios
(I haven't tested these with a RUM tool yet)

- All the service error scenarios above in apm seems to propagate up to the front end, so can use these to demonstrate related content into apm from front-end error
- imageSlowLoad: show what a slow loading image looks like in RUM
- loadgeneratorFloodHomepage: Might be interesting to see what this looks like in RUM 
