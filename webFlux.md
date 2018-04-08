[TOC]
# Spring WebFlux

## 简介

之前的spring 框架体系中的Web MVC框架的主要目的是构建关于Servlet和Servlet 容器的。在反应式技术栈中的web框架，Spring Flux 是在5.0以后加入的spring体系中的。它是完全无阻塞、支持背压框架Reactive Streams, 运行在Netty/Undertow 和 Servlet 3.1+的容器服务器上。
     
spring-webmvc和spring-webflux在spring 框架中都是都是存在的。每个都是可选的。应用可以选择其中的一个使用，或者两个都用，比如可以使用反应式的webclient的MVC controllers 。

### 为什么作为新的web 框架？

部分原因是需要一个非阻塞的可以使用较少的线程处理高并发，需要较少的硬件资源就可以进行扩展的框架。Servlet 3.1 已经针对非阻塞I/O提供了API。但是，使用这个会导致Servlet API的其余部分是同步的（比如Filter、Servlet）或者阻塞的（比如getParameter，getPart等 ）。添加新的公共API的动机就是让非阻塞横跨整个运行时。这一点很重要，因为诸如Netty这样的服务器已经在异步，非阻塞空间中很好地建立起来了。

另一部分原因是函数式编程。就像java 5添加的注解功能让我们可以通过注解实现REST controller 或者 测试用例一样，java 8添加的lambda表达式为函数式API创造了机会。对于非阻塞应用程序和延续式API来说，这是一个福音，正如CompletableFuture和ReactiveX所推广的那样，它允许声明式组合异步逻辑。 在编程模型层面，Java 8使Spring WebFlux能够在带注解的控制器的同时提供功能性的Web端点。

### 反应式：是什么？为什么？
我们谈到非阻塞和函数式编程，为什么要反应式的，这是什么意思呢？

术语"reactive"(响应式)是围绕对变化做出反应而建立的编程模型。比如网络组件对I/O事件做出反应，UI控制器对鼠标事件做出反应等。从这个意义上说，非阻塞是被动的，因为不是被阻塞，而是当操作完成或数据可用时，我们现在处于对通知作出反应的模式。

还有另外一个比较重要的机制就是，spring 团队提供的反应式是非阻塞的背压处理。在同步情况下，命令式的代码中，服务端会阻塞调用者强制等待。 在非阻塞代码中，控制事件发生率非常重要，以便快速生产者不会压跨服务器。

Reactive Streams是一个小规格，也在Java 9中采用，它定义了背压异步组件之间的交互。例如，数据存储库（作为发布服务器）可以生成数据，以便作为订阅服务器的HTTP服务器可以写入响应。 Reactive Streams的主要目的是允许用户控制发布者产生数据的速度。

*常见问题：如果发布者不能降低速度怎么办？*
反应流的目的只是建立机制和边界。 如果发布商不能放慢速度，那么它必须决定是否缓冲，丢弃或失败。

### 反应式API
反应流在互操作性方面发挥着重要作用。 它对依赖包和基础设施组件很有用，但作为应用程序API的用处不大，因为它太底层了。应用程序需要更高级别和更丰富的功能API来组成异步逻辑 -，类似于Java 8 Stream API，但它不仅仅适用于集合。 这就是反应式库发挥的作用。

Reactor是Spring WebFlux的反应性库。 它提供了Mono和Flux API类型，通过与ReactiveX的丰富操作符来处理0..1和0..N的数据序列。 Reactor是一个Reactive Streams库，因此它的所有操作员都支持非阻塞背压。 Reactor强烈关注服务器端Java。 它是与Spring密切合作开发的。

WebFlux需要Reactor作为核心依赖项，但它可以通过Reactive Streams与其他反应式库进行互操作。作为一般规则，WebFlux API接受一个普通的Publisher作为输入，在内部将它调整为Reactor类型，使用它们，然后返回Flux或Mono作为输出。因此，您可以通过任何发布作为输入，并且可以对输出进行操作，但您需要调整输出以供其他反应式库使用。只要可行，例如带注解的控制器，WebFlux完全适应RxJava或其他反应性库的使用。 有关更多详细信息，请参阅Reactive Libraries。

### 编程模型
Spring-Web模块包含Spring WebFlux的基础，这些基础包括HTTP抽象，受支持服务器的Reactive Streams适配器，编解码器以及可与Servlet API相媲美但具有非阻塞协议的核心WebHandler API。

在此基础上，Spring WebFlux提供了两种编程模型供选择：
- Annotated Controllers
  与Spring MVC一样，并基于spring-web模块中的相同注解。 Spring MVC和WebFlux控制器都支持响应式（Reactor，RxJava）返回类型，因此很难区分它们。 一个显著的区别是WebFlux也支持被动的@RequestBody参数。
- Functional Endpoints
  基于lambda表达式，轻量级，函数式编程模型。把它想象成一个小型库或应用程序可以用来路由和处理请求的一组实用程序。 与Annotated Controllers的最大区别在于前者应用程序负责从头到尾的请求处理，后者通过注解声明意图并被回调。

### 选择一个web框架
你应该使用Spring MVC还是WebFlux？ 我们来介绍一些不同的观点。

如果你有个spring MVC的应用程序工作的很好，没必要修改。命令式编程是最容易编写、理解和debug的代码。由于历来都是阻塞是编程，所以依赖包有非常多的选择。

如果你已经开始了非阻塞的web方式，那么spring WebFlux提供了与其他在这个领域的框架一样的执行模式优势，并且提供了多种服务器选择，如Netty/tomcat/Jetty/Undertow,Servlet3.1+容器。编程模式的选择，注解控制器和函数式web端点，反应式依赖包选择，Reactor、RxJava 或者其他的。

如果你对轻量级，使用java 8的lambdas表达式或者Kotlin的函数式web框架感兴趣，那么请使用Spring WebFlux 函数式web端点。对于较小的应用程序或微服务来说，这也可能是一个不错的选择，这些应用程序或复杂的需求可以从更高的透明度和控制中受益。

在微服务体系结构中，您可以将应用程序与Spring MVC或Spring WebFlux控制器或Spring WebFlux函数式端点混合使用。 在两个框架中支持相同的基于注解的编程模型使得重用知识变得更加容易，同时也为正确的工作选择正确的工具。

评估应用程序的简单方法是检查它的依赖关系。 如果您使用了阻塞API，例如持久性API（JPA，JDBC）或网络操作API，那么Spring MVC至少是常见体系结构的最佳选择。 使用Reactor和RxJava在单独的线程上执行阻塞调用在技术上是可行的，但是您不会充分利用非阻塞的Web栈。

如果您有一个调用远程服务的Spring MVC应用程序，请尝试使用反应式WebClient。 您可以直接从Spring MVC控制器方法返回反应类型（Reactor，RxJava或其他）。 每次调用的延时越长，或者调用间的相互依赖性越强，这个作用越明显。 Spring MVC控制器也可以调用其他反应式组件。

如果你有一个庞大的团队，记住转向非阻塞，函数式和声明式编程的陡峭的学习曲线。 不用完全切换到使用反应式WebClient。 除此之外，开始小范围使用，并衡量它的好处。 我们预计，对于广泛的应用来说，这种转变是不必要的。

如果您不确定有哪些好处，请先了解非阻塞I / O如何工作（例如Node.js，单线程与并发不矛盾）及其影响。它的标签是“以较少硬件进行伸缩”，但不能保证这种效果，并非没有一些网络I / O可能很慢或不可预测。 这个Netflix博客文章是一个很好的资源。

### 选择一个服务器
Netty，Undertow，Tomcat，Jetty和Servlet 3.1+容器支持Spring WebFlux。 每个服务器都适用于通用的Reactive Streams API。 Spring WebFlux编程模型建立在该通用API上。

*常见问题：Tomcat和Jetty 怎么在两种方式下都能用？*
Tomcat和Jetty的核心是非阻塞的。 它是添加了阻塞门面的Servlet API。 从版本3.1开始，Servlet API为非阻塞I / O添加了一个选项。 然而，其使用需要注意避免其他同步和阻塞部分。 由于这个原因，Spring的反应式Web栈有一个底层的Servlet适配器来连接到Reactive Streams，但是Servlet API不能直接使用。

Spring Boot 2在WebFlux中默认使用Netty，因为Netty在异步，非阻塞领域中得到了更广泛的应用，并且还提供了可共享资源的客户端和服务器。 通过比较，Servlet 3.1非阻塞I / O没有太多用处，因为使用它的门槛有点高。 Spring WebFlux开启了一条实用的应用途径。

Spring Boot中的默认服务器选择主要关于开箱即用体验。 应用程序仍然可以选择任何其他受支持的服务器，这些服务器还针对性能进行了高度优化，完全无阻塞，并适用于反应式背压。 在Spring Boot中，切换很容易。

### 性能与可伸缩
性能有很多特点和意义。 反应式和非阻塞通常不会使应用程序运行得更快。 在某些情况下可以，例如，使用WebClient并行执行远程调用。 总的来说，它需要更多的工作来完成非阻塞方式，并且可以稍微增加所需的处理时间。

反应式和非阻塞的关键预期好处是能够使用少量固定数量的线程和较少的内存进行扩展。 这使得应用程序在负载下更具弹性，因为它们以更可预测的方式进行扩展。 为了观察这些好处，您需要有一些延迟，包括缓慢和不可预知的网络I / O。 这就是反应式开始显示其优势的地方，差异可能非常大。

## Reactive Spring web
spring-web模块提供底层基础设施和HTTP抽象 - 客户端和服务器，以构建反应式Web应用程序。 所有的公共API都是以Reactor作为后台实现来构建的。

服务器支持分为两层：
- HttpHandler 和 服务适配器
  含有反应式背压的处理HTTP请求的最基础的、公共API
- WebHandler API 
  稍高的级别，但仍然是通用服务器Web API，具有过滤器链式处理。

### HttpHandler
每个HTTP服务器都有一些用于HTTP请求处理的API。 HttpHandler是一种处理请求和响应的简单协议。 它是故意进行了最小化。 其主要目的是为不同服务器上的HTTP请求处理提供基于Reactive Streams的通用API。

spring-web模块包含的对每种支持的服务器的适配器。下面的这张表显示了使用了哪些服务器API和ReactiveStreams的支持来自哪里:


