package finki.it.terapijamkbackend.spring.controllers;

import finki.it.terapijamkbackend.spring.entities.Event;
import finki.it.terapijamkbackend.spring.services.EventService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/news")
public class EventController {
    @Autowired
    private EventService eventService;

    @PutMapping("/createEvent")
    public ResponseEntity<Event> updateEvent(@RequestBody Event eventItem) {
        if (eventItem.getTitle() == null || eventItem.getText() == null) {
            return ResponseEntity.badRequest().build();
        }
        Event createdEvent = eventService.saveEvent(eventItem);
        return ResponseEntity.ok(createdEvent);
    }
    @GetMapping("/getAllEvents")
    public ResponseEntity<List<Event>>getAllEvents(){
        List<Event> eventList=eventService.getAllEvents();
        return ResponseEntity.ok(eventList);
    }
    @DeleteMapping("/deleteEvent")
    public ResponseEntity<?>deleteEntity(@RequestParam String userId){
        try{
           eventService.deleteById(userId);
           return ResponseEntity.ok().build();
        }
        catch(EntityNotFoundException e){
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/editEvent")
    @Transactional
    public ResponseEntity<Void> editEvent(@RequestParam String identifier, @RequestBody Event newEventData) {
        Optional<Event> eventOptional = eventService.findByIdentifier(identifier);
        if (eventOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Event event = eventOptional.get();
        event.setTitle(newEventData.getTitle());
        event.setText(newEventData.getText());
        event.setImgSrc(newEventData.getImgSrc());
        eventService.saveEvent(event);

        return ResponseEntity.ok().build();
    }
}
