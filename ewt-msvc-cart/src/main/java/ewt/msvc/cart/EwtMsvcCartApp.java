package ewt.msvc.cart;


import ewt.msvc.config.configuration.ApplicationProperties;
import ewt.msvc.config.configuration.CRLFLogConverter;
import jakarta.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.EnableScheduling;
import tech.jhipster.config.DefaultProfileUtil;
import tech.jhipster.config.JHipsterConstants;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Collection;
import java.util.Optional;

@SpringBootApplication
@EnableConfigurationProperties({LiquibaseProperties.class, ApplicationProperties.class})
@ComponentScan(basePackages = "ewt.msvc.*")
@EnableScheduling
public class EwtMsvcCartApp {

    private static final Logger log = LoggerFactory.getLogger(EwtMsvcCartApp.class);

    private final Environment env;

    public EwtMsvcCartApp(Environment env) {
        this.env = env;
    }

    @PostConstruct
    public void initApplication() {
        Collection<String> activeProfiles = Arrays.asList(env.getActiveProfiles());
        if (
                activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT) &&
                        activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_PRODUCTION)
        ) {
            log.error(
                    "You have misconfigured your application! It should not run " + "with both the 'dev' and 'prod' profiles at the same time."
            );
        }
        if (
                activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT) &&
                        activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_CLOUD)
        ) {
            log.error(
                    "You have misconfigured your application! It should not " + "run with both the 'dev' and 'cloud' profiles at the same time."
            );
        }
    }

    /**
     * Main method, used to run the application.
     *
     * @param args the command line arguments.
     */
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(EwtMsvcCartApp.class);
        DefaultProfileUtil.addDefaultProfile(app);
        Environment env = app.run(args).getEnvironment();
        logApplicationStartup(env);
    }

    private static void logApplicationStartup(Environment env) {
        String protocol = Optional.ofNullable(env.getProperty("server.ssl.key-store")).map(key -> "https").orElse("http");
        String serverPort = env.getProperty("server.port");
        String contextPath = Optional
                .ofNullable(env.getProperty("server.servlet.context-path"))
                .filter(StringUtils::isNotBlank)
                .orElse("/");
        String hostAddress = "localhost";
        try {
            hostAddress = InetAddress.getLocalHost().getHostAddress();
        } catch (UnknownHostException e) {
            log.warn("The host name could not be determined, using `localhost` as fallback");
        }
        log.info(
                CRLFLogConverter.CRLF_SAFE_MARKER,
                """

                        ----------------------------------------------------------
                        \tApplication '{}' is running! Access URLs:
                        \tLocal: \t\t{}://localhost:{}{}
                        \tExternal: \t{}://{}:{}{}
                        \tProfile(s): \t{}
                        ----------------------------------------------------------""",
                env.getProperty("spring.application.name"),
                protocol,
                serverPort,
                contextPath,
                protocol,
                hostAddress,
                serverPort,
                contextPath,
                env.getActiveProfiles().length == 0 ? env.getDefaultProfiles() : env.getActiveProfiles()
        );

        String configServerStatus = env.getProperty("configserver.status");
        if (configServerStatus == null) {
            configServerStatus = "Not found or not setup for this application";
        }
        log.info(
                CRLFLogConverter.CRLF_SAFE_MARKER,
                "\n----------------------------------------------------------\n\t" +
                        "Config Server: \t{}\n----------------------------------------------------------",
                configServerStatus
        );
    }
}
