//package ewt.msvc.product.web.rest;
//
//
//import ewt.msvc.config.security.SecurityUtils;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.reactive.function.client.WebClient;
//import reactor.core.publisher.Mono;
//
//@RestController
//@RequestMapping("/api")
//public class TestResource {
//
//    private final WebClient webClient;
//
//    @Autowired
//    public TestResource(WebClient webClient) {
//        this.webClient = webClient;
//    }
//
//    @GetMapping("/login")
//    public Mono<ResponseEntity<String>> getCurrentUserLogin() {
//        return SecurityUtils.getCurrentUserLogin()
//            .map(login -> ResponseEntity.ok().body(login));
//    }
//
//    @GetMapping("/identity-feign")
//    public Mono<ResponseEntity<String>> getFeign() {
//        return webClient.get()
//            .uri("/ewt-msvc-identity/api/login")
//            .retrieve()
//            .bodyToMono(String.class)
//            .map(body -> ResponseEntity.ok().body(body))
//            .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage())));
//    }
//}
