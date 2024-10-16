package finki.it.terapijamkbackend.spring.controllers;

import finki.it.terapijamkbackend.spring.dto.*;
import finki.it.terapijamkbackend.spring.dto.CarriedOutInfo;
import finki.it.terapijamkbackend.spring.entities.User;
import finki.it.terapijamkbackend.spring.exception.UserNotFoundException;
import finki.it.terapijamkbackend.spring.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping(path = "/signIn")
    public ResponseEntity<Map<String,String>> createUser(@RequestBody Map<String, String> userData){
        Map<String, String> response = new HashMap<>();
        response.put("error", "Error creating user");
       if(userService.userExists(userData.get("username"))){
           return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
       }

        try {
            String name = userData.get("name");
            String surname = userData.get("surname");
            String username = userData.get("username");
            String password = userData.get("password");
            String age = userData.get("age");
            String phone = userData.get("phone").replace("-","");

            userService.createUser(name, surname, username, password, age, phone);

            response = new HashMap<>();
            response.put("message", "User created successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/editUser")
    public ResponseEntity<User> getUser(@RequestParam String username) {
        User user = userService.getUserByUsername(username);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/getUsersByParameter")
    public ResponseEntity<List<User>> getUsersByParameter(@RequestParam String parameter,@RequestParam String filter)
    {
        List<User> users = userService.getUsersByFilter(parameter, filter);
        return ResponseEntity.ok(users);

    }


    @PostMapping("/updateUser")
    public ResponseEntity<User> updateUser(@RequestBody User updatedUser, HttpServletRequest request) {
        try {
            String oldUsername=getCookieValue(request, "username");
            User user = userService.updateUser(oldUsername, updatedUser);
            return ResponseEntity.ok(user);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    private String getCookieValue(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(cookieName)) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
    @PutMapping("/addTerm")
    public ResponseEntity<String> addTerm(@RequestBody TermUpdateRequest request)
    {
        User user=userService.getUserById(request.getUserId());
        boolean isUpdated = userService.updateUserTermList(user,request.getTerm(),request.getAdditionalInfo(),request.getStatus());
        if (isUpdated) {
            return ResponseEntity.ok("Term updated successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
    }
    @PutMapping("/carriedOut")
    public ResponseEntity<String> addTerm(@RequestBody CarriedOutUpdate request)
    {
        User user=userService.getUserById(request.getUserId());
        boolean isUpdated = userService.updateUserCarriedOutList(user,request.getTerm(),request.getAdditionalInfo(),request.getStatus(),request.getNote());
        if (isUpdated) {
            return ResponseEntity.ok("Term updated successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
    }

    @GetMapping("/blockedStatus")
    public ResponseEntity<Map<String, Boolean>> getUserAccountStatus(@RequestParam("username") String username) {
        boolean isBlocked = userService.isUserBlocked(username);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isBlocked", isBlocked);
        return ResponseEntity.ok(response);
    }
    @PutMapping("/toggleBlock")
    public ResponseEntity<ApiResponse> toggleBlockUser(@RequestParam("username") String username) {
        boolean updated = userService.toggleUserBlockStatus(username);
        if (updated) {
            return ResponseEntity.ok(new ApiResponse("User status updated"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse("User not found"));
        }
    }

    @GetMapping("/getAllIds")
    public List<Long> getAllUserIds() {
        return userService.getAllUserIds();
    }

    @GetMapping("/listAllCarriedOut")
    public List<CarriedOutInfo> getAppointmentsByUser(@RequestParam("username") String username) {
        List<CarriedOutInfo>carriedTerms=userService.findCarriedOutByUsername(username);
        return carriedTerms;
    }
    @PostMapping("/checkDifferentUser")
    public ResponseEntity<Boolean> checkDifferentUser(@RequestBody Map<String, String> userData) {
        boolean isDifferentUser = userService.checkDifferentUser(userData);
        if(isDifferentUser){
            return ResponseEntity.ok(isDifferentUser);
        }
        else{
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(isDifferentUser);
        }

    }

}


