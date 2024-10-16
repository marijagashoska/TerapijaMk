package finki.it.terapijamkbackend.spring.dto;

import finki.it.terapijamkbackend.spring.entities.UserRole;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private boolean success;
    private String message;
    private UserRole userRole;
    private String name;
    private String surname;

    public LoginResponse(boolean success, String message, UserRole userRole,String name,String surname) {
        this.success = success;
        this.message = message;
        this.userRole = userRole;
        this.name=name;
        this.surname=surname;
    }
}