| 服务器名称   | API  |   ReactiveStreams支持|
|--------------|------|-------------------------|
|Netty            |Netty API |     Reactor Netty |
|Undertow     |Undertow API |    spring-web: Undertow to Reactive Streams bridge|
|Tomcat         |Servlet 3.1 non-blocking I/O; Tomcat API to read and write ByteBuffers vs byte[]| spring-web: Servlet 3.1 non-blocking I/O to Reactive Streams bridge|
|Jetty |    Servlet 3.1 non-blocking I/O; Jetty API to write ByteBuffers vs byte[]|  spring-web: Servlet 3.1 non-blocking I/O to Reactive Streams bridge|
|Servlet 3.1 container|    Servlet 3.1 non-blocking I/O|   spring-web: Servlet 3.1 non-blocking I/O to Reactive Streams bridge|


下面是一些针对各个服务器的必要的依赖、支持的版本和代码片段。

|Server name  |  Group id |    Artifact name|
|---------------|------------|------------------|
|Reactor Netty |   io.projectreactor.ipc |   reactor-netty|
|Undertow   | io.undertow   | undertow-core|
|Tomcat    |org.apache.tomcat.embed  |  tomcat-embed-core|
|Jetty  |  org.eclipse.jetty  |  jetty-server,  jetty-servlet|

- Reactor Netty
```java
HttpHandler handler = ...
ReactorHttpHandlerAdapter adapter = new ReactorHttpHandlerAdapter(handler);
HttpServer.create(host, port).newHandler(adapter).block();
```

- Undertow

```java
HttpHandler handler = ...
UndertowHttpHandlerAdapter adapter = new UndertowHttpHandlerAdapter(handler);
Undertow server = Undertow.builder().addHttpListener(port, host).setHandler(adapter).build();
server.start();
```

- Tomcat

```java
HttpHandler handler = ...
Servlet servlet = new TomcatHttpHandlerAdapter(handler);

Tomcat server = new Tomcat();
File base = new File(System.getProperty("java.io.tmpdir"));
Context rootContext = server.addContext("", base.getAbsolutePath());
Tomcat.addServlet(rootContext, "main", servlet);
rootContext.addServletMappingDecoded("/", "main");
server.setHost(host);
server.setPort(port);
server.start();
```

- Jetty

```java
HttpHandler handler = ...
Servlet servlet = new JettyHttpHandlerAdapter(handler);

Server server = new Server();
ServletContextHandler contextHandler = new ServletContextHandler(server, "");
contextHandler.addServlet(new ServletHolder(servlet), "/");
contextHandler.start();

ServerConnector connector = new ServerConnector(server);
connector.setHost(host);
connector.setPort(port);
server.addConnector(connector);
server.start();
```

*要将WAR部署为Servlet 3.1+容器，请使用ServletHttpHandlerAdapter包装HttpHandler并将其注册为Servlet。 这可以通过使用AbstractReactiveWebInitializer自动完成。*

### WebHandler API

HttpHandler是在不同的HTTP服务器上运行的最底层的协议。 在这个基础之上，WebHandler API提供了一个稍微高一点的，但仍然是通用的一组组件，这些组件构成了WebExceptionHandler，WebFilter和WebHandler的链。

所有WebHandler API组件都以ServerWebExchange作为输入，在ServerHttpRequest和ServerHttpResponse之上，为Web应用程序提供额外的构建块，例如请求属性，会话属性，对解析表单数据的访问，文件上传等等。

WebHttpHandlerBuilder用于组装请求处理链。 您可以使它的方法来手动添加组件，或者更有可能通过Spring ApplicationContext获取它们，并通过服务器适配器运行HttpHandler准备好的结果。
```java
ApplicationContext context = ...
HttpHandler handler = WebHttpHandlerBuilder.applicationContext(context).build()
```

#### 特殊的bean类型
下表列出了一些WebHttpHandlerBuilder可以从容器中获取的组件：

|Bean name |   Bean type  |  Count   | Description|
|-------------|--------------|----------|---------------|
|any   | WebExceptionHandler |   0..N |   Exception handlers to apply after all WebFilter's and the target WebHandler.|
|any  | WebFilter  |  0..N  |  Filters to invoke before and after the target WebHandler.|
|"webHandler" |   WebHandler |   1 |   The handler for the request.|
|"webSessionManager" |   WebSessionManager   | 0..1   | The manager for WebSession's exposed through a method on ServerWebExchange.DefaultWebSessionManager by default.|
|"serverCodecConfigurer" |   ServerCodecConfigurer   | 0..1   | For access to HttpMessageReader's for parsing form data and multipart data that’s then exposed through methods on ServerWebExchange.ServerCodecConfigurer.create() by default.|
|"localeContextResolver"   | LocaleContextResolver  |  0..1 |   The resolver for LocaleContextexposed through a method on ServerWebExchange.AcceptHeaderLocaleContextResolverby default.|


#### 表单数据

ServerWebExchange 暴露了下面的方法，可以获取表单数据

```java
Mono<MultiValueMap<String, String>> getFormData();
```


DefaultServerWebExchange使用配置的HttpMessageReader将表单数据（“application / x-www-form-urlencoded”）解析为MultiValueMap。 默认情况下，FormHttpMessageReader被配置为通过ServerCodecConfigurer bean使用（请参阅Web Handler API）。

#### 文件上传

ServerWebExchange 暴露了下面的方法可以获取上传文件的数据：
```java
Mono<MultiValueMap<String, Part>> getMultipartData();
```

DefaultServerWebExchange使用配置的HttpMessageReader <MultiValueMap <String，Part>将“multipart / form-data”内容解析为MultiValueMap。 目前Synchronoss NIO Multipart是唯一支持的第三方库，也是我们唯一知道的用于非阻塞解析多部分请求的库。 它通过ServerCodecConfigurer bean启用（请参阅Web处理程序API）。

要以流方式解析多部分数据，请使用从HttpMessageReader <Part>返回的Flux <Part>。 例如，在注解控制器中，使用@RequestPart意味着按名称对各个部分进行类似Map的访问，因此需要完整地解析多部分数据。 相比之下，@RequestBody可用于将内容解码到Flux <Part>，而不会收集到MultiValueMap。

### HTTP消息编解码

spring-web模块定义HttpMessageReader和HttpMessageWriter协议，通过Rective Streams Publisher's对HTTP请求和响应的主体进行编码和解码。 这些行为在客户端使用，例如， 在WebClient中，在服务器端，例如 在注解的控制器和功能端点中。

Spring-core模块定义了独立于HTTP的Encoder和Decoder，并依赖于（如Netty ByteBuf和java.nio.ByteBuffer（请参阅数据缓冲区和编解码器））的DataBuffer协议。 Encoder可以用EncoderHttpMessageWriter包装以用作HttpMessageWriter，而Decoder可以用DecoderHttpMessageReader包装以用作HttpMessageReader。

Spring-core模块包含byte []，ByteBuffer，DataBuffer，Resource和String的基本编码器和解码器实现。 Spring-Web模块为Jackson JSON，Jackson Smile和JAXB2增加了Encoder和Decoder。 Spring-Web模块还包含一些针对服务器发送事件，表单数据和多部分请求的特定于Web的readers 和writers 。

要配置或自定义readers 和writers ，通常会使用ClientCodecConfigurer或ServerCodecConfigurer。

#### Jackson
decoder依靠Jackson的非阻塞字节数组解析器将字节块流解析为TokenBuffer流，然后可以将其转换为Jackson的ObjectMapper对象。 目前支持JSON和Smile（二进制JSON）数据格式。

编码Publisher<?> 的流程如下：
- 如果Publisher是Mono（即单个值），则该值在可用时被编码。
- 如果media 类型是 `application/stream+json` 或者 `application/stream+x-jackson-smile` 则每个值都单独编码（中间使用新行）
- 否则将使用Flux＃collectToList（）收集Publisher中的所有项目，并将生成的编码集合转为数组。

作为上述规则的一个特例，ServerSentEventHttpMessageWriter将Publisher发出的项单独作为Mono <？>提供给Jackson2JsonEncoder。

请注意，Jackson JSON编码器和解码器都明确不渲染String类型的元素。 相反，String被视为低级内容（即序列化的JSON），并由CharSequenceEncoder按原样呈现。 如果你想把一个Flux <String>渲染成JSON数组，你必须使用Flux＃collectToList（）并提供一个Mono <List <String >>。

## DispatcherHandler
像Spring MVC一样，Spring WebFlux围绕前端控制器模式进行设计，中央WebHandler（DispatcherHandler）为请求处理提供共享算法，而实际工作由可配置的委托组件执行。 该模型非常灵活，支持多种工作流程。

DispatcherHandler通过Spring配置发现它需要的委托组件。 它也被设计成一个Spring bean，并实现ApplicationContextAware来访问它所运行的上下文。如果DispatcherHandler是用bean名称“webHandler”声明的，它会被WebHttpHandlerBuilder发现，它将会像WebHandler API描述的那样与请求处理链放在一起 。

WebFlux应用程序中的Spring配置通常包含：
- 一个名称为webHandler的DispatcherHandler类型的bean
- WebFilter 和WebExceptionHandler beans
- DispatcherHandler 特殊beans
- 其他

WebHttpHandlerBuilder 将那个配置信息进行构建处理链：
```java
ApplicationContext context = ...
HttpHandler handler = WebHttpHandlerBuilder.applicationContext(context);
```
至此HttpHandler已经准备好供服务器适配器使用。

### 特殊bean类型

DispatcherHandler委托特殊的bean来处理请求并呈现相应的响应。 “特殊bean”是指实现WebFlux框架协议的Spring管理的对象实例。 这些通常是内置的，但您可以自定义其属性，然后进行扩展或替换。

下表是DispatcherHandler可以获取到的特殊beans，注意，也有一些其他在底层可以获取的bean。

