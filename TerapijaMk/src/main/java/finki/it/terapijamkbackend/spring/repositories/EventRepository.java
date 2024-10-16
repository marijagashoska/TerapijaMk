package finki.it.terapijamkbackend.spring.repositories;

import finki.it.terapijamkbackend.spring.entities.Coupon;
import finki.it.terapijamkbackend.spring.entities.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    @Query("SELECT e FROM Event e WHERE e.title = :title")
    Optional<Event> findByTitle(String title);
}
