# 1  Spring WebFlux
## 1.1  简介
### 1.1.1  为什么作为新的web 框架？
### 1.1.2  反应式：是什么？为什么？
### 1.1.3  反应式API
### 1.1.4  编程模型
### 1.1.5  选择一个web框架
### 1.1.6  选择一个服务器
### 1.1.7  性能与可伸缩
## 1.2  Reactive Spring web
### 1.2.1  HttpHandler
### 1.2.2  WebHandler API
#### 1.2.2.1  特殊的bean类型
#### 1.2.2.2  表单数据
#### 1.2.2.3  文件上传
### 1.2.3  HTTP消息编解码
#### 1.2.3.1  Jackson
## 1.3  DispatcherHandler
### 1.3.1  特殊bean类型
### 1.3.2  WebFlux配置
### 1.3.3  Processing
### 1.3.4  Result Handling
### 1.3.5   View Resolution
#### 1.3.5.1  Handling
#### 1.3.5.2  Redirecting
#### 1.3.5.3  内容协商
## 1.4  注解Controller
### 1.4.1  @Controller
### 1.4.2  Request Mapping
#### 1.4.2.1  URI匹配规则
#### 1.4.2.2  模式比较
#### 1.4.2.3  Consumable Media Types
#### 1.4.2.4   Producible Media Types
#### 1.4.2.5  Parameters and Headers
#### 1.4.2.6  HTTP HEAD, OPTIONS
#### 1.4.2.7  Custom Annotations
### 1.4.3  Handler methods
#### 1.4.3.1  Method arguments
#### 1.4.3.2  返回值
#### 1.4.3.3  类型转换
#### 1.4.3.4  Matrix variables(矩阵变量)
#### 1.4.3.5  @RequestParam
#### 1.4.3.6  @RequestHeader
#### 1.4.3.7  @CookieValue
#### 1.4.3.8  @ModelAttribute
#### 1.4.3.9  @SessionAttributes
#### 1.4.3.10  @SessionAttribute
#### 1.4.3.11  @RequestAttribute
#### 1.4.3.12  Multipart
#### 1.4.3.13  @RequestBody
#### 1.4.3.14  HttpEntity
#### 1.4.3.15  @ResponseBody
#### 1.4.3.16  ResponseEntity
#### 1.4.3.17  Jackson JSON
### 1.4.4  Model Methods
### 1.4.5  Binder Methods
### 1.4.6  Controller Advice
## 1.5  URI Links
### 1.5.1  UriComponents
### 1.5.2  UriBuilder
### 1.5.3  URI Encoding
## 1.6  Functional Endpoints
### 1.6.1  HandlerFunction
### 1.6.2  RouterFunction
### 1.6.3  Running a server
### 1.6.4  HandlerFilterFunction
## 1.7  CORS
### 1.7.1 介绍
### 1.7.2  Processing
### 1.7.3  @CrossOrigin
### 1.7.4  Global Config
### 1.7.5  CORS WebFilter
## 1.8  Web Security
## 1.9  视图技术
## 1.10  WebFlux配置
### 1.10.1  HTTP/2