|Bean类型  |  解释说明|
|------------|----------|
|HandlerMapping |   将请求映射到处理器。 该映射基于一些标准，其细节因HandlerMapping实现而异 - 注解的控制器，简单的URL模式映射等。HandlerMapping的主要实现是用于@RequestMapping注解方法的RequestMappingHandlerMapping，用于功能性端点路由的RouterFunctionMapping以及用于显式注册URI路径模式和WebHandler's的SimpleUrlHandlerMapping。|
|HandlerAdapter|帮助DispatcherHandler调用映射到请求的处理器，而不管实际如何调用处理程序。 例如调用一个带注解的控制器需要解析注解。 HandlerAdapter的主要目的是屏蔽DispatcherHandler的细节。|
|HandlerResultHandler|    处理 处理器的执行结果并且进行响应|

### WebFlux配置
应用程序可以声明处理请求所需的Web Handler API 和DispatcherHandler下列出的基础架构Bean。 但是在大多数情况下，WebFlux配置是最好的起点。 它声明所需的bean并提供更高级别的配置回调API来定制它。
*Spring Boot依靠WebFlux配置来配置Spring WebFlux，并且还提供了许多额外的方便选项。*

### Processing
DispatcherHandler 处理请求的流程如下：
- 要求每个HandlerMapping 找到一个匹配的handler，并且使用第一个匹配的
- 如果能找到一个handler，就通过相应的HandlerAdapter进行执行并且返回HandlerResult
- 返回的HandlerResult被发送给对应的HandlerResultHandler去完成处理过程，直接写到一个用视图选择的响应里。

### Result Handling
当DispatcherHandler需要处理来自handler的返回值时，它会找到支持它并调用它的HandlerResultHandler。 下面列出了它们的默认顺序（全部在WebFlux配置中声明）：
- ResponseEntityResultHandler 
  处理通常从注解控制器返回的ResponseEntity返回值。 由于按类型安全地匹配返回值，因此该顺序设置为0。
- ServerResponseResultHandler 
   处理通常从函数式端点返回的ServerResponse返回值。 由于按类型安全地匹配返回值，因此该顺序设置为0。
- ResponseBodyResultHandler 
   处理通常从使用@RestController 注解的类的@ResponseBody 方法返回值。顺序设置为100,即在结果处理器后面进行校验特殊类型
- ViewResolutionResultHandler 
为HTML模板渲染执行视图匹配算法。 由于它支持多种特定类型，例如，String, Map, Rendering等，所以优先级设置最低Ordered.LOWEST_PRECEDENCE，但也会将其他对象视为模型属性。

###  View Resolution
View Resolution能够使用HTML模板和数据呈现给浏览器，而无需将您绑定到特定的视图技术。 在Spring WebFlux中，通过专用的HandlerResultHandler来支持视图解析，HandlerResultHandler使用ViewResolver将表示逻辑视图名称的String映射到View实例。 该视图然后用于呈现响应。

#### Handling
传递给ViewResolutionResultHandler的HandlerResult包含来自处理程序的返回值以及包含在请求处理过程中添加的属性的模型。返回值将被处理成下面的一种：

- String, CharSequence
  一个逻辑视图名，在ViewResolver配置的其中一个
- void 
   根据请求路径去掉前导斜杠和尾部斜杠选择默认视图名称，并将其解析为视图。 当没有提供视图名称时也是如此，例如 模型属性被返回，或者异步返回值，例如 空的Mono。
- Rendering
 视图解析API接口类型; 使用代码完成功能探索IDE中的选项。
- Model, Map 
添加额外的模型属性到请求的模型中。
- 任何其他情况
任何其他返回值（BeanUtils＃isSimpleProperty确定的简单类型除外）都被视为要添加到模型的模型属性。 除非处理方法存在@ModelAttribute注解，否则属性名称是使用约定从Class名称派生的。

该模型可以包含异步，反应式类型（例如来自Reactor，RxJava）。 在渲染之前，AbstractView将这些模型属性解析为具体的值并更新模型。 单值反应类型被分解为单个值，或者在多值反应类型时被解析为无值（如果为空）， Flux <T>被收集并解析为List <T>。

配置一个view resolution 就是添加一个ViewResolutionResultHandler类型的bean到spring 配置当中那么简单。WebFlux Config 为配置view resolution提供了一个专门的配置API。

#### Redirecting
视图名称关键字`redirect:`前缀允许执行重定向。 UrlBasedViewResolver（和子类）将此识别为需要重定向的指令。 视图名称的其余部分是重定向URL。
使用控制器返回RedirectView或Rendering.redirectTo（“abc”）.build（）（）一样的效果，但现在控制器内部可以简单地按逻辑视图名称操作。 视图名称（如redirect：/ some / resource）是当前应用程序内部，而视图名称redirect：http：//example.com/arbitrary/path将重定向到绝对URL。

#### 内容协商
ViewResolutionResultHandler 支持内容协商。它会比较请求和选择的View支持的媒体类型，会使用第一个支持的请求media类型。
为了支持JSON和XML等媒体类型，Spring WebFlux提供了HttpMessageWriterView，它是一个通过HttpMessageWriter呈现的特殊视图。 通常您可以通过WebFlux配置将这些配置为默认视图。 如果默认视图与请求的媒体类型匹配，则始终选择并使用它们。

## 注解Controller
Spring WebFlux提供了一种基于注解的编程模型，其中@Controller和@RestController组件使用注解来表示请求映射，请求输入，异常处理等。 带注解的控制器具有灵活的方法签名，不必扩展基类，也不需要实现特定的接口。
```java
@RestController
public class HelloController {

    @GetMapping("/hello")
    public String handle() {
        return "Hello WebFlux";
    }
}
```


在上面的示例中，这个方法返回的字符串将会被写入响应体中。

### @Controller
你可以用一个标准的Spring bean作为controller。
@Controller允许自动检测，与Spring其他支持一致，用于检测类路径中的@Component类，并为它们自动注册bean定义，让它作为Web组件。

为了开启扫描@Controller，你可以用Java代码添加组件扫描注解:
```java
@Configuration
@ComponentScan("org.example.web")
public class WebConfig {

    // ...
}
```

@RestController是一个组合注解，它自己被@Controller和@ResponseBody进行了标注，使用它标注的类的每个方法都会继承@ResponseBody注解。所以直接把返回值写入响应体，不在进行视图解析渲染。

### Request Mapping
@RequestMapping注解是用来把请求映射到controller方法上。它有很多属性用来匹配URL、HTTP请求方法，请求参数、请求头和媒体类型。可以用在Class上表示共用的前置路径，方法级上就是详细 路径。

还有@RequestMapping的HTTP方法特定的快捷方式：
- @GetMapping
- @PostMapping
- @PutMapping
- @DeleteMapping
- @PatchMapping
以上是提供的开箱即用的自定义注解，因为可以说大多数控制器方法应该映射到特定的HTTP方法，而不是使用默认情况下与所有HTTP方法相匹配的@RequestMapping。 同样，在类级别仍需要@RequestMapping来表示共用映射。

以下是类型和方法级别映射的示例：
```java
@RestController
@RequestMapping("/persons")
class PersonController {

    @GetMapping("/{id}")
    public Person getPerson(@PathVariable Long id) {
        // ...
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void add(@RequestBody Person person) {
        // ...
    }
}
```
#### URI匹配规则
你可以使用glob模式和通配符类映射请求：
- `?` 匹配单个字符
- `*` 在单个目录上匹配0个或多个字符
- `**` 可以匹配多个目录上的0个或者多个字符

你也可以生命URI变量，并且通过@PathVariable访问他们：
```java
@GetMapping("/owners/{ownerId}/pets/{petId}")
public Pet findPet(@PathVariable Long ownerId, @PathVariable Long petId) {
    // ...
}
```

URI变量可以在类和方法级别定义：
```java
@Controller
@RequestMapping("/owners/{ownerId}")
public class OwnerController {

    @GetMapping("/pets/{petId}")
    public Pet findPet(@PathVariable Long ownerId, @PathVariable Long petId) {
        // ...
    }
}
```

URI变量会自动转换为恰当的类型，或者抛出`TypeMismatchException`。默认支持int/long/Date等类型，你可以注册任何其他类型。可以查看 Type Conversion 和 Binder Methods.

URI变量可以明确指定名称，例如@PathVariable("customId")，如果你的代码编译时包含了debugging 信息或者在java 8 指定了`-parameters`参数，可以省略名称。

`{*varName}`声明了一个URI变量，匹配0个或多个字符，例如`/resources/{*path}` 匹配所有的`/resources/`下的路径，并且变量`path`捕获了相对路径。
`{varName:regex}`声明了一个正则表达式变量，例如给定路径`/spring-web-3.0.5 .jar`,下面的方法或提取出名称、版本和扩展名：
```java
@GetMapping("/{name:[a-z-]+}-{version:\\d\\.\\d\\.\\d}{ext:\\.[a-z]+}")
public void handle(@PathVariable String version, @PathVariable String ext) {
    // ...
}
```

URI匹配模式也可以包含占位符`${...}`，PropertyPlaceHolderConfigurer从本地、系统变量、环境变量和其他配置文件中解析。这个可以用来参数化一些外部配置。

*Spring WebFlux使用PathPattern和PathPatternParser进行URI路径匹配支持，这两者都位于spring-web中，并且明确设计用于在运行时匹配大量URI路径模式的Web应用程序中的HTTP URL路径。*

Spring WebFlux不支持后缀模式匹配 - 不同于Spring MVC，像/ person这样的映射也与/person.*匹配。 对于基于URL的内容协商，如果需要，我们建议使用查询参数，该参数更简单，更明确，并且不易受基于URL路径的攻击的影响。

#### 模式比较
如果有多个模式匹配一个URL，必须找出一个最佳匹配。PathPattern.SPECIFICITY_COMPARATOR 查找最佳匹配。

对于每种模式，根据URI变量和通配符的数量来计算得分。URI变量得分低于通配符的， 总分较低的模式获胜。 如果两种模式具有相同的分数，则选择较长的模式。

全部匹配的模式，例如`**`,`{*varName}`,不进行计算得分，并且始终放在最后。如果两个全部匹配模式都匹配，那么选择较长的模式。

#### Consumable Media Types
你可以通过`Content-Type`限定请求：
```java
@PostMapping(path = "/pets", consumes = "application/json")
public void addPet(@RequestBody Pet pet) {
    // ...
}
```


consumes属性也可以使用取反表达式，例如`!text/plain`表示出了此类型之外的类型。

