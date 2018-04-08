# 2 WebClient
spring-webflux模块包括一个反应式，非阻塞客户端，用于HTTP请求，具有函数式的API客户端和反应流支持。 WebClient依赖较低级别的HTTP客户端库来执行请求，并且该支持是可插拔的。

WebClient使用与WebFlux服务器应用程序相同的编解码器，并与functional web framework共享一个通用基本包，一些通用API和基础架构。 该API公开了Reactor Flux和Mono类型，也参见了Reactive Libraries。 默认情况下，它使用Reactor Netty作为HTTP客户端库，但其他库可以通过自定义ClientHttpConnector使用。

WebClient 与 RestTemplate 比较：
- 非阻塞，反应性，并支持更高的并发性和更少的硬件资源。

- 提供了一个可以利用Java 8 lambda的函数式API。

- 支持同步和异步场景。

- 支持从服务器上传或下传。

对于大多数并发场景，例如 一系列可能相互依赖的HTTP调用，或者从服务器端进行远程调用，都倾向于使用WebClient。

## 2.1 Retrieve

retrieve()方法可以很简单的获取一个响应体并解析它：
```java
    WebClient client = WebClient.create("http://example.org");

    Mono<Person> result = client.get()
            .uri("/persons/{id}", id).accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .bodyToMono(Person.class);
```

也可以获取一个对象流并且解析：
```java
    Flux<Quote> result = client.get()
            .uri("/quotes").accept(MediaType.TEXT_EVENT_STREAM)
            .retrieve()
            .bodyToFlux(Quote.class);
```

默认情况下，收到4xx或5xx响应码的时候会抛出WebClientResponseException错误，但是你可以自定义这个：
```java
    Mono<Person> result = client.get()
            .uri("/persons/{id}", id).accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .onStatus(HttpStatus::is4xxServerError, response -> ...)
            .onStatus(HttpStatus::is5xxServerError, response -> ...)
            .bodyToMono(Person.class);
```

## 2.2 Exchange
exchange()提供更多的控制，下面的代码等同于retrive(),但是可以访问ClientResponse:
```java
    Mono<Person> result = client.get()
            .uri("/persons/{id}", id).accept(MediaType.APPLICATION_JSON)
            .exchange()
            .flatMap(response -> response.bodyToMono(Person.class));
```

这种情况下你可以创建完整的ResponseEntity:
```java
    Mono<ResponseEntity<Person>> result = client.get()
            .uri("/persons/{id}", id).accept(MediaType.APPLICATION_JSON)
            .exchange()
            .flatMap(response -> response.toEntity(Person.class));
```

请注意，与retrieve（）不同，在exchange（）中，没有针对4xx和5xx响应的自动错误处理。 你必须检查状态码并决定如何处理。

*使用exchange()时，您必须始终使用ClientResponse的body或toEntity方法来确保资源已释放并避免HTTP连接池存在潜在问题。 如果没有响应内容，您可以使用bodyToMono（Void.class）。 但请记住，如果响应确实包含内容，则连接将被关闭，并且不会放回池中。*

## 2.3 Request body
把对象编码成请求体：
```java
    Mono<Person> personMono = ... ;

    Mono<Void> result = client.post()
            .uri("/persons/{id}", id)
            .contentType(MediaType.APPLICATION_JSON)
            .body(personMono, Person.class)
            .retrieve()
            .bodyToMono(Void.class);
```

也可以编码对象流：
```java
    Flux<Person> personFlux = ... ;

    Mono<Void> result = client.post()
            .uri("/persons/{id}", id)
            .contentType(MediaType.APPLICATION_STREAM_JSON)
            .body(personFlux, Person.class)
            .retrieve()
            .bodyToMono(Void.class);
```

如果你有普通的对象，使用syncBody快捷方法：
```java
    Person person = ... ;

    Mono<Void> result = client.post()
            .uri("/persons/{id}", id)
            .contentType(MediaType.APPLICATION_JSON)
            .syncBody(person)
            .retrieve()
            .bodyToMono(Void.class);
```

