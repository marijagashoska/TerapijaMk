package finki.it.terapijamkbackend.spring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@SpringBootApplication
@EnableScheduling
public class TerapijaMkBackend {

	public static void main(String[] args) {
		SpringApplication.run(TerapijaMkBackend.class, args);
	}

}

