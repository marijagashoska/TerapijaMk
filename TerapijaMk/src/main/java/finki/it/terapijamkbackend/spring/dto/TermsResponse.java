package finki.it.terapijamkbackend.spring.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TermsResponse {
    private LocalDateTime term;
    private String name;
    private String surname;
    private String couponCode;
    private String additionalInfo;
    private String username;
    private Long userId;

    public TermsResponse(LocalDateTime term, String name,Long userId, String surname, String couponCode, String additionalInfo, String username) {
        this.term = term;
        this.name = name;
        this.surname = surname;
        this.couponCode = couponCode;
        this.additionalInfo = additionalInfo;
        this.username = username;
        this.userId=userId;
    }
}