### 2.3.1 表单数据
要发送表单数据，请提供一个MultiValueMap <String，String>作为正文。 请注意，FormHttpMessageWriter将内容自动设置为“application / x-www-form-urlencoded”：
```java
    MultiValueMap<String, String> formData = ... ;

    Mono<Void> result = client.post()
            .uri("/path", id)
            .syncBody(formData)
            .retrieve()
            .bodyToMono(Void.class);
```

您还可以通过BodyInserters提供行式表单数据：
```java
    import static org.springframework.web.reactive.function.BodyInserters.*;

    Mono<Void> result = client.post()
            .uri("/path", id)
            .body(fromFormData("k1", "v1").with("k2", "v2"))
            .retrieve()
            .bodyToMono(Void.class);
```
### 2.3.2 Multipart data
要发送Multipart数据，请提供一个MultiValueMap <String，？>，其中的值可以是表示部分主体的Object，也可以是表示部分主体和头部的HttpEntity。 MultipartBodyBuilder可以用来构建：
```java
    MultipartBodyBuilder builder = new MultipartBodyBuilder();
    builder.part("fieldPart", "fieldValue");
    builder.part("filePart", new FileSystemResource("...logo.png"));
    builder.part("jsonPart", new Person("Jason"));

    MultiValueMap<String, HttpEntity<?>> parts = builder.build();

    Mono<Void> result = client.post()
            .uri("/path", id)
            .syncBody(parts)
            .retrieve()
            .bodyToMono(Void.class);
```
请注意，每个部分的内容类型是基于正在写入的文件的扩展名或对象的类型自动设置的。 如果您愿意，也可以更明确地指定每个部分的内容类型。

您还可以通过BodyInserters提供行式MultiPart表单数据：
```java
    import static org.springframework.web.reactive.function.BodyInserters.*;

    Mono<Void> result = client.post()
            .uri("/path", id)
            .body(fromMultipartData("fieldPart", "value").with("filePart", resource))
            .retrieve()
            .bodyToMono(Void.class);
```

## 2.4 Builder options
创建WebClient的一个简单方法是通过静态工厂方法create（）和create（String）为所有请求提供基本URL。 您还可以使用WebClient.builder（）访问更多选项。

定制底层HTTP客户端：
```java
    SslContext sslContext = ...

    ClientHttpConnector connector = new ReactorClientHttpConnector(
            builder -> builder.sslContext(sslContext));

    WebClient webClient = WebClient.builder()
            .clientConnector(connector)
            .build();
```

自定义HTTP编解码器：
```java
    ExchangeStrategies strategies = ExchangeStrategies.builder()
            .codecs(configurer -> {
                // ...
            })
            .build();

    WebClient webClient = WebClient.builder()
            .exchangeStrategies(strategies)
            .build();
```
这种构建方式也可以插入过滤器。

浏览您的IDE中的WebClient.Builder，以获取与构建URI，默认标头（和cookie）等相关的其他选项。

WebClient构建完成后，您始终可以从中获取新的构建器，以便基于此构建新的WebClient，但不会影响当前实例：
```java
WebClient modifiedClient = client.mutate()
            // user builder methods...
            .build();
```
## 2.5 Filters
WebClient支持拦截请求过滤：
```java
    WebClient client = WebClient.builder()
            .filter((request, next) -> {
                ClientRequest filtered = ClientRequest.from(request)
                        .header("foo", "bar")
                        .build();
                return next.exchange(filtered);
            })
            .build();
```
ExchangeFilterFunctions为基本认证提供了一个过滤器：
```java
    // static import of ExchangeFilterFunctions.basicAuthentication

    WebClient client = WebClient.builder()
            .filter(basicAuthentication("user", "pwd"))
            .build();
```
你可以从已经存在的WebClient新创建一个，并不会影响之前的：
```java
    WebClient filteredClient = client.mutate()
            .filter(basicAuthentication("user", "pwd")
            .build();
```

## 2.6 Testing
要测试使用WebClient的代码，可以使用模拟Web服务器，如OkHttp MockWebServer。 要查看使用示例，请检查Spring Framework测试中的WebClientIntegrationTests或OkHttp存储库中的静态服务器示例。