你可以在Class上定义一个公用的consumes. 不像其他的请求映射属性。但是如果方法级别指定了consumes，将会覆盖Class级别上的。

*MediaType为常用的媒体类型提供常量 - 例如 APPLICATION_JSON_VALUE，APPLICATION_JSON_UTF8_VALUE*

####  Producible Media Types
你可以使用请求头`Accept`来限定请求：
```java
@GetMapping(path = "/pets/{petId}", produces = "application/json;charset=UTF-8")
@ResponseBody
public Pet getPet(@PathVariable String petId) {
    // ...
}
```

produces 属性也可以使用取反表达式，例如`!text/plain`表示出了此类型之外的类型。

你可以在Class上定义一个公用的produces . 不像其他的请求映射属性。但是如果方法级别指定了produces ，将会覆盖Class级别上的。
*MediaType为常用的媒体类型提供常量 - 例如 APPLICATION_JSON_VALUE，APPLICATION_JSON_UTF8_VALUE*

#### Parameters and Headers
你可以用请求参数来限定请求，可以指定存在查询参数`myParam`或不存在`!myParam`，或等于某个指定值`myParam=myValue`:
```java
@GetMapping(path = "/pets/{petId}", params = "myParam=myValue")
public void findPet(@PathVariable String petId) {
    // ...
}
```

你也可以使用请求头来作为条件：
```java
@GetMapping(path = "/pets", headers = "myHeader=myValue")
public void findPet(@PathVariable String petId) {
    // ...
}
```

#### HTTP HEAD, OPTIONS
@GetMapping - 还有@RequestMapping（method = HttpMethod.GET），为了请求映射的目的，透明地支持HTTP HEAD。 Controller方法不需要改变。 在HttpHandler服务器适配器中应用的响应包装可确保将“Content-Length”标头设置为写入的字节数，而无需实际写入响应。

默认情况下，通过将“Allow”响应头设置为所有具有匹配URL模式的@RequestMapping方法中列出的HTTP方法列表来处理HTTP OPTIONS。

对于没有HTTP方法声明的@RequestMapping，“Allow”头设置为“GET，HEAD，POST，PUT，PATCH，DELETE，OPTIONS”。 控制器方法应该总是声明支持的HTTP方法，例如通过使用特定于HTTP方法的变体 - @GetMapping，@ PostMapping等。

@RequestMapping方法可以显式映射到HTTP HEAD和HTTP OPTIONS，但在常见情况下这不是必需的。

#### Custom Annotations
Spring WebFlux支持使用组合注解进行请求映射。 这些注解本身是用@RequestMapping进行元注解的，并且用更限定，更具体的目的重新声明@RequestMapping属性的子集（或全部）。

@GetMapping，@PostMapping，@PutMapping，@DeleteMapping和@PatchMapping是组合注解的示例。 它们是开箱即用的，因为大多数控制器方法应该映射到特定的HTTP方法，而不是使用默认情况下与所有HTTP方法相匹配的@RequestMapping。 如果您需要组合注解的示例，请查看如何声明这些注解。

Spring WebFlux还支持自定义请求映射属性和自定义请求匹配逻辑。 这是一个更高级的选项，需要继承RequestMappingHandlerMapping并重写getCustomMethodCondition方法，您可以在其中检查自定义属性并返回自己的RequestCondition。

### Handler methods

@RequestMapping处理程序方法具有灵活的签名，可以从一系列支持的控制器方法参数和返回值中进行选择。

#### Method arguments
下表显示支持的控制器方法参数。

反应式类型（Reactor，RxJava或其他）在需要阻塞I / O的参数上受支持待解决，例如 读取请求正文。 这在描述栏中进行了标记。 在不需要阻塞的参数上不需要反应类型。

支持JDK 1.8的java.util.Optional作为方法参数，相当于required属性- 例如 @RequestParam，@RequestHeader等，并相当于required = false。

|参数  |  描述|
|------|------|
|ServerWebExchange |   Access to the full ServerWebExchange — container for the HTTP request and response, request and session attributes, checkNotModified methods, and others.|
|ServerHttpRequest, ServerHttpResponse   | Access to the HTTP request or response.|
|WebSession |   Access to the session; this does not force the start of a new session unless attributes are added. Supports reactive types.|
|java.security.Principal  |  Currently authenticated user; possibly a specific Principal implementation class if known. Supports reactive types|
|org.springframework.http.HttpMethod  |  The HTTP method of the request.|
|java.util.Locale |   The current request locale, determined by the most specific LocaleResolver available, in effect, the configured LocaleResolver/LocaleContextResolver.|
|Java 6+: java.util.TimeZone,Java 8+: java.time.ZoneId  |  The time zone associated with the current request, as determined by a LocaleContextResolver.|
|@PathVariable  |  For access to URI template variables. See URI Patterns.|
|@MatrixVariable |   For access to name-value pairs in URI path segments. See Matrix variables.|
|@RequestParam |   For access to Servlet request parameters. Parameter values are converted to the declared method argument type. See @RequestParam.Note that use of @RequestParam is optional, e.g. to set its attributes. See "Any other argument" further below in this table.|
|@RequestHeader |   For access to request headers. Header values are converted to the declared method argument type. See @RequestHeader.|
|@CookieValue |   For access to cookies. Cookies values are converted to the declared method argument type. See @CookieValue.|
|@RequestBody  |  For access to the HTTP request body. Body content is converted to the declared method argument type using HttpMessageReader's. Supports reactive types. @RequestBody.|
|HttpEntity<B> |   For access to request headers and body. The body is converted with HttpMessageReader's. Supports reactive types. See HttpEntity.|
|@RequestPart   | For access to a part in a "multipart/form-data" request. Supports reactive types. See Multipart and Multipart data.|
|java.util.Map, org.springframework.ui.Model, org.springframework.ui.ModelMap  |  For access to the model that is used in HTML controllers and exposed to templates as part of view rendering.|
|@ModelAttribute  |  For access to an existing attribute in the model (instantiated if not present) with data binding and validation applied. See @ModelAttribute as well as Model Methodsand Binder Methods.Note that use of @ModelAttribute is optional, e.g. to set its attributes. See "Any other argument" further below in this table.|
|Errors, BindingResult  |  For access to errors from validation and data binding for a command object (i.e. @ModelAttribute argument), or errors from the validation of an @RequestBody or@RequestPart arguments; an Errors, or BindingResult argument must be declared immediately after the validated method argument.|
|SessionStatus + class-level @SessionAttributes |   For marking form processing complete which triggers cleanup of session attributes declared through a class-level @SessionAttributes annotation. See@SessionAttributes for more details.|
|UriComponentsBuilder |   For preparing a URL relative to the current request’s host, port, scheme, context path, and the literal part of the servlet mapping also taking into account Forwarded and X-Forwarded-* headers.|
|@SessionAttribute   | For access to any session attribute; in contrast to model attributes stored in the session as a result of a class-level @SessionAttributes declaration. See@SessionAttribute for more details.|
|@RequestAttribute   | For access to request attributes. See @RequestAttribute for more details.|
|Any other argument  |  If a method argument is not matched to any of the above, by default it is resolved as an @RequestParam if it is a simple type, as determined by BeanUtils#isSimpleProperty, or as an @ModelAttribute otherwise.|

#### 返回值
下表显示支持的控制器方法返回值。 请注意，对于所有返回值，通常都支持来自库（如Reactor，RxJava或其他）的反应式类型。

|返回值|  描述|
|-------|------|
|@ResponseBody |   The return value is encoded through HttpMessageWriter's and written to the response. See @ResponseBody.|
|HttpEntity<B>, ResponseEntity<B>  |  The return value specifies the full response including HTTP headers and body be encoded through HttpMessageWriter's and written to the response. See ResponseEntity.|
|HttpHeaders  |  For returning a response with headers and no body.|
|String  |  A view name to be resolved with ViewResolver's and used together with the implicit model — determined through command objects and @ModelAttribute methods. The handler method may also programmatically enrich the model by declaring a Model argument (see above).|
|View  |  A View instance to use for rendering together with the implicit model — determined through command objects and @ModelAttribute methods. The handler method may also programmatically enrich the model by declaring a Model argument (see above).|
|java.util.Map, org.springframework.ui.Model |   Attributes to be added to the implicit model with the view name implicitly determined based on the request path.|
|@ModelAttribute |   An attribute to be added to the model with the view name implicitly determined based on the request path.Note that @ModelAttribute is optional. See "Any other return value" further below in this table.|
|Rendering  |  An API for model and view rendering scenarios.|
|void  |  A method with a void, possibly async (e.g. Mono<Void>), return type (or a null return value) is considered to have fully handled the response if it also has a ServerHttpResponse, or a ServerWebExchange argument, or an @ResponseStatus annotation. The same is true also if the controller has made a positive ETag or lastModified timestamp check.If none of the above is true, a void return type may also indicate "no response body" for REST controllers, or default view name selection for HTML controllers.|
|Flux<ServerSentEvent>, Observable<ServerSentEvent>, or other reactive type |   Emit server-sent events; the SeverSentEventwrapper can be omitted when only data needs to be written (however text/event-stream must be requested or declared in the mapping through the produces attribute).|
|Any other return value |   If a return value is not matched to any of the above, by default it is treated as a view name, if it is String or void (default view name selection applies); or as a model attribute to be added to the model, unless it is a simple type, as determined byBeanUtils#isSimpleProperty in which case it remains unresolved.|

#### 类型转换

如果参数声明为String以外的其他参数，一些基于字符串的请求输入的方法参数 - 例如 @RequestParam，@RequestHeader，@ PathVariable，@MatrixVariable和@CookieValue可能需要进行类型转换。
对于这种情况，基于配置的转换器自动应用类型转换。 默认情况下，支持int，long，Date等简单类型。 可以通过WebDataBinder定制类型转换，参见[mvc-ann-initbinder]，或者使用FormattingConversionService注册Formatter，请参阅Spring Field Formatting。

#### Matrix variables(矩阵变量)

RFC 3986讨论了路径段中的name-value对。 在Spring WebFlux中，我们将那些称为“矩阵变量”，但它们也可以称为URI路径参数。

 Matrix variables可出现在任何路径段中，每个变量用分号分隔，多个值用逗号分隔，例如`/cars;color=red,green;year=2012`。 也可以通过重复的变量名称来指定多个值，例如`color=red;color=green;color=blue`。

