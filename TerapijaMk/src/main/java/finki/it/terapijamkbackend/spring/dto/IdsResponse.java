package finki.it.terapijamkbackend.spring.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
public class IdsResponse {
    private List<Long> ids;

    public IdsResponse(List<Long> ids) {
        this.ids = ids;
    }

}

