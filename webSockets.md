# 3 WebSockets
参考文档的这一部分介绍了对Reactive堆栈，WebSocket消息传递的支持。

## 3.1 简介
WebSocket协议RFC 6455提供了一种标准化方法，可通过单个TCP连接在客户端和服务器之间建立全双工，双向通信通道。 它是来自HTTP的一种不同的TCP协议，但被设计为通过HTTP工作，使用端口80和443并允许重新使用现有的防火墙规则。

WebSocket交互以HTTP请求开始，HTTP请求使用HTTP“Upgrade”头进行Upgrade，或者在此情况下切换到WebSocket协议：
```
GET /spring-websocket-portfolio/portfolio HTTP/1.1
Host: localhost:8080
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: Uc9l9TMkWGbHFD2qnFHltg==
Sec-WebSocket-Protocol: v10.stomp, v11.stomp
Sec-WebSocket-Version: 13
Origin: http://localhost:8080
```
与通常的200状态代码不同，具有WebSocket支持的服务将返回：
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: 1qVdfYHU9hPOl4JYYNXF623Gzn0=
Sec-WebSocket-Protocol: v10.stomp
```

握手成功后，HTTP升级请求的TCP套接字将保持打开状态，以便客户端和服务器继续发送和接收消息。

关于WebSockets如何工作的完整介绍超出了本文的范围。 请阅读RFC 6455，HTML5的WebSocket章节，或者Web上的许多介绍和教程之一。

请注意，如果WebSocket服务器在Web服务器（例如nginx）后面运行，则可能需要对其进行配置，以将WebSocket升级请求传递到WebSocket服务器。 同样，如果应用程序在云环境中运行，请检查云提供程序与WebSocket支持相关的说明。

### 3.1.1 HTTP 与 WebSocket比较

尽管WebSocket被设计为与HTTP兼容并以HTTP请求开始，但了解这两种协议导致非常不同的体系结构和应用程序编程模型是很重要的。

在HTTP和REST中，应用程序被建模为尽可能多的URL。要与应用程序客户端交互访问这些URL，请求 - 响应样式。服务器根据HTTP URL，方法和标头将请求路由到适当的处理程序。

相比之下，在WebSockets中，初始连接通常只有一个URL，随后所有应用程序消息都在同一个TCP连接上流动。这是一个完全不同的异步，事件驱动的消息体系结构。

WebSocket也是一种低级别传输协议，它不像HTTP那样规定消息内容的任何语义。这意味着除非客户端和服务器对消息语义达成一致，否则无法路由或处理消息。

WebSocket客户端和服务器可以通过HTTP握手请求中的“Sec-WebSocket-Protocol”头部来协商使用更高级别的消息传递协议（例如STOMP），或者在没有他们需要提供它们的情况下自己的约定。

### 3.1.2 什么时候使用websocket
WebSockets可以使网页动态和互动。然而，在许多情况下，Ajax和HTTP流和/或长轮询的组合可以提供简单而有效的解决方案。

例如，新闻，邮件和社交需要动态更新，但每隔几分钟就可以完成这一操作。另一方面，协作，游戏和财务应用程序需要更接近实时。

仅仅延迟并不是决定性因素。如果消息量相对较低（例如监视网络故障），则HTTP流或轮询可能会提供有效的解决方案。低延迟，高频率和高流量的组合，是WebSocket使用的最佳案例。

请记住，通过Internet，限制性代理不在您的控制范围内，可能会阻止WebSocket交互，因为它们未配置为传递upgrade头部，或者因为它们空闲时关闭长连接？这意味着在防火墙内部使用WebSocket用于内部应用程序是一个比直接面向公众的应用程序更直接的决定。

## 3.2 WebSocket API
Spring框架提供了一个WebSocket API，可用于编写处理WebSocket消息的客户端和服务器端应用程序。

### 3.2.1 WebSocketHandler
实现WebSocketHandler接口就可以简单的实现一个WebSocket了：
```java
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketSession;

public class MyWebSocketHandler implements WebSocketHandler {

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        // ...
    }
}
```

Spring WebFlux提供了一个WebSocketHandlerAdapter，它可以调整WebSocket请求并使用上述处理程序来处理生成的WebSocket会话。 将适配器注册为一个bean之后，可以将请求映射到您的处理程序，例如使用SimpleUrlHandlerMapping。 如下所示：
```java
@Configuration
static class WebConfig {

    @Bean
    public HandlerMapping handlerMapping() {
        Map<String, WebSocketHandler> map = new HashMap<>();
        map.put("/path", new MyWebSocketHandler());

        SimpleUrlHandlerMapping mapping = new SimpleUrlHandlerMapping();
        mapping.setUrlMap(map);
        mapping.setOrder(-1); // before annotated controllers
        return mapping;
    }

    @Bean
    public WebSocketHandlerAdapter handlerAdapter() {
        return new WebSocketHandlerAdapter();
    }
}
```

### 3.2.2 WebSocket Handshake
WebSocketHandlerAdapter本身不执行WebSocket握手。 相反，它委托给WebSocketService的一个实例。 默认的WebSocketService实现是HandshakeWebSocketService。

HandshakeWebSocketService对WebSocket请求执行基本检查，并委托给特定于服务器的RequestUpgradeStrategy。 目前Reactor Netty，Tomcat，Jetty和Undertow存在upgrade 策略。

### 3.2.3 Server config
每个服务器的RequestUpgradeStrategy公开可用于底层WebSocket引擎的与WebSocket相关的配置选项。 以下是在Tomcat上运行时设置WebSocket选项的示例：
```java
@Configuration
static class WebConfig {

    @Bean
    public WebSocketHandlerAdapter handlerAdapter() {
        return new WebSocketHandlerAdapter(webSocketService());
    }

    @Bean
    public WebSocketService webSocketService() {
        TomcatRequestUpgradeStrategy strategy = new TomcatRequestUpgradeStrategy();
        strategy.setMaxSessionIdleTimeout(0L);
        return new HandshakeWebSocketService(strategy);
    }
}
```

### 3.2.4 CORS
配置CORS和限制对WebSocket端点的访问的最简单方法是让WebSocketHandler实现CorsConfigurationSource并返回带有允许的来源，头部等的CorsConfiguraiton。如果由于任何原因您无法这样做，您还可以设置corsConfigurations属性，在SimpleUrlHandler上通过URL模式指定CORS设置。 如果两者都指定，则它们通过CorsConfiguration上的combine 方法进行组合。

## 3.3 WebSocketClient
Spring WebFlux为Reactor Netty，Tomcat，Jetty，Undertow和标准Java（即JSR-356）提供了WebSocketClient抽象。

*Tomcat客户端实际上是标准Java的一个扩展，在WebSocketSession处理中利用Tomcat特定的API来暂停接收背压信息的一些额外功能。*

要启动WebSocket会话，请创建客户端实例并使用其execute方法：
```java
WebSocketClient client = new ReactorNettyWebSocketClient();

URI url = new URI("ws://localhost:8080/path");
client.execute(url, session ->
        session.receive()
                .doOnNext(System.out::println)
                .then());
```
某些客户，例如 Jetty，实施生命周期并需要在停止使用前关闭。 所有客户端都具有与底层WebSocket客户端的配置相关的构造器参数。