与Spring MVC不同的是，在WebFlux中，URL中Matrix variables的存在与否不会影响请求映射。 换句话说，您不需要使用URI变量来隐藏变量内容。 也就是说，如果要从控制器方法访问矩阵变量，则需要将URI变量添加到需要矩阵变量的路径段。 下面是一个例子：
```java
// GET /pets/42;q=11;r=22

@GetMapping("/pets/{petId}")
public void findPet(@PathVariable String petId, @MatrixVariable int q) {

    // petId == 42
    // q == 11
}
```


有可能所有的路径目录都包含矩阵变量，有时候你需要指出这个矩阵变量希望在哪里，例如：
```java
// GET /owners/42;q=11/pets/21;q=22

@GetMapping("/owners/{ownerId}/pets/{petId}")
public void findPet(
        @MatrixVariable(name="q", pathVar="ownerId") int q1,
        @MatrixVariable(name="q", pathVar="petId") int q2) {

    // q1 == 11
    // q2 == 22
}
```

一个矩阵变量也可以定义为可选的，指定一个默认值：
```java
// GET /pets/42

@GetMapping("/pets/{petId}")
public void findPet(@MatrixVariable(required=false, defaultValue="1") int q) {

    // q == 1
}
```

想要获取所有的矩阵变量，可以使用`MultiValueMap`:
```java
// GET /owners/42;q=11;r=12/pets/21;q=22;s=23

@GetMapping("/owners/{ownerId}/pets/{petId}")
public void findPet(
        @MatrixVariable MultiValueMap<String, String> matrixVars,
        @MatrixVariable(pathVar="petId"") MultiValueMap<String, String> petMatrixVars) {

    // matrixVars: ["q" : [11,22], "r" : 12, "s" : 23]
    // petMatrixVars: ["q" : 22, "s" : 23]
}
```

#### @RequestParam

使用@RequestParam注解将查询参数绑定到控制器中的方法参数。 以下代码片段显示了用法：
```java
@Controller
@RequestMapping("/pets")
public class EditPetForm {

    // ...

    @GetMapping
    public String setupForm(@RequestParam("petId") int petId, Model model) {
        Pet pet = this.clinic.loadPet(petId);
        model.addAttribute("pet", pet);
        return "petForm";
    }

    // ...

}
```


*与将查询参数，表单数据和上传文件合并为一个的Servlet API“请求参数”概念不同，在WebFlux中，每个需要通过ServerWebExchange单独访问。@RequestParam仅与查询参数绑定，但是可以使用数据绑定将查询参数，表单数据和文件上传数据绑定到对象上。*

使用@RequestParam注解的参数默认是必须的，但是可以设置required=false，或者用java.util.Optional包装一下类。

如果参数类型不是String，默认会进行参数转换。

如果@RequestParam注解的参数是Map<String, String> 或 MultiValueMap<String, String>就会包所有的查询参数添加进来。

注意，@RequestParam是可选的，默认情况下简单类型（BeanUtils#isSimpleProperty判断）或者其他的类型转换器都不匹配，就默认认为是@RequestParam。

#### @RequestHeader
绑定一个请求头中的值。
有一个请求头是这样：
```
Host                              localhost:8080
Accept                           text/html,application/xhtml+xml,application/xml;q=0.9
Accept-Language         fr,en-gb;q=0.7,en;q=0.3
Accept-Encoding          gzip,deflate
Accept-Charset             ISO-8859-1,utf-8;q=0.7,*;q=0.7
Keep-Alive                    300
```

下面的代码可以获取到请求头`Accept-Encoding`和`Keep-Alive`的值:
```java
@GetMapping("/demo")
public void handle(
        @RequestHeader("Accept-Encoding") String encoding,
        @RequestHeader("Keep-Alive") long keepAlive) {
    //...
}
```

如果参数不是String类型，默认也会进行类型转换。

如果@RequestHeader注解的参数是Map<String, String>, MultiValueMap<String, String>, 或 HttpHeaders 就会获取到所有的请求头信息。

*默认会把逗号分隔的字符串转换为字符串或者其他已知的可转换类型的数组或者集合。例如：一个参数使用了@RequestHeader("Accept")标注有可能是String、String[]或者List<String>类型*

#### @CookieValue
绑定cookie值。
有这样一个请求cookie:
```
JSESSIONID=415A4AC178C59DACE0B2C9CA727CDD84
```
下面的代码很简单的就可以获取到cookie值:
```java
@GetMapping("/demo")
public void handle(@CookieValue("JSESSIONID") String cookie) {
    //...
}
```


如果参数类型不是String，默认就会进行参数转换。

#### @ModelAttribute
在方法参数上使用@ModelAttribute注解来访问模型中的属性，或者如果不存在，则将其实例化。 模型属性也覆盖了查询参数和表单字段的名称与字段名称匹配的值。 这被称为数据绑定，它不必处理解析和转换单个查询参数和表单字段。 例如：
```java
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
public String processSubmit(@ModelAttribute Pet pet) { }
```

上面的Pet实例解析如下：
- 已经添加了就通过 Model Methods 从model中获取
- 通过@SessionAttributes 从HTTP session 中获取
- 从默认构造方法中
- 从调用具有匹配查询参数或表单字段的参数的“主构造函数” 参数名称通过JavaBeans @ConstructorProperties或通过字节码中的运行时保留参数名称确定。

在获得实例之后，应用数据绑定。 WebExchangeDataBinder类将查询参数和表单字段的名称与目标对象上的字段名称进行匹配。 必要时应用类型转换后填充匹配字段。 有关数据绑定（和验证）的更多信息，请参阅 Validation.。 有关自定义数据绑定的更多信息，请参阅Binder Methods.。

数据绑定可能会导致错误。 默认情况下会引发WebExchangeBindException，但要在控制器方法中检查此类错误，请立即在@ModelAttribute旁边添加BindingResult参数，如下所示：
```java
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
public String processSubmit(@ModelAttribute("pet") Pet pet, BindingResult result) {
    if (result.hasErrors()) {
        return "petForm";
    }
    // ...
}
```

通过添加javax.validation.Valid注解或Spring的@Validated注解（另请参阅Bean验证和Spring验证），可以在数据绑定后自动应用验证。 例如：
```java
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
public String processSubmit(@Valid @ModelAttribute("pet") Pet pet, BindingResult result) {
    if (result.hasErrors()) {
        return "petForm";
    }
    // ...
}
```


与Spring MVC不同，Spring WebFlux支持模型中的反应类型，例如， Mono<Account>或io.reactivex.Single <Account>。 @ModelAttribute参数可以使用或不使用反应式类型的包装来声明，并且如果需要，它将被相应地解析为实际值。 但是请注意，为了使用BindingResult参数，您必须在它之前声明@ModelAttribute参数，并且不使用反应型包装器，如前所示。 或者可以通过反应型来处理任何错误：
```java
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
public Mono<String> processSubmit(@Valid @ModelAttribute("pet") Mono<Pet> petMono) {
    return petMono
        .flatMap(pet -> {
            // ...
        })
        .onErrorResume(ex -> {
            // ...
        });
}
```

注意，@ModelAttribute是可选的，默认情况下所有的非简单类型（BeanUtils#isSimpleProperty判断）并且不能被其他类型转换，就会认为使用@ModelAttribute注解。

#### @SessionAttributes

@SessionAttributes用于在请求之间的WebSession中存储模型属性。 它是一个声明特定控制器使用的会话属性的类型级注释。 这通常会列出模型属性的名称或模型属性的类型，这些属性应该透明地存储在会话中供随后的访问请求使用。例如：
```java
@Controller
@SessionAttributes("pet")
public class EditPetForm {
    // ...
}
```



在第一个请求中，当名称为“pet”的模型属性添加到模型中时，它会自动保存在WebSession中。 它会一直存在，直到另一个控制器方法使用SessionStatus方法参数清除为止：
```java
@Controller
@SessionAttributes("pet")
public class EditPetForm {

    // ...

    @PostMapping("/pets/{id}")
    public String handle(Pet pet, BindingResult errors, SessionStatus status) {
        if (errors.hasErrors) {
            // ...
        }
            status.setComplete();
            // ...
        }
    }
}
```

#### @SessionAttribute

如果您需要访问全局（即在控制器之外）管理的预先存在的会话属性，并且可能存在也可能不存在，请在方法参数上使用@SessionAttribute注释：
```java
@GetMapping("/")
public String handle(@SessionAttribute User user) {
    // ...
}
```

对于需要添加或删除会话属性的用例，考虑将WebSession注入控制器方法。

为了将会话中的模型属性临时存储为控制器工作流的一部分，请考虑使用@SessionAttributes中所述的SessionAttributes。

#### @RequestAttribute
类似于@SessionAttribute，可以使用@RequestAttribute注释来访问先前创建的请求属性，例如， 通过WebFilter添加的：
```
@GetMapping("/")
public String handle(@RequestAttribute Client client) {
    // ...
}
```
#### Multipart

正如Multipart data中所解释的，ServerWebExchange提供对Multipart 内容的访问。 在控制器中处理文件上传表单（例如从浏览器）的最佳方式是通过数据绑定到对象：
```java
class MyForm {

    private String name;

    private MultipartFile file;

    // ...

}

@Controller
public class FileUploadController {

    @PostMapping("/form")
    public String handleFormUpload(MyForm form, BindingResult errors) {
        // ...
    }

}
```

Multipart 请求也可以在非RESTful服务场景中从非浏览器客户端提交。 例如，JSON形式伴随一个文件：
```
POST /someUrl
Content-Type: multipart/mixed

--edt7Tfrdusa7r3lNQc79vXuhIIMlatb7PQg7Vp
Content-Disposition: form-data; name="meta-data"
Content-Type: application/json; charset=UTF-8
Content-Transfer-Encoding: 8bit

{
    "name": "value"
}
--edt7Tfrdusa7r3lNQc79vXuhIIMlatb7PQg7Vp
Content-Disposition: form-data; name="file-data"; filename="file.properties"
Content-Type: text/xml
Content-Transfer-Encoding: 8bit
... File Data ...
```
你可以使用@RequestPart获取到从JSON格式反序列化（这是在HTTP Message Codecs配置的）回来的"meta-data"部分：
```java
@PostMapping("/")
public String handle(@RequestPart("meta-data") MetaData metadata,
        @RequestPart("file-data") FilePart file) {
    // ...
}
```

