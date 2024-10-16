package finki.it.terapijamkbackend.spring.controllers;

import finki.it.terapijamkbackend.spring.dto.LoginResponse;
import finki.it.terapijamkbackend.spring.entities.User;
import finki.it.terapijamkbackend.spring.services.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import static finki.it.terapijamkbackend.spring.entities.UserRole.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping(path = "/login")
    public ResponseEntity<LoginResponse> loginUser(@RequestBody Map<String, String> userData, HttpServletResponse response) {
        LoginResponse loginResponse = new LoginResponse(false, "Invalid credentials", USER, userData.get("name"),  userData.get("surname"));

        if(userService.isUserBlocked(userData.get("username"))){
            loginResponse=new LoginResponse(false,"Blocked account",USER,userData.get("name"),  userData.get("surname"));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(loginResponse);
        }
        if (!userService.doesExist(userData.get("username"), userData.get("password"))) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(loginResponse);
        }

        try {
            User temp = userService.getUserByUsername(userData.get("username"));
            if(temp.getUserRole()== ADMIN){
                loginResponse = new LoginResponse(true, "Login successful", ADMIN, temp.getName(), temp.getSurname());
            }
            else{
                loginResponse = new LoginResponse(true, "Login successful", USER, temp.getName(), temp.getSurname());
            }

            Cookie usernameCookie = new Cookie("username", temp.getUsername());
            usernameCookie.setPath("/");
            usernameCookie.setMaxAge(600);
            response.addCookie(usernameCookie);

            Cookie roleCookie = new Cookie("role", temp.getUserRole().toString());
            roleCookie.setPath("/");
            roleCookie.setMaxAge(600);
            response.addCookie(roleCookie);

            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(loginResponse);
        }
    }
}
