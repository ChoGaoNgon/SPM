package htmp.codien.quanlycodien.infrastructure.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class DotenvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment environment = applicationContext.getEnvironment();

        Path[] envPaths = {
                Paths.get(".env"),
                Paths.get("backend/.env"),
                Paths.get("../.env")
        };

        for (Path envPath : envPaths) {
            if (Files.exists(envPath)) {
                try {
                    log.info("Loading .env file from: {}", envPath.toAbsolutePath());
                    loadEnvFile(envPath, environment);
                    return;
                } catch (IOException e) {
                    log.warn("Failed to load .env file from: {}", envPath, e);
                }
            }
        }

        log.warn("No .env file found. Trying to use system environment variables.");
    }

    private void loadEnvFile(Path envPath, ConfigurableEnvironment environment) throws IOException {
        java.util.Map<String, Object> envMap = new java.util.HashMap<>();

        try (Stream<String> lines = Files.lines(envPath)) {
            lines.filter(line -> !line.trim().isEmpty() && !line.trim().startsWith("#"))
                    .forEach(line -> {
                        int equalIndex = line.indexOf('=');
                        if (equalIndex > 0) {
                            String key = line.substring(0, equalIndex).trim();
                            String value = line.substring(equalIndex + 1).trim();
                            envMap.put(key, value);
                            log.debug("Loaded env variable: {} = {}", key, value.replaceAll(".", "*"));
                        }
                    });
        }

        MapPropertySource propertySource = new MapPropertySource("dotenv", envMap);
        environment.getPropertySources().addFirst(propertySource);

        log.info("Successfully loaded {} environment variables from .env file", envMap.size());
    }
}
