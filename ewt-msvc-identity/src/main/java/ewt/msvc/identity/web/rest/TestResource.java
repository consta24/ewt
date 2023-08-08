//package ewt.msvc.identity.web.rest;
//
//
//import ewt.msvc.config.security.SecurityUtils;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//import reactor.core.publisher.Mono;
//
//@RestController
//@RequestMapping("/api")
//public class TestResource {
//
//    @GetMapping("/login")
//    public Mono<ResponseEntity<String>> getCurrentUserLogin() {
//        return SecurityUtils.getCurrentUserLogin()
//            .map(login -> ResponseEntity.ok().body(login));
//    }
//
//    @GetMapping("/authorities")
//    public Mono<? extends ResponseEntity<? extends java.util.Collection<? extends org.springframework.security.core.GrantedAuthority>>> getAuthorities() {
//        return SecurityUtils.getAuthorities()
//            .map(authorities -> ResponseEntity.ok().body(authorities));
//    }
//
//
//    @GetMapping("/authenticated")
//    public Mono<ResponseEntity<Boolean>> isAuthenticated() {
//        return SecurityUtils.isAuthenticated()
//            .map(isAuthenticated -> ResponseEntity.ok().body(isAuthenticated));
//    }
//
//    @GetMapping("/jwt")
//    public Mono<ResponseEntity<String>> getJwt() {
//        return SecurityUtils.getCurrentUserJWT()
//            .doOnEach(signal -> {
//                if (signal.isOnNext()) System.out.println("JWT: " + signal.get());
//                if (signal.isOnComplete()) System.out.println("JWT: Completion signal received");
//                if (signal.isOnError()) System.out.println("JWT: Error signal received: " + signal.getThrowable());
//            })
//            .map(jwt -> ResponseEntity.ok().body(jwt))
//            .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred"));
//    }
//}
