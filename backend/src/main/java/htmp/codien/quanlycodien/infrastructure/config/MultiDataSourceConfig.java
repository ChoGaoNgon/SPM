package htmp.codien.quanlycodien.infrastructure.config;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

import com.zaxxer.hikari.HikariDataSource;

@Configuration
public class MultiDataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.primary")
    public DataSourceProperties primaryDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "primaryDataSource")
    @Primary
    @ConfigurationProperties("spring.datasource.primary.hikari")
    public HikariDataSource primaryDataSource(
            @Qualifier("primaryDataSourceProperties") DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    @Bean
    @Primary
    public JdbcTemplate jdbcTemplate(@Qualifier("primaryDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    @Bean
    @Primary
    public NamedParameterJdbcTemplate namedParameterJdbcTemplate(
            @Qualifier("primaryDataSource") DataSource dataSource) {
        return new NamedParameterJdbcTemplate(dataSource);
    }

    @Bean
    @ConditionalOnProperty(prefix = "app.datasource.secondary", name = "enabled", havingValue = "true")
    @ConfigurationProperties("spring.datasource.secondary")
    public DataSourceProperties secondaryDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "secondaryDataSource")
    @ConditionalOnProperty(prefix = "app.datasource.secondary", name = "enabled", havingValue = "true")
    @ConfigurationProperties("spring.datasource.secondary.hikari")
    public HikariDataSource secondaryDataSource(
            @Qualifier("secondaryDataSourceProperties") DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    @Bean(name = "secondaryJdbcTemplate")
    @ConditionalOnProperty(prefix = "app.datasource.secondary", name = "enabled", havingValue = "true")
    public JdbcTemplate secondaryJdbcTemplate(@Qualifier("secondaryDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    @Bean(name = "secondaryNamedParameterJdbcTemplate")
    @ConditionalOnProperty(prefix = "app.datasource.secondary", name = "enabled", havingValue = "true")
    public NamedParameterJdbcTemplate secondaryNamedParameterJdbcTemplate(
            @Qualifier("secondaryDataSource") DataSource dataSource) {
        return new NamedParameterJdbcTemplate(dataSource);
    }

    @Bean
    @ConditionalOnProperty(prefix = "app.datasource.tertiary", name = "enabled", havingValue = "true")
    @ConfigurationProperties("spring.datasource.tertiary")
    public DataSourceProperties tertiaryDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "tertiaryDataSource")
    @ConditionalOnProperty(prefix = "app.datasource.tertiary", name = "enabled", havingValue = "true")
    @ConfigurationProperties("spring.datasource.tertiary.hikari")
    public HikariDataSource tertiaryDataSource(
            @Qualifier("tertiaryDataSourceProperties") DataSourceProperties properties) {
        return properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    @Bean(name = "tertiaryJdbcTemplate")
    @ConditionalOnProperty(prefix = "app.datasource.tertiary", name = "enabled", havingValue = "true")
    public JdbcTemplate tertiaryJdbcTemplate(@Qualifier("tertiaryDataSource") DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    @Bean(name = "tertiaryNamedParameterJdbcTemplate")
    @ConditionalOnProperty(prefix = "app.datasource.tertiary", name = "enabled", havingValue = "true")
    public NamedParameterJdbcTemplate tertiaryNamedParameterJdbcTemplate(
            @Qualifier("tertiaryDataSource") DataSource dataSource) {
        return new NamedParameterJdbcTemplate(dataSource);
    }
}