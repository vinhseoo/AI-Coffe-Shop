package com.coffeeshop.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DatabaseMigrationConfig {

    @Bean(initMethod = "migrate")
    public Flyway flyway(DataSource dataSource) {
        return Flyway.configure()
                .dataSource(dataSource)
                .baselineOnMigrate(true)
                .baselineVersion("5")
                .locations("classpath:db/migration")
                .load();
    }

    @Bean
    public static BeanFactoryPostProcessor flywayDependencyPostProcessor() {
        return beanFactory -> {
            try {
                BeanDefinition entityManagerFactory = beanFactory.getBeanDefinition("entityManagerFactory");
                String[] dependsOn = entityManagerFactory.getDependsOn();
                if (dependsOn == null) {
                    entityManagerFactory.setDependsOn("flyway");
                } else {
                    List<String> list = new ArrayList<>(Arrays.asList(dependsOn));
                    if (!list.contains("flyway")) {
                        list.add("flyway");
                        entityManagerFactory.setDependsOn(list.toArray(new String[0]));
                    }
                }
            } catch (NoSuchBeanDefinitionException ignored) {
                // JPA not configured
            }
        };
    }
}
