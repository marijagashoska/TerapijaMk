package finki.it.terapijamkbackend.spring.services;

import finki.it.terapijamkbackend.spring.entities.Event;
import finki.it.terapijamkbackend.spring.repositories.EventRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public Event saveEvent(Event newsItem) {
        return eventRepository.save(newsItem);
    }

    public List<Event> getAllEvents(){
        return eventRepository.findAll();
    }
    public void deleteById(String id) {
        Long temp=Long.parseLong(id);
        if (eventRepository.existsById(temp)) {
            eventRepository.deleteById(temp);
        } else {
            throw new EntityNotFoundException("Entity with id " + id + " not found");
        }
    }
    public Optional<Event> findByIdentifier(String identifier) {
        return eventRepository.findByTitle(identifier);
    }
}
