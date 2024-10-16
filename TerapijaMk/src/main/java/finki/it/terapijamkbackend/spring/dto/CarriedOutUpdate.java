package finki.it.terapijamkbackend.spring.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CarriedOutUpdate {
    private Long userId;
    private String term;
    private String additionalInfo;
    private String status;
    private String note;

    public CarriedOutUpdate(String userId, String term, String additionalInfo,String status,String note) {
        this.userId = Long.parseLong(userId);
        this.term = term;
        this.additionalInfo = additionalInfo;
        this.status=status;
        this.note=note;
    }
}
