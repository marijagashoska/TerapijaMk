package finki.it.terapijamkbackend.spring.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppointmentRequest {
    private String date;
    private String time;

}