要以流方式顺序访问Multipart 数据，请使用带Flux <Part>的@RequestBody。 例如：
```java
@PostMapping("/")
public String handle(@RequestBody Flux<Part> parts) {
    // ...
}
```


@RequestPart可以与javax.validation.Valid或Spring的@Validated注释组合使用，这会应用标准Bean验证。 默认情况下，验证错误会导致变为400（BAD_REQUEST）响应的WebExchangeBindException。 或者，验证错误可以通过Errors或BindingResult参数在控制器内本地处理：
```java
@PostMapping("/")
public String handle(@Valid @RequestPart("meta-data") MetaData metadata,
        BindingResult result) {
    // ...
}
```


#### @RequestBody
使用@RequestBody注释让请求体通过HttpMessageReader读取并反序列化成Object。 下面是一个带有@RequestBody参数的例子：
```java
@PostMapping("/accounts")
public void handle(@RequestBody Account account) {
    // ...
}
```

与Spring MVC不同，在WebFlux中，@RequestBody方法参数支持反应类型和完全非阻塞式读取和（客户端到服务器）流：
```java
@PostMapping("/accounts")
public void handle(@RequestBody Mono<Account> account) {
    // ...
}
```

您可以使用WebFlux Config的HTTP message codecs选项来配置或自定义消息读取器。
@RequestBody可以与javax.validation.Valid或Spring的@Validated注解组合使用，这会应用标准Bean验证。 默认情况下，验证错误会导致变为400（BAD_REQUEST）响应的WebExchangeBindException。 或者，验证错误可以通过Errors或BindingResult参数在控制器内本地处理：
```java
@PostMapping("/accounts")
public void handle(@Valid @RequestBody Account account, BindingResult result) {
    // ...
}
```

#### HttpEntity
HttpEntity或多或少与使用@RequestBody相同，但包含了请求标头和主体的容器对象。 下面是一个例子：
```java
@PostMapping("/accounts")
public void handle(HttpEntity<Account> entity) {
    // ...
}
```

#### @ResponseBody
在一个方法上使用@ResponseBody注解来通过HttpMessageWriter将返回序列化到响应主体。 例如：
```java
@GetMapping("/accounts/{id}")
@ResponseBody
public Account handle() {
    // ...
}
```


@ResponseBody也支持类级别，在这种情况下，它被所有控制器方法继承。 这是@RestController的作用，它只不过是用@Controller和@ResponseBody标记的组合注解。

@ResponseBody支持反应类型，这意味着您可以返回Reactor或RxJava类型，并将它们生成的异步值呈现给响应。 有关JSON渲染的更多详细信息，请参阅[webflux-codecs-jackson-json]。

@ResponseBody方法可以与JSON序列化视图结合使用。 有关详细信息，请参阅[mvc-ann-jackson]。

您可以使用WebFlux Config的HTTP message codecs选项来配置或定制消息写入。

#### ResponseEntity
ResponseEntity或多或少与使用@ResponseBody相同，但是指定了请求标头和主体的容器对象。 下面是一个例子：
```java
@PostMapping("/something")
public ResponseEntity<String> handle() {
    // ...
    URI location = ...
    return new ResponseEntity.created(location).build();
}
```

#### Jackson JSON
Jackson 序列化视图
Spring WebFlux为Jackson 的序列化视图提供了内置的支持，它允许只呈现部分对象属性。 要将其与@ResponseBody或ResponseEntity控制器方法一起使用，请使用Jackson的@JsonView注释来激活序列化视图类：
```java
@RestController
public class UserController {

    @GetMapping("/user")
    @JsonView(User.WithoutPasswordView.class)
    public User getUser() {
        return new User("eric", "7!jd#h23");
    }
}

public class User {

    public interface WithoutPasswordView {};
    public interface WithPasswordView extends WithoutPasswordView {};

    private String username;
    private String password;

    public User() {
    }

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    @JsonView(WithoutPasswordView.class)
    public String getUsername() {
        return this.username;
    }

    @JsonView(WithPasswordView.class)
    public String getPassword() {
        return this.password;
    }
}
```

*@JsonView的值允许指定一个视图类的数组，但每个控制器方法只能使用一个注解。 如果您需要激活多个视图，请使用复合视图。*

### Model Methods
可以在@RequestMapping方法参数上使用@ModelAttribute注释来创建或访问模型中的Object并将其绑定到请求。 @ModelAttribute也可以用作控制器方法的方法级注释，其目的不是处理请求，而是在请求处理之前添加常用模型属性。

控制器可以有任意数量的@ModelAttribute方法。 所有这些方法在相同控制器中的@RequestMapping方法之前被调用。 @ModelAttribute方法也可以通过@ControllerAdvice在控制器之间共享。 有关更多详细信息，请参阅Controller Advice部分。

@ModelAttribute方法具有灵活的方法签名。 它们支持许多与@RequestMapping方法相同的参数，除了@ModelAttribute本身或任何与请求主体相关的东西。

下面是一个@ModelAttribute的示例：
```java
@ModelAttribute
public void populateModel(@RequestParam String number, Model model) {
    model.addAttribute(accountRepository.findAccount(number));
    // add more ...
}
```

仅仅添加一个属性:
```java
@ModelAttribute
public Account addAccount(@RequestParam String number) {
    return accountRepository.findAccount(number);
}
```


*如果未明确指定名称，则会根据Javadoc for Conventions中所述的对象类型选择默认名称。 您始终可以使用重载的addAttribute方法或通过@ModelAttribute (name)上的name属性来指定显式名称。*

与Spring MVC不同，Spring WebFlux明确支持模型中的反应类型，例如Mono<Account>或io.reactivex.Single <Account>。 这样的异步模型属性可以在@RequestMapping调用时被透明地解析（并且模型更新）为它们的实际值，@ModelAttribute参数在没有被包装的情况下声明，例如：
```java
@ModelAttribute
public void addAccount(@RequestParam String number) {
    Mono<Account> accountMono = accountRepository.findAccount(number);
    model.addAttribute("account", accountMono);
}

@PostMapping("/accounts")
public String handle(@ModelAttribute Account account, BindingResult errors) {
    // ...
}
```

此外，任何具有反应型包装的模型属性都会在视图呈现之前解析为其实际值（并更新模型）。

@ModelAttribute也可以用作@RequestMapping方法的方法级别注释，在这种情况下，@RequestMapping方法的返回值被解释为模型属性。 这通常不是必需的，因为它是HTML控制器中的默认行为，除非返回值是一个字符串。 @ModelAttribute也可以帮助模型属性名称：
```java
@GetMapping("/accounts/{id}")
@ModelAttribute("myAccount")
public Account handle() {
    // ...
    return account;
}
```


### Binder Methods
@Controller或@ControllerAdvice类中的@InitBinder方法可用于自定义基于字符串的请求值（例如请求参数，路径变量，请求头，cookie等）的方法参数的类型转换。 在将请求参数绑定到@ModelAttribute参数上时，也有类型转换。

@InitBinder方法可以注册特定控制器的java.bean.PropertyEditor或Spring Converter和Formatter组件。 另外，WebFlux Java配置可用于在全局共享的FormattingConversionService中注册Converter和Formatter类型。

@InitBinder方法支持许多与@RequestMapping方法相同的参数，除了@ModelAttribute参数。 通常注册时，声明WebDataBinder参数，返回void。 下面是一个例子：
```java
@Controller
public class FormController {

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        dateFormat.setLenient(false);
        binder.registerCustomEditor(Date.class, new CustomDateEditor(dateFormat, false));
    }

    // ...
}
```

或者，当通过共享的FormattingConversionService使用基于Formatter的设置时，您可以使用相同的方法注册控制器特定的Formatter：
```java
@Controller
public class FormController {

    @InitBinder
    protected void initBinder(WebDataBinder binder) {
        binder.addCustomFormatter(new DateFormatter("yyyy-MM-dd"));
    }

    // ...
}
```

### Controller Advice
通常，@ExceptionHandler，@InitBinder和@ModelAttribute方法适用于声明它们的@Controller类（或类层次结构）中。如果希望这些方法跨控制器在全局范围内应用，则可以在标有@ControllerAdvice或@RestControllerAdvice的类中声明。

@ControllerAdvice使用了@Component，这意味着这些类可以通过组件扫描注册为Spring bean。 @RestControllerAdvice也是一个用@ControllerAdvice和@ResponseBody标记的元注释，它意味着@ExceptionHandler方法通过消息转换（就像视图解析/模板渲染）呈现给响应主体。

启动时，基础设施类检测在@ControllerAdvice的Spring bean中声明@RequestMapping和@ExceptionHandler的方法，然后在运行时应用它们。来自@ControllerAdvice的全局@ExceptionHandler方法在来自@Controller的之后执行。相比之下，全局@ModelAttribute和@InitBinder方法在本地之前执行。

默认情况下，@ControllerAdvice方法适用于每个请求，即所有控制器，但您可以通过注释上的属性限定需要执行的控制器：
```java
// Target all Controllers annotated with @RestController
@ControllerAdvice(annotations = RestController.class)
public class ExampleAdvice1 {}

// Target all Controllers within specific packages
@ControllerAdvice("org.example.controllers")
public class ExampleAdvice2 {}

// Target all Controllers assignable to specific classes
@ControllerAdvice(assignableTypes = {ControllerInterface.class, AbstractController.class})
public class ExampleAdvice3 {}
```

请记住，上述选择器在运行时执行，如果广泛使用，可能会对性能产生负面影响。 有关更多详细信息，请参阅@ControllerAdvice Javadoc。


## URI Links
本节介绍Spring框架中可用于准备URI的各种选项。

### UriComponents
UriComponents与java.net.URI差不多。 但是它带有一个专用的UriComponentsBuilder并支持URI模板变量：
```java
String uriTemplate = "http://example.com/hotels/{hotel}";

UriComponents uriComponents = UriComponentsBuilder.fromUriString(uriTemplate)  ①
        .queryParam("q", "{q}")  ②
        .build(); ③

URI uri = uriComponents.expand("Westin", "123").encode().toUri();  ④
```

