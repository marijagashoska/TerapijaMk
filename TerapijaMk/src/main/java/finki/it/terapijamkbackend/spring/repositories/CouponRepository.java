package finki.it.terapijamkbackend.spring.repositories;

import finki.it.terapijamkbackend.spring.entities.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long>{
    @Query("SELECT c FROM Coupon c WHERE c.title = :title")
    Optional<Coupon> findByTitle(String title);
}


