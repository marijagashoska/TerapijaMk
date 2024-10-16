package finki.it.terapijamkbackend.spring.controllers;

import finki.it.terapijamkbackend.spring.dto.IdsResponse;
import finki.it.terapijamkbackend.spring.dto.TermsResponse;
import finki.it.terapijamkbackend.spring.entities.Request;
import finki.it.terapijamkbackend.spring.services.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/requests")
public class RequestController {
    @Autowired
    private RequestService requestService;

    @PostMapping("/book")
    public ResponseEntity<String> bookAppointment(@RequestBody Map<String, String> request, @CookieValue(value = "username", defaultValue = "") String username) {
        String term = request.get("term");
        String couponCode = request.get("couponCode");
        String medicalCondition = request.get("medicalCondition");

        try {
            requestService.bookAppointment(term, couponCode, medicalCondition,username);
            return ResponseEntity.ok("Appointment booked successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/listAll")
    public List<TermsResponse> getRequestsByUser(@RequestParam("username") String username) {
        List<Request>terms=requestService.findRequestsByUsername(username);
        return terms.stream()
                .map(term -> new TermsResponse(
                        term.getTerm(),
                        term.getUser().getName(),
                        term.getUser().getId(),
                        term.getUser().getSurname(),
                        term.getCouponCode(),
                        term.getAdditionalInfo(),
                        term.getUser().getUsername()
                ))
                .collect(Collectors.toList());
    }
    @GetMapping("/listRequests")
    public List<TermsResponse> getRequestsByTerm(@RequestParam("term") String term) {
        List<Request>terms=requestService.findRequestsByTerm(term);
        return terms.stream()
                .map(item -> new TermsResponse(
                        item.getTerm(),
                        item.getUser().getName(),
                        item.getUser().getId(),
                        item.getUser().getSurname(),
                        item.getCouponCode(),
                        item.getAdditionalInfo(),
                        item.getUser().getUsername()
                ))
                .collect(Collectors.toList());
    }


    @GetMapping("/cancelReservation")
    public ResponseEntity<String>cancelReservation(@RequestParam("username") String username,@RequestParam("term") String term){
        try{
            String success=requestService.cancelReservationById(username,term);
            if(!success.equals("False")){
                return ResponseEntity.ok("{\"success\": true, \"data\": \"" + success + "\"}");
            }
            else{
                return ResponseEntity.status(400).body("{\"success\": false, \"message\": \"Failed to cancel the reservation.\"}");
            }
        }
        catch(Exception e){
            return ResponseEntity.status(500).body("{\"success\": false, \"message\": \"An error occurred: " + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/isEmpty")
    public ResponseEntity<Boolean> isAppointmentEmpty(@RequestParam("term") String term) {
        boolean isEmpty = requestService.isEmpty(term);
        return ResponseEntity.ok(isEmpty);
    }
    @GetMapping("/removeRequest")
    public ResponseEntity<String> cleanRequest(@RequestParam("term") String term,@RequestParam("userId") String userId) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
            LocalDateTime parsedTerm = LocalDateTime.parse(term, formatter);
            String additionalInfo = requestService.findAdditionalInfoBasedOnUsernameAndTerm(userId, parsedTerm);
            return ResponseEntity.ok(additionalInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing request: " + e.getMessage());
        }
    }

    @GetMapping("/users-by-term")
    public IdsResponse getIdsByTermExcept(@RequestParam("term") String term, @RequestParam("excludedUsername") String excludedUsername) {
        List<Long> ids = requestService.getIdsByTermExcept(term, excludedUsername);
        return new IdsResponse(ids);
    }

}