① 一个创建 URI的静态工厂方法
②添加或者替换参数
③构建
④扩展变量、编码并且获取URI

上面的写法可以用链式或者快捷方式：
```java
String uriTemplate = "http://example.com/hotels/{hotel}";

URI uri = UriComponentsBuilder.fromUriString(uriTemplate)
        .queryParam("q", "{q}")
        .buildAndExpand("Westin", "123")
        .encode()
        .toUri();
```

### UriBuilder
UriComponentsBuilder是UriBuilder的一个实现。 UriBuilderFactory和UriBuilder一起提供了可从URI模板构建URI的可插入机制，以及共享公共属性（如基本URI，编码策略等）的方法。

RestTemplate和WebClient都可以使用UriBuilderFactory进行配置，以便自定义URI模板创建URI的方式。 默认实现在内部依赖于UriComponentsBuilder，并提供了配置通用基本URI，替代编码模式策略等的选项。

配置RestTemplate的一个例子：
```java
String baseUrl = "http://example.com";
DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory(baseUrl);

RestTemplate restTemplate = new RestTemplate();
restTemplate.setUriTemplateHandler(factory);
```

配置WebClient的一个例子：
```java
String baseUrl = "http://example.com";
DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory(baseUrl);

// Configure the UriBuilderFactory..
WebClient client = WebClient.builder().uriBuilderFactory(factory).build();

// Or use shortcut on builder..
WebClient client = WebClient.builder().baseUrl(baseUrl).build();

// Or use create shortcut...
WebClient client = WebClient.create(baseUrl);
```

您也可以直接使用DefaultUriBuilderFactory，就像您使用UriComponentsBuilder一样。 主要区别在于，DefaultUriBuilderFactory是有状态的，可以重新用于准备许多URL，共享例如基本URL等通用配置，而UriComponentsBuilder是无状态的并且是单URI。

使用DefaultUriBuilderFactory的一个例子：
```java
String baseUrl = "http://example.com";
DefaultUriBuilderFactory uriBuilderFactory = new DefaultUriBuilderFactory(baseUrl);

URI uri = uriBuilderFactory.uriString("/hotels/{hotel}")
        .queryParam("q", "{q}")
        .build("Westin", "123"); // encoding strategy applied..
```

### URI Encoding
在UriComponents中编码URI的默认方式如下所示：

- URI变量被扩展。
- 每个URI组件（路径，查询等）都是单独编码的。

编码规则如下：在URI组件中，按照RFC 3986中的定义，对所有非法字符（包括非US-ASCII字符）以及URI组件中非法的所有其他字符应用编码。

*UriComponents中的编码与java.net.URI的多参数构造函数一样，就是类级别Javadoc的“Escaped octets，quotation，encoding，and decoding”部分中所述。*

上述默认编码策略不会对所有具有保留含义的字符进行编码，而只会对给定URI组件中的非法字符进行编码。 如果这不符合您的期望，您可以使用下面介绍的替代策略。

当使用DefaultUriBuilderFactory - 嵌入WebClient，RestTemplate或直接使用时，可以切换到另一种编码策略，如下所示：
```java
String baseUrl = "http://example.com";
DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory(baseUrl)
factory.setEncodingMode(EncodingMode.VALUES_ONLY);

// ...
```

这种编码策略在扩展之前对每个URI变量值应用UriUtils.encode（String，Charset），有效编码所有非US-ASCII字符以及在URI中具有保留含义的所有字符，这确保扩展的URI变量 对URI的结构或含义没有任何影响。


## Functional Endpoints
Spring WebFlux包含一个轻量级的函数式编程模型，其中函数用于路由和处理请求，并且契约是为不可变性而设计的。 它是基于注释的编程模型的一种替代方案，但是同样可以在Reactive Spring Web基础上运行.

### HandlerFunction
传入的HTTP请求由HandlerFunction处理，它本质上是一个接受ServerRequest并返回Mono <ServerResponse>的函数。 如果您熟悉基于注释的编程模型，则HandlerFunction相当于@RequestMapping方法。

ServerRequest和ServerResponse是不可变的接口，它提供了JDK-8友好的访问底层HTTP消息的能力，以及反应式非阻塞背压。 该请求将主体暴露为Reactor Flux或Mono类型; 响应接受任何Reactive Streams Publisher作为正文。 Reactive Libraries解释了这一点的合理性。

ServerRequest允许访问各种HTTP请求元素：方法，URI，查询参数和头部信息（通过一个单独的ServerRequest.Headers接口，通过body方法提供对主体的访问，例如，如何提取请求主体 成Mono<String>：
```java
Mono<String> string = request.bodyToMono(String.class);
```

这里是如何响应体转换到Flux中，其中Person是一个可以从报文内容反序列化的类（即，使用Jackson反序列化JSON，使用JAXB反序列化XML）:
```java
Flux<Person> people = request.bodyToFlux(Person.class);
```

上面使用的bodyToMono和bodyToFlux实际上是使用通用ServerRequest.body（BodyExtractor）方法的便捷方法。 BodyExtractor是一个功能性策略接口，可让您编写自己的提取逻辑，但可在BodyExtractor工具类中找到常见的BodyExtractor实例。 所以，上面的例子也可以写成如下：
```java
Mono<String> string = request.body(BodyExtractors.toMono(String.class);
Flux<Person> people = request.body(BodyExtractors.toFlux(Person.class);
```

同样，ServerResponse提供对HTTP响应的访问。 由于它是不可变的，因此您可以使用构建器创建一个ServerResponse。 构建器允许您设置响应状态，添加响应头并提供正文。 例如，这是如何创建200 OK状态，JSON内容类型和正文的响应：
```java
Mono<Person> person = ...
ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).body(person);
```

这里是如何建立一个201 CREATED状态，一个“Location”头和空白主体的响应：
```java
URI location = ...
ServerResponse.created(location).build();
```

把它们放在一起可以让我们创建一个HandlerFunction。 例如，下面是一个简单的“Hello World”处理程序lambda的示例，它返回一个具有200状态和基于String的主体的响应：
```java
HandlerFunction<ServerResponse> helloWorld =
  request -> ServerResponse.ok().body(fromObject("Hello World"));
```

正如我们上面所做的那样，编写处理函数的lambda函数是很方便的，但是在处理多个函数时可能缺乏可读性并且变得不易维护。 因此，建议将相关处理函数分组到处理程序或控制器类中。 例如，下面是一个反应式Person存储库的类：
```java
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.web.reactive.function.BodyInserters.fromObject;

public class PersonHandler {

    private final PersonRepository repository;

    public PersonHandler(PersonRepository repository) {
        this.repository = repository;
    }

    public Mono<ServerResponse> listPeople(ServerRequest request) { ①
        Flux<Person> people = repository.allPeople();
        return ServerResponse.ok().contentType(APPLICATION_JSON).body(people, Person.class);
    }

    public Mono<ServerResponse> createPerson(ServerRequest request) { ②
        Mono<Person> person = request.bodyToMono(Person.class);
        return ServerResponse.ok().build(repository.savePerson(person));
    }

    public Mono<ServerResponse> getPerson(ServerRequest request) { ③
        int personId = Integer.valueOf(request.pathVariable("id"));
        Mono<ServerResponse> notFound = ServerResponse.notFound().build();
        Mono<Person> personMono = repository.getPerson(personId);
        return personMono
                .flatMap(person -> ServerResponse.ok().contentType(APPLICATION_JSON).body(fromObject(person)))
                .switchIfEmpty(notFound);
    }
}
```

① listPeople 把存储的所有Person用JSON格式返回。
②createPerson 把请求体中的Person存储起来。注意，PersonRepository.savePerson(Person)返回Mono<void>:这是一个空的Mono并在从请求体中读取完数据保存后发出完成信号。所以我们收到完成信号（即保存完成后）后使用build(Publisher<Void>)方法去发送一个响应。
③ getPerson 返回使用路径变量id标识出的单个Person。如果我们从存储中成功获取就创建一个JSON响应，如果没有找到就使用switchIfEmpty(Mono<T>)返回一个404未发现响应。

### RouterFunction
传入的请求通过一个RouterFunction被路由到处理函数，这是一个接受ServerRequest的函数，并返回一个Mono <HandlerFunction>。 如果请求匹配特定的路由，则返回一个处理函数，否则返回一个空的Mono。 RouterFunction与基于注解的编程模型中的@RequestMapping注释具有相似的用途。

通常，您不要自己编写路由器功能，而是使用RouterFunctions.route（RequestPredicate，HandlerFunction）使用请求断言和处理函数创建一个路由器函数。 如果断言适用，则将请求路由到给定的处理函数; 否则不执行路由，返回404 Not Found响应。 虽然您可以编写自己的RequestPredicate，但您不必：RequestPredicates工具类提供常用的断言，例如基于路径，HTTP方法，内容类型等的匹配。使用路由，我们可以路由到我们的“Hello World” 处理函数：
```java
RouterFunction<ServerResponse> helloWorldRoute =
    RouterFunctions.route(RequestPredicates.path("/hello-world"),
    request -> Response.ok().body(fromObject("Hello World")));
```

两个路由器功能可以组成一个新的路由器功能，该路由器可以路由到任一处理器：如果第一个路由的断言不匹配，则第二个路由器的断言将被执行判断。 组合路由器功能按顺序进行匹配，因此将特定功能放在通用功能之前。 您可以通过调用RouterFunction.and（RouterFunction）或通过调用RouterFunction.andRoute（RequestPredicate，HandlerFunction）来组合两个路由器功能，这是RouterFunction.and（）与RouterFunctions.route（）的简便用法。

鉴于我们上面展示的PersonHandler，我们现在可以定义路由到相应处理器的路由器功能。 我们使用method-references 来关联处理函器：
```java
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.web.reactive.function.server.RequestPredicates.*;

PersonRepository repository = ...
PersonHandler handler = new PersonHandler(repository);

RouterFunction<ServerResponse> personRoute =
    route(GET("/person/{id}").and(accept(APPLICATION_JSON)), handler::getPerson)
        .andRoute(GET("/person").and(accept(APPLICATION_JSON)), handler::listPeople)
        .andRoute(POST("/person").and(contentType(APPLICATION_JSON)), handler::createPerson);
```

