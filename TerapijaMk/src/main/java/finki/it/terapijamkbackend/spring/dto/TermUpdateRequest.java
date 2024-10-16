package finki.it.terapijamkbackend.spring.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TermUpdateRequest {
    private Long userId;
    private String term;
    private String additionalInfo;
    private String status;

    public TermUpdateRequest(String userId, String term, String additionalInfo,String status) {
        this.userId = Long.parseLong(userId);
        this.term = term;
        this.additionalInfo = additionalInfo;
        this.status=status;
    }
}
