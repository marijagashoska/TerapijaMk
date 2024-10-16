package finki.it.terapijamkbackend.spring.repositories;

import finki.it.terapijamkbackend.spring.dto.CarriedOutInfo;
import finki.it.terapijamkbackend.spring.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.phone = :phone")
    boolean existsByPhone(String phone);

    Optional<User> findByUsername(String username);
    Optional<User> findById(Long userId);

    @Query("SELECT u FROM User u WHERE u.userRole = 'USER'")
    List<User> findAll();

    @Query("SELECT u FROM User u WHERE u.locked = false AND u.userRole = 'USER'")
    List<User> findActive();
    @Query("SELECT u FROM User u WHERE u.locked = true AND u.userRole = 'USER'")
    List<User> findBlocked();
    @Query("SELECT u FROM User u WHERE u.name LIKE %:name% AND u.userRole = 'USER'")
    List<User> findByName(@Param("name") String name);
    @Query("SELECT u FROM User u WHERE u.surname LIKE %:surname% AND u.userRole = 'USER'")
    List<User> findBySurname(@Param("surname") String surname);

    @Query("SELECT u FROM User u WHERE u.userRole = 'USER' AND YEAR(CURRENT_DATE()) - YEAR(u.dateBirth) = :age AND (MONTH(CURRENT_DATE()) > MONTH(u.dateBirth) OR (MONTH(CURRENT_DATE()) = MONTH(u.dateBirth) AND DAY(CURRENT_DATE()) >= DAY(u.dateBirth))) ")
    List<User> findByAge(@Param("age") int age);

    @Query("SELECT u.id FROM User u")
    List<Long> findAllUserIds();
    @Query("SELECT u.carriedOut FROM User u WHERE u.id = :userId")
    List<CarriedOutInfo> findCarriedOutByUserId(@Param("userId") Long userId);
}