除了路由器功能外，您还可以通过调用RequestPredicate.and（RequestPredicate）或RequestPredicate.or（RequestPredicate）来组合请求断言。 这些按预期工作：and表示两个断言都要匹配; or表示其中一个匹配就可以。 RequestPredicates中的大多数断言都是组合。 例如，RequestPredicates.GET（String）是RequestPredicates.method（HttpMethod）和RequestPredicates.path（String）的组合。

### Running a server
你如何在HTTP服务器上运行路由器功能？ 一个简单的选择是使用以下方法之一将路由器功能转换为HttpHandler：

- RouterFunctions.toHttpHandler（RouterFunction）

- RouterFunctions.toHttpHandler（RouterFunction，HandlerStrategies）

然后，通过遵循HttpHandler获取特定服务器的用法，可以将返回的HttpHandler与多个服务器适配器一起使用。

更高级的做法是通过WebFlux配置基于DispatcherHandler的服务器，该配置使用Spring配置声明需要处理请求的组件。 WebFlux Java配置声明以下基础结构组件以支持功能端点：
- RouterFunctionMapping 
  在Spring配置中获取一个或多个RouterFunction <？> bean，通过RouterFunction.andOther组合它们，并将请求路由到最终组成的RouterFunction。
- HandlerFunctionAdapter 
   一个简单的适配器，它允许DispatcherHandler调用映射到请求的HandlerFunction。
- ServerResponseResultHandler 
  通过调用ServerResponse的writeTo方法来处理调用HandlerFunction的结果。

上述组件允许功能端点符合DispatcherHandler请求处理生命周期，并且还可能与注释的控制器并行运行（如果声明的话）。 这也是功能端点启用Spring Boot WebFlux的启动器。

下面是用java代码配置WebFlux的一个示例（查看DispatcherHandler怎么启动）：
```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    @Bean
    public RouterFunction<?> routerFunctionA() {
        // ...
    }

    @Bean
    public RouterFunction<?> routerFunctionB() {
        // ...
    }

    // ...

    @Override
    public void configureHttpMessageCodecs(ServerCodecConfigurer configurer) {
        // configure message conversion...
    }

    @Override
    default void addCorsMappings(CorsRegistry registry) {
        // configure CORS...
    }

    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        // configure view resolution for HTML rendering...
    }
}
```

### HandlerFilterFunction

由路由器功能映射的路由可以通过调用RouterFunction.filter（HandlerFilterFunction）进行过滤，其中HandlerFilterFunction本质上是一个接受ServerRequest和HandlerFunction的函数，并返回ServerResponse。 HandlerFunction参数表示链中的下一个元素：这通常是路由到的HandlerFunction，但如果应用多个过滤器，则也可以是另一个FilterFunction。 使用注解，可以使用@ControllerAdvice和/或ServletFilter实现类似的功能。 让我们在我们的路由中添加一个简单的安全过滤器，假设我们有一个可以确定是否允许特定路径的SecurityManager：
```java
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

SecurityManager securityManager = ...
RouterFunction<ServerResponse> route = ...

RouterFunction<ServerResponse> filteredRoute =
    route.filter((request, next) -> {
        if (securityManager.allowAccessTo(request.path())) {
            return next.handle(request);
        }
        else {
            return ServerResponse.status(UNAUTHORIZED).build();
        }
  });
```

你可以在这个例子中看到调用next.handle（ServerRequest）是可选的：我们只允许在允许访问时执行处理函数。

## CORS
通过专用的CorsWebFilter提供对功能端点的CORS支持。

###介绍
出于安全原因，浏览器禁止对当前域以外的资源进行AJAX调用。 例如，您可以在一个标签中使用银行帐户，在另一个标签中使用evil.com。 来自evil.com的脚本不应该使用您的凭证向您的银行API发送AJAX请求，例如 从您的帐户中提取钱！

跨源资源共享（CORS）是大多数浏览器实现的W3C规范，允许您指定哪种类型的跨域请求被授权，而不是使用基于IFRAME或JSONP的不太安全和功能较弱的解决方法。

### Processing
CORS规范区分预检，简单和实际请求。 要了解CORS如何工作，可以阅读[本文](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)以及其他许多内容，或参阅规范以获取更多详细信息。

Spring WebFlux HandlerMapping提供了对CORS的内置支持。 在成功将请求映射到处理程序后，HandlerMapping会检查给定请求和处理程序的CORS配置并采取进一步的操作。 预检请求被直接处理，而简单和实际的CORS请求被拦截，验证并且需要设置CORS响应头。

为了实现跨域请求（即Origin头部存在并且与请求的主机不同），你需要有一些明确声明的CORS配置。 如果找不到匹配的CORS配置，则会拒绝预检请求。 没有将CORS头添加到简单和实际的CORS请求的响应，因此浏览器拒绝它们。

每个HandlerMapping可以单独配置基于URL模式的CorsConfiguration映射。 在大多数情况下，应用程序将使用WebFlux Java配置来声明这种映射，这会把单个全局映射传递给所有HadlerMappping。

HandlerMapping级别的全局CORS配置可以与更细粒度的处理器级CORS配置相结合。 例如，带注释的控制器可以使用类或方法级的@CrossOrigin注释（其他处理器可以实现CorsConfigurationSource）。

全局和本地配置相结合的规则通常是相加的 - 例如， 所有的全局和所有本地的源。 对于那些只能接受单个值的属性，如allowCredentials和maxAge，本地将覆盖全局值。 有关更多详细信息，请参阅CorsConfiguration＃combine（CorsConfiguration）。

*从源码中学习或者使用更高级的自定义，请查看：*
- CorsConfiguration
- CorsProcessor, DefaultCorsProcessor
- AbstractHandlerMapping

### @CrossOrigin
@CrossOrigin 注解可以在控制器方法上开启跨域：
```java
@RestController
@RequestMapping("/account")
public class AccountController {

    @CrossOrigin
    @GetMapping("/{id}")
    public Mono<Account> retrieve(@PathVariable Long id) {
        // ...
    }

    @DeleteMapping("/{id}")
    public Mono<Void> remove(@PathVariable Long id) {
        // ...
    }
}
```

默认情况下@CrossOrigin允许:
- 所有域
- 所有请求头
- 所有这个请求映射的HTTP方法
- allowedCredentials
allowedCredentials默认情况下未启用，因为它建立了一个信任级别，用于公开敏感的用户特定信息，如Cookie和CSRF令牌，并且只能在适当的情况下使用。
- maxAge
  默认30分钟

@CrossOrigin 也可以在类级别使用，并且对所有的方法都生效:
```java
@CrossOrigin(origins = "http://domain2.com", maxAge = 3600)
@RestController
@RequestMapping("/account")
public class AccountController {

    @GetMapping("/{id}")
    public Mono<Account> retrieve(@PathVariable Long id) {
        // ...
    }

    @DeleteMapping("/{id}")
    public Mono<Void> remove(@PathVariable Long id) {
        // ...
    }
}
```

@CrossOrigin 也可以同时在类级别和方法上使用:
```java
@CrossOrigin(maxAge = 3600)
@RestController
@RequestMapping("/account")
public class AccountController {

    @CrossOrigin("http://domain2.com")
    @GetMapping("/{id}")
    public Mono<Account> retrieve(@PathVariable Long id) {
        // ...
    }

    @DeleteMapping("/{id}")
    public Mono<Void> remove(@PathVariable Long id) {
        // ...
    }
}
```

### Global Config
除了细粒度的控制器方法级配置之外，您还可能需要定义一些全局CORS配置。 您可以在任何HandlerMapping上分别设置基于URL的CorsConfiguration映射。 然而，大多数应用程序将使用WebFlux Java配置来实现这一点。

默认情况下全局配置开启下面的配置：
- 所有域
- 所有请求头
- GET、HEAD和POST方法
- allowedCredentials
allowedCredentials默认情况下未启用，因为它建立了一个信任级别，用于公开敏感的用户特定信息，如Cookie和CSRF令牌，并且只能在适当的情况下使用。
- maxAge
  默认30分钟

要在WebFlux Java配置中启用CORS，请使用CorsRegistry回调：
```java
@Configuration
@EnableWebFlux
public class WebConfig implements WebFluxConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry.addMapping("/api/**")
            .allowedOrigins("http://domain2.com")
            .allowedMethods("PUT", "DELETE")
            .allowedHeaders("header1", "header2", "header3")
            .exposedHeaders("header1", "header2")
            .allowCredentials(true).maxAge(3600);

        // Add more mappings...
    }
}
```

### CORS WebFilter
您可以通过内置的CorsWebFilter来应用CORS支持，这非常适合功能端点。

要配置过滤器，您可以声明一个CorsWebFilter bean并将CorsConfigurationSource传递给其构造函数：
```java
@Bean
CorsWebFilter corsFilter() {

    CorsConfiguration config = new CorsConfiguration();

    // Possibly...
    // config.applyPermitDefaultValues()

    config.setAllowCredentials(true);
    config.addAllowedOrigin("http://domain1.com");
    config.addAllowedHeader("");
    config.addAllowedMethod("");

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);

    return new CorsWebFilter(source);
}
```

## Web Security
项目为保护Web应用程序免受恶意攻击提供支持。 查看Spring Security参考文档，其中包括：
- [Spring Security](https://projects.spring.io/spring-security/)
- [WebFlux Security](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#jc-webflux)
- [WebFlux Testing Support](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#test-webflux)
- [CSRF Protection](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#csrf)
- [Security Response Headers](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#headers)

## 视图技术
待更新。。。
这里是视图技术的一些说明，包括Thymeleaf、freeMarker、HTML、JSON等。
https://docs.spring.io/spring/docs/current/spring-framework-reference/web-reactive.html#webflux-view

## WebFlux配置
待更新。。。
WebFlux的相关配置

### HTTP/2
需要Servlet 4容器来支持HTTP / 2，并且Spring Framework 5与Servlet API 4兼容。从编程模型的角度来看，没有什么具体的应用程序需要做。 但是有一些与服务器配置相关的考虑事项 有关更多详细信息，请查看HTTP / 2 wiki页面。

目前Spring WebFlux不支持Netty的HTTP / 2。 也不支持以编程方式将资源推送到客户端。